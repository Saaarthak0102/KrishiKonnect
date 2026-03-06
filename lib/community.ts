import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
export interface CommunityQuestion {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  crop?: string;
  cropTag: string;
  cropTag_en?: string;
  cropTag_hi?: string;
  cropEmoji: string;
  questionText: string;
  title_en?: string;
  title_hi?: string;
  description: string;
  upvotes: number;
  upvotedBy: string[];
  replies?: number;
  repliesCount: number;
  createdAt: Date;
  lastReplyAt: Date | null;
}

export interface CommunityReply {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  replyText: string;
  parentReplyId: string | null;
  upvotes: number;
  upvotedBy: string[];
  imageUrl?: string | null;
  createdAt: Date;
}

export interface CachedQuestion {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  crop?: string;
  cropTag: string;
  cropTag_en?: string;
  cropTag_hi?: string;
  cropEmoji: string;
  questionText: string;
  title_en?: string;
  title_hi?: string;
  description: string;
  upvotes: number;
  upvotedBy: string[];
  replies?: number;
  repliesCount: number;
  createdAt: Date;
  lastReplyAt: Date | null;
}

// Helper to convert Firestore timestamp to Date
function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  return null;
}

function parseQuestion(docId: string, data: any): CommunityQuestion {
  const createdAt = timestampToDate(data.createdAt) || new Date();
  const fallbackTitle = data.title_en || data.title_hi || data.questionText || '';

  return {
    id: docId,
    userId: data.userId,
    userName: data.userName,
    userLocation: data.userLocation,
    crop: data.crop || data.cropTag || '',
    cropTag: data.cropTag || data.crop || '',
    cropTag_en: data.cropTag_en || data.cropTag || data.crop || '',
    cropTag_hi: data.cropTag_hi || data.cropTag || data.crop || '',
    cropEmoji: data.cropEmoji || '🌾',
    questionText: data.questionText || fallbackTitle,
    title_en: data.title_en || data.questionText || fallbackTitle,
    title_hi: data.title_hi || data.questionText || fallbackTitle,
    description: data.description || '',
    upvotes: data.upvotes || 0,
    upvotedBy: data.upvotedBy || [],
    replies: data.replies || data.repliesCount || 0,
    repliesCount: data.repliesCount || data.replies || 0,
    createdAt,
    lastReplyAt: timestampToDate(data.lastReplyAt),
  };
}

/**
 * Subscribe to the feed cache (latest 50 questions)
 * This reduces Firestore reads from 50 to 1 per page load
 */
