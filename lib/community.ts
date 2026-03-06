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
} from 'firebase/firestore';
import { db } from './firebase';

// ===== TYPES =====

export interface CommunityQuestion {
  id: string;
  userId: string;
  userName: string;
  userBadge: string;
  cropTag: string;
  cropEmoji: string;
  questionText: string;
  description: string;
  imageUrl: string | null;
  upvotes: number;
  repliesCount: number;
  createdAt: Timestamp;
}

export interface CommunityReply {
  id: string;
  userId: string;
  userName: string;
  userBadge: string;
  replyText: string;
  imageUrl: string | null;
  upvotes: number;
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

const getQuestionsRef = () => collection(db, QUESTIONS_COLLECTION);
const getQuestionRef = (questionId: string) => doc(db, QUESTIONS_COLLECTION, questionId);
const getRepliesRef = (questionId: string) =>
  collection(db, QUESTIONS_COLLECTION, questionId, 'replies');

// ===== ADD QUESTION =====

/**
 * Add a new community question to Firestore
 */
export async function addCommunityQuestion(
  userId: string,
  userName: string,
  userBadge: string,
  questionData: QuestionInput
): Promise<string> {
  try {
    const questionRef = await addDoc(getQuestionsRef(), {
      userId,
      userName,
      userBadge,
      cropTag: questionData.cropTag,
      cropEmoji: questionData.cropEmoji,
      questionText: questionData.questionText,
      description: questionData.description,
      imageUrl: questionData.imageUrl || null,
      upvotes: 0,
      repliesCount: 0,
      createdAt: serverTimestamp(),
    });

    return questionRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error('Failed to post question');
  }
}

// ===== ADD REPLY =====

/**
 * Add a reply to a question and increment reply count
 */
export async function addReply(
  questionId: string,
  userId: string,
  userName: string,
  userBadge: string,
  replyData: ReplyInput
): Promise<string> {
  try {
    // Add reply to subcollection
    const replyRef = await addDoc(getRepliesRef(questionId), {
      userId,
      userName,
      userBadge,
      replyText: replyData.replyText,
      imageUrl: replyData.imageUrl || null,
      upvotes: 0,
      createdAt: serverTimestamp(),
    });

    // Increment reply count on question
    await updateDoc(getQuestionRef(questionId), {
      repliesCount: increment(1),
    });

    return replyRef.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw new Error('Failed to post reply');
  }
}

// ===== UPVOTE FUNCTIONS =====

/**
 * Upvote a question
 */
export async function upvoteQuestion(questionId: string): Promise<void> {
  try {
    await updateDoc(getQuestionRef(questionId), {
      upvotes: increment(1),
    });
  } catch (error) {
    console.error('Error upvoting question:', error);
    throw new Error('Failed to upvote question');
  }
}

/**
 * Remove upvote from a question
 */
export async function removeUpvoteQuestion(questionId: string): Promise<void> {
  try {
    await updateDoc(getQuestionRef(questionId), {
      upvotes: increment(-1),
    });
  } catch (error) {
    console.error('Error removing upvote from question:', error);
    throw new Error('Failed to remove upvote');
  }
}

/**
 * Upvote a reply
 */
export async function upvoteReply(questionId: string, replyId: string): Promise<void> {
  try {
    const replyRef = doc(db, QUESTIONS_COLLECTION, questionId, 'replies', replyId);
    await updateDoc(replyRef, {
      upvotes: increment(1),
    });
  } catch (error) {
    console.error('Error upvoting reply:', error);
    throw new Error('Failed to upvote reply');
  }
}

/**
 * Remove upvote from a reply
 */
export async function removeUpvoteReply(questionId: string, replyId: string): Promise<void> {
  try {
    const replyRef = doc(db, QUESTIONS_COLLECTION, questionId, 'replies', replyId);
    await updateDoc(replyRef, {
      upvotes: increment(-1),
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
