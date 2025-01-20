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
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  createdAt?: any;
  updatedAt?: any;
  votes: {
    voterName: string;
    selectedOption: string;
  }[];
}

// Function to retrieve feedbacks
export const fetchFeedbacksFromDb = async (): Promise<Feedback[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'feedbacks'));
    return querySnapshot.docs.map((feedbackDoc) => ({
      id: feedbackDoc.id,
      ...feedbackDoc.data(),
    })) as Feedback[];
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};

// Function to delete feedback
export const deleteFeedbackFromDb = async (feedbackId: string): Promise<void> => {
  try {
    const feedbackRef = doc(db, 'feedbacks', feedbackId);
    await deleteDoc(feedbackRef);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

// Function to add feedback
export const addFeedbackToDb = async (formData: any): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'feedbacks'), {
      ...formData,
      createdAt: serverTimestamp(),
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