export function subscribeToFeedCache(
  onUpdate: (questions: CachedQuestion[]) => void,
  onError?: (error: Error) => void
): () => void {
  const feedDocRef = doc(db, 'community_feed', 'latest_questions');

  return onSnapshot(
    feedDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const questions = (data?.questions || [])
          .map((q: any) => parseQuestion(q.id, q))
          .sort((a: CommunityQuestion, b: CommunityQuestion) => b.createdAt.getTime() - a.createdAt.getTime()) as CachedQuestion[];
        
        onUpdate(questions);
      } else {
        // No feed cache exists yet, return empty array
        onUpdate([]);
      }
    },
    (error) => {
      console.error('Error subscribing to feed cache:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe to all community questions (fallback if feed cache doesn't exist)
 * Use this for the "My Crops" and "My State" tabs where we need full access
 */
export function subscribeToQuestions(
  onUpdate: (questions: CommunityQuestion[]) => void,
  onError?: (error: Error) => void,
  limitCount: number = 50
): () => void {
  const questionsRef = collection(db, 'community_questions');
  const q = query(questionsRef, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const questions: CommunityQuestion[] = snapshot.docs
        .map((questionDoc) => parseQuestion(questionDoc.id, questionDoc.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      onUpdate(questions);
    },
    (error) => {
      console.error('Error subscribing to questions:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Add a new community question
 */
export async function addCommunityQuestion(
  questionData: {
    userId: string;
    userName: string;
    userLocation: string;
    crop?: string;
    cropTag: string;
    cropTag_en?: string;
    cropTag_hi?: string;
    cropEmoji: string;
    questionText: string;
    title_en?: string;
    title_hi?: string;
    description?: string;
  }
): Promise<string> {
  try {
    const questionsRef = collection(db, 'community_questions');
    const newQuestion = {
      ...questionData,
      crop: questionData.crop || questionData.cropTag,
      cropTag_en: questionData.cropTag_en || questionData.cropTag,
      cropTag_hi: questionData.cropTag_hi || questionData.cropTag,
      title_en: questionData.title_en || questionData.questionText,
      title_hi: questionData.title_hi || questionData.questionText,
      description: questionData.description || '',
      upvotes: 0,
      upvotedBy: [],
      replies: 0,
      repliesCount: 0,
      createdAt: serverTimestamp(),
      lastReplyAt: null,
    };

    // Add to main collection
    const docRef = await addDoc(questionsRef, newQuestion);

    // Update feed cache
    await updateFeedCache(docRef.id, { ...newQuestion, createdAt: new Date(), lastReplyAt: null });

    return docRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
}

/**
 * Subscribe to the globally latest community question.
 */
export function subscribeToLatestQuestion(
  onUpdate: (question: CommunityQuestion | null) => void,
  onError?: (error: Error) => void
): () => void {
  const questionsRef = collection(db, 'community_questions');
  const latestQuestionQuery = query(questionsRef, orderBy('createdAt', 'desc'), limit(1));

  return onSnapshot(
    latestQuestionQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }

      const latestDoc = snapshot.docs[0];
      onUpdate(parseQuestion(latestDoc.id, latestDoc.data()));
    },
    (error) => {
      console.error('Error subscribing to latest question:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Update the feed cache with a new or updated question
 */
async function updateFeedCache(questionId: string, questionData: any): Promise<void> {
  try {
    const feedDocRef = doc(db, 'community_feed', 'latest_questions');
    const feedDoc = await getDoc(feedDocRef);

    let questions: any[] = [];
    if (feedDoc.exists()) {
      questions = feedDoc.data()?.questions || [];
    }

    // Remove old version if exists
    questions = questions.filter((q) => q.id !== questionId);

    // Add new version at the beginning
    questions.unshift({
      id: questionId,
      ...questionData,
    });

    // Keep only latest 50 questions
    questions = questions.slice(0, 50);

    // Update feed cache
    await setDoc(feedDocRef, { questions });
  } catch (error) {
    console.error('Error updating feed cache:', error);
    // Don't throw - feed cache is optional optimization
  }
}

/**
 * Subscribe to replies for a specific question
 */
export function subscribeToReplies(
  questionId: string,
  onUpdate: (replies: CommunityReply[]) => void,
  onError?: (error: Error) => void
): () => void {
  const repliesRef = collection(db, 'community_questions', questionId, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const replies: CommunityReply[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        replies.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userLocation: data.userLocation,
          replyText: data.replyText,
          parentReplyId: data.parentReplyId || null,
          upvotes: data.upvotes || 0,
          upvotedBy: data.upvotedBy || [],
          imageUrl: data.imageUrl || null,
          createdAt: timestampToDate(data.createdAt) || new Date(),
        });
      });
      onUpdate(replies);
    },
    (error) => {
      console.error('Error subscribing to replies:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Add a reply to a question or another reply
 */
export async function addReply(
  questionId: string,
  replyData: {
    userId: string;
    userName: string;
    userLocation: string;
    replyText: string;
    parentReplyId?: string | null;
  }
): Promise<string> {
  try {
    const repliesRef = collection(db, 'community_questions', questionId, 'replies');
    const newReply = {
      ...replyData,
      parentReplyId: replyData.parentReplyId || null,
      upvotes: 0,
      upvotedBy: [],
      createdAt: serverTimestamp(),
    };

    // Add reply to subcollection
    const docRef = await addDoc(repliesRef, newReply);

    // Update question's reply count and lastReplyAt
    const questionRef = doc(db, 'community_questions', questionId);
    await updateDoc(questionRef, {
      replies: increment(1),
      repliesCount: increment(1),
      lastReplyAt: serverTimestamp(),
    });

    // Update feed cache
    const questionDoc = await getDoc(questionRef);
    if (questionDoc.exists()) {
      const questionData = questionDoc.data();
      await updateFeedCache(questionId, {
        ...questionData,
        repliesCount: (questionData.repliesCount || 0) + 1,
        lastReplyAt: new Date(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
}

/**
 * Upvote a question
 */
export async function upvoteQuestion(questionId: string, userId: string): Promise<void> {
  try {
    const questionRef = doc(db, 'community_questions', questionId);
    await updateDoc(questionRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error upvoting question:', error);
    throw error;
  }
}

/**
 * Remove upvote from a question
 */
export async function removeUpvoteQuestion(questionId: string, userId: string): Promise<void> {
  try {
    const questionRef = doc(db, 'community_questions', questionId);
    await updateDoc(questionRef, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error removing upvote from question:', error);
    throw error;
  }
}

/**
 * Upvote a reply
 */
export async function upvoteReply(questionId: string, replyId: string, userId: string): Promise<void> {
  try {
    const replyRef = doc(db, 'community_questions', questionId, 'replies', replyId);
    await updateDoc(replyRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error upvoting reply:', error);
    throw error;
  }
}

/**
 * Remove upvote from a reply
 */
export async function removeUpvoteReply(questionId: string, replyId: string, userId: string): Promise<void> {
  try {
    const replyRef = doc(db, 'community_questions', questionId, 'replies', replyId);
    await updateDoc(replyRef, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error removing upvote from reply:', error);
    throw error;
  }
}

/**
 * Delete a question (and all its replies)
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    const questionRef = doc(db, 'community_questions', questionId);
    await deleteDoc(questionRef);

    // Remove from feed cache
    const feedDocRef = doc(db, 'community_feed', 'latest_questions');
    const feedDoc = await getDoc(feedDocRef);
    if (feedDoc.exists()) {
      let questions = feedDoc.data()?.questions || [];
      questions = questions.filter((q: any) => q.id !== questionId);
      await setDoc(feedDocRef, { questions });
    }
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

/**
 * Delete a reply
 */
export async function deleteReply(questionId: string, replyId: string): Promise<void> {
  try {
    const replyRef = doc(db, 'community_questions', questionId, 'replies', replyId);
    await deleteDoc(replyRef);

    // Update question's reply count
    const questionRef = doc(db, 'community_questions', questionId);
    await updateDoc(questionRef, {
      replies: increment(-1),
      repliesCount: increment(-1),
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
}
