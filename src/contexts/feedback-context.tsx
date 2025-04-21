import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Feedback, fetchFeedbacksFromDb, addFeedbackToDb, updateFeedbackInDb, deleteFeedbackFromDb, fetchFeedbackFromDb } from '../models/firebaseModel';
import { useAuth } from './auth-context';

interface FeedbackContextType {
  createdFeedbacks: Feedback[];
  votedFeedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  addFeedback: (formData: any) => Promise<string>;
  updateFeedback: (id: string, updatedData: any) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  getFeedback: (id: string) => Promise<Feedback>;
  refreshFeedbacks: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [createdFeedbacks, setCreatedFeedbacks] = useState<Feedback[]>([]);
  const [votedFeedbacks, setVotedFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshFeedbacks = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const { createdFeedbacks: created, votedFeedbacks: voted } = await fetchFeedbacksFromDb(user.uid);
      setCreatedFeedbacks(created);
      setVotedFeedbacks(voted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching feedbacks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFeedbacks();
  }, [refreshFeedbacks]);

  const addFeedback = useCallback(async (formData: any) => {
    if (!user) throw new Error('User must be logged in to add feedback');
    const feedbackId = await addFeedbackToDb(formData, user.uid);
    await refreshFeedbacks();
    return feedbackId;
  }, [user, refreshFeedbacks]);

  const updateFeedback = useCallback(async (id: string, updatedData: any) => {
    if (!user) throw new Error('User must be logged in to update feedback');
    await updateFeedbackInDb(id, updatedData);
    await refreshFeedbacks();
  }, [user, refreshFeedbacks]);

  const deleteFeedback = useCallback(async (id: string) => {
    if (!user) throw new Error('User must be logged in to delete feedback');
    await deleteFeedbackFromDb(id, user.uid);
    await refreshFeedbacks();
  }, [user, refreshFeedbacks]);

  const getFeedback = useCallback((id: string) => fetchFeedbackFromDb(id), []);

  const value = useMemo(() => ({
    createdFeedbacks,
    votedFeedbacks,
    loading,
    error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    refreshFeedbacks,
  }), [
    createdFeedbacks,
    votedFeedbacks,
    loading,
    error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    refreshFeedbacks,
  ]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}; 