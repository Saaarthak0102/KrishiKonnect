import {
  collection,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  startAfter,
  getDocs,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

// ===== TYPES =====

export interface CommunityQuestion {
  id: string;
  userId: string;
  userName: string;
  userBadge: string;
  userLocation: string;
  cropTag: string;
  cropEmoji: string;
  questionText: string;
  description: string;
  imageUrl: string | null;
  upvotes: number;
  upvotedBy: string[];
  repliesCount: number;
  createdAt: Timestamp;
}

export interface CachedQuestion {
  id: string;
  userId: string;
  userName: string;
  userBadge: string;
  userLocation: string;
  cropTag: string;
  cropEmoji: string;
  questionText: string;
  description: string;
  imageUrl: string | null;
  upvotes: number;
  upvotedBy: string[];
  repliesCount: number;
  createdAt: Timestamp;
}

export interface FeedCache {
  questions: CachedQuestion[];
}

export interface CommunityReply {
  id: string;
  userId: string;
  userName: string;
  userBadge: string;
  replyText: string;
  imageUrl: string | null;
  upvotes: number;
  upvotedBy: string[];
  createdAt: Timestamp;
}

export interface QuestionInput {
  questionText: string;
  description: string;
  cropTag: string;
  cropEmoji: string;
  imageUrl?: string | null;
}

export interface ReplyInput {
  replyText: string;
  imageUrl?: string | null;
}

// ===== COLLECTION REFERENCES =====

const QUESTIONS_COLLECTION = 'community_questions';
const FEED_CACHE_COLLECTION = 'community_feed';
const FEED_CACHE_DOC = 'latest_questions';

const getQuestionsRef = () => collection(db, QUESTIONS_COLLECTION);
const getQuestionRef = (questionId: string) => doc(db, QUESTIONS_COLLECTION, questionId);
const getRepliesRef = (questionId: string) =>
  collection(db, QUESTIONS_COLLECTION, questionId, 'replies');

// Feed cache references
const getFeedCacheRef = () => doc(db, FEED_CACHE_COLLECTION, FEED_CACHE_DOC);

// ===== FEED CACHE UTILITIES =====

/**
 * Helper function to update a specific field of a question in the feed cache
 * Finds the question by ID and updates the field
 */
async function updateFeedCacheQuestionField(
  questionId: string,
  updateData: { upvotes?: number; repliesCount?: number }
): Promise<void> {
  try {
    const feedRef = getFeedCacheRef();
    const feedDoc = await getDoc(feedRef);

    if (!feedDoc.exists()) {
      return; // Cache doesn't exist yet, nothing to update
    }

    const feedData = feedDoc.data() as FeedCache;
    const questions = feedData.questions || [];

    // Find and update the question in the cache
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          upvotes: updateData.upvotes !== undefined ? updateData.upvotes : q.upvotes,
          repliesCount: updateData.repliesCount !== undefined ? updateData.repliesCount : q.repliesCount,
        };
      }
      return q;
    });

    // Only write if we found and updated the question
    if (updatedQuestions.some((q) => q.id === questionId)) {
      await updateDoc(feedRef, { questions: updatedQuestions });
    }
  } catch (error) {
    console.error('Error updating feed cache question field:', error);
    // Don't throw - the cache update failure shouldn't break the main operation
  }
}

// ===== ADD QUESTION =====

/**
 * Add a new community question to Firestore and update the feed cache
 */
export async function addCommunityQuestion(
  userId: string,
  userName: string,
  userBadge: string,
  questionData: QuestionInput
): Promise<string> {
  try {
    // Fetch user's location from their profile
    let userLocation = 'Unknown Location';
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const village = userData.village || '';
        const state = userData.state || '';
        userLocation = [village, state].filter(Boolean).join(', ') || 'Unknown Location';
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Continue with default location if fetch fails
    }

    // Step 1: Add the question to community_questions collection
    const questionRef = await addDoc(getQuestionsRef(), {
      userId,
      userName,
      userBadge,
      userLocation,
      cropTag: questionData.cropTag,
      cropEmoji: questionData.cropEmoji,
      questionText: questionData.questionText,
      description: questionData.description,
      imageUrl: questionData.imageUrl || null,
      upvotes: 0,
      upvotedBy: [],
      repliesCount: 0,
      createdAt: serverTimestamp(),
    });

    // Step 2: Get the new question data with ID for feed cache
    const newQuestion: CachedQuestion = {
      id: questionRef.id,
      userId,
      userName,
      userBadge,
      userLocation,
      cropTag: questionData.cropTag,
      cropEmoji: questionData.cropEmoji,
      questionText: questionData.questionText,
      description: questionData.description,
      imageUrl: questionData.imageUrl || null,
      upvotes: 0,
      upvotedBy: [],
      repliesCount: 0,
      createdAt: Timestamp.now(),
    };

    // Step 3: Update feed cache
    const feedRef = getFeedCacheRef();
    const feedDoc = await getDoc(feedRef);

    if (feedDoc.exists()) {
      // Cache exists - prepend new question and keep only latest 20
      const existingQuestions = feedDoc.data().questions || [];
      const updatedQuestions = [newQuestion, ...existingQuestions].slice(0, 20);
      await updateDoc(feedRef, { questions: updatedQuestions });
    } else {
      // Cache doesn't exist - create it with the new question
      await setDoc(feedRef, {
        questions: [newQuestion],
      });
    }

    return questionRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error('Failed to post question');
  }
}

// ===== ADD REPLY =====

