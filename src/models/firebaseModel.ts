import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Feedback {
  id: string;
  name: string;
  email: string;
  question: string;
  description: string;
  questionType: 'multiple-choice' | 'rating' | 'text';
  options?: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  ratingScale?: {
    min: number;
    max: number;
    step: number;
  };
  createdAt?: any;
  updatedAt?: any;
  createdBy: string;
  votes: {
    voterName: string;
    selectedOption?: string;
    rating?: number;
    textResponse?: string;
    userId?: string;
  }[];
  submittedBy: string[];
}

// Function to retrieve feedbacks
export const fetchFeedbacksFromDb = async (userId: string): Promise<{ createdFeedbacks: Feedback[]; votedFeedbacks: Feedback[] }> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'feedbacks'));
    const allFeedbacks = querySnapshot.docs.map((feedbackDoc) => ({
      id: feedbackDoc.id,
      ...feedbackDoc.data(),
    })) as Feedback[];

    const createdFeedbacks = allFeedbacks.filter((feedback) => feedback.createdBy === userId);
    const votedFeedbacks = allFeedbacks.filter((feedback) => 
      feedback.votes.some((vote) => vote.userId === userId)
    );

    return { createdFeedbacks, votedFeedbacks };
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};

// Function to delete feedback
export const deleteFeedbackFromDb = async (feedbackId: string, userId: string): Promise<void> => {
  try {
    const feedbackRef = doc(db, 'feedbacks', feedbackId);
    const feedbackDoc = await getDoc(feedbackRef);
    
    if (!feedbackDoc.exists()) {
      throw new Error('Feedback not found');
    }

    const feedback = feedbackDoc.data() as Feedback;
    if (feedback.createdBy !== userId) {
      throw new Error('You can only delete your own feedbacks');
    }

    await deleteDoc(feedbackRef);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

// Function to add feedback
export const addFeedbackToDb = async (formData: any, userId: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'feedbacks'), {
      ...formData,
      createdAt: serverTimestamp(),
      createdBy: userId,
      votes: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
};

// Function to fetch a single feedback by ID
export const fetchFeedbackFromDb = async (id: string): Promise<Feedback> => {
  try {
    const feedbackDoc = await getDoc(doc(db, 'feedbacks', id));
    if (!feedbackDoc.exists()) {
      throw new Error('Feedback not found');
    }
    return feedbackDoc.data() as Feedback;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

// Function to update feedback
export const updateFeedbackInDb = async (id: string, updatedData: any): Promise<void> => {
  try {
    const feedbackRef = doc(db, 'feedbacks', id);
    await updateDoc(feedbackRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};