/**
 * Add a reply to a question and increment reply count
 * Also updates the feed cache if the question is in the latest 20
 */
export async function addReply(
  questionId: string,
  userId: string,
  userName: string,
  userBadge: string,
  replyData: ReplyInput
): Promise<string> {
  try {
    // Get current reply count
    const questionRef = getQuestionRef(questionId);
    const questionSnap = await getDoc(questionRef);
    const currentRepliesCount = questionSnap.exists() ? (questionSnap.data().repliesCount || 0) : 0;
    const newRepliesCount = currentRepliesCount + 1;

    // Add reply to subcollection
    const replyRef = await addDoc(getRepliesRef(questionId), {
      userId,
      userName,
      userBadge,
      replyText: replyData.replyText,
      imageUrl: replyData.imageUrl || null,
      upvotes: 0,
      upvotedBy: [],
      createdAt: serverTimestamp(),
    });

    // Increment reply count on question
    await updateDoc(questionRef, {
      repliesCount: increment(1),
    });

    // Update feed cache if question is in it
    await updateFeedCacheQuestionField(questionId, { repliesCount: newRepliesCount });

    return replyRef.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw new Error('Failed to post reply');
  }
}

// ===== UPVOTE FUNCTIONS =====

/**
 * Upvote a question
 * Note: The feed cache is not updated for upvotes as users can view the full question
 * for the most up-to-date count. Focus feed cache updates on content changes (replies).
 */
export async function upvoteQuestion(questionId: string, userId: string): Promise<void> {
  try {
    const questionRef = getQuestionRef(questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      throw new Error('Question not found');
    }

    const upvotedBy = (questionSnap.data().upvotedBy || []) as string[];
    if (upvotedBy.includes(userId)) {
      return;
    }

    await updateDoc(questionRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error upvoting question:', error);
    throw new Error('Failed to upvote question');
  }
}

/**
 * Remove upvote from a question
 */
export async function removeUpvoteQuestion(questionId: string, userId: string): Promise<void> {
  try {
    await updateDoc(getQuestionRef(questionId), {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error removing upvote from question:', error);
    throw new Error('Failed to remove upvote');
  }
}

/**
 * Upvote a reply
 */
export async function upvoteReply(
  questionId: string,
  replyId: string,
  userId: string
): Promise<void> {
  try {
    const replyRef = doc(db, QUESTIONS_COLLECTION, questionId, 'replies', replyId);
    const replySnap = await getDoc(replyRef);

    if (!replySnap.exists()) {
      throw new Error('Reply not found');
    }

    const upvotedBy = (replySnap.data().upvotedBy || []) as string[];
    if (upvotedBy.includes(userId)) {
      return;
    }

    await updateDoc(replyRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error upvoting reply:', error);
    throw new Error('Failed to upvote reply');
  }
}

/**
 * Remove upvote from a reply
 */
export async function removeUpvoteReply(
  questionId: string,
  replyId: string,
  userId: string
): Promise<void> {
  try {
    const replyRef = doc(db, QUESTIONS_COLLECTION, questionId, 'replies', replyId);
    await updateDoc(replyRef, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error removing upvote from reply:', error);
    throw new Error('Failed to remove upvote');
  }
}

// ===== REAL-TIME LISTENERS =====

/**
 * Subscribe to real-time questions feed
 * Returns unsubscribe function
 */
export function subscribeToQuestions(
  onUpdate: (questions: CommunityQuestion[]) => void,
  limitCount: number = 20
): () => void {
  const q = query(
    getQuestionsRef(),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const questions: CommunityQuestion[] = [];
      snapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data(),
        } as CommunityQuestion);
      });
      onUpdate(questions);
    },
    (error) => {
      console.error('Error in questions subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time replies for a question
 * Returns unsubscribe function
 */
export function subscribeToReplies(
  questionId: string,
  onUpdate: (replies: CommunityReply[]) => void
): () => void {
  const q = query(getRepliesRef(questionId), orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const replies: CommunityReply[] = [];
      snapshot.forEach((doc) => {
        replies.push({
          id: doc.id,
          ...doc.data(),
        } as CommunityReply);
      });
      onUpdate(replies);
    },
    (error) => {
      console.error('Error in replies subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to the cached feed from community_feed/latest_questions
 * This reads from a single cached document instead of loading 20+ documents
 * Drastically reduces Firestore reads from ~20 to 1
 * Returns unsubscribe function
 */
export function subscribeToFeedCache(
  onUpdate: (questions: CachedQuestion[]) => void
): () => void {
  const feedRef = getFeedCacheRef();

  const unsubscribe = onSnapshot(
    feedRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const feedData = snapshot.data() as FeedCache;
        onUpdate(feedData.questions || []);
      } else {
        // If cache doesn't exist yet, return empty array
        onUpdate([]);
      }
    },
    (error) => {
      console.error('Error in feed cache subscription:', error);
    }
  );

  return unsubscribe;
}

// ===== PAGINATION SUPPORT =====

/**
 * Load more questions with pagination
 */
export async function loadMoreQuestions(
  lastDoc: any,
  limitCount: number = 20
): Promise<CommunityQuestion[]> {
  try {
    const q = query(
      getQuestionsRef(),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const questions: CommunityQuestion[] = [];
    
    snapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data(),
      } as CommunityQuestion);
    });

    return questions;
  } catch (error) {
    console.error('Error loading more questions:', error);
    throw new Error('Failed to load more questions');
  }
}
