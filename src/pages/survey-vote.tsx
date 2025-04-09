import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  TextField,
  Slider,
  Rating,
} from '@mui/material';
import { db } from '../firebase';
import type { Feedback } from '../models/firebaseModel';
import { useAuth } from '../contexts/auth-context';

export default function SurveyVote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<Feedback | null>(null);
  const [voterName, setVoterName] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyDoc = await getDoc(doc(db, 'feedbacks', id!));
        if (surveyDoc.exists()) {
          const surveyData = surveyDoc.data() as Feedback;
          setSurvey(surveyData);
          
          // Check if user has already submitted
          if (user && surveyData.submittedBy?.includes(user.uid)) {
            setHasSubmitted(true);
            toast.info('You have already submitted a response to this survey.');
          }
        } else {
          toast.error('Survey not found!');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
        toast.error('Error loading survey.');
      }
    };

    fetchSurvey();
  }, [id, navigate, user]);

  const handleVote = async () => {
    if (!user) {
      toast.error('Please log in to submit a response.');
      return;
    }

    if (hasSubmitted) {
      toast.error('You have already submitted a response to this survey.');
      return;
    }

    if (!voterName) {
      toast.error('Please enter your name.');
      return;
    }

    if (survey?.questionType === 'multiple-choice' && !selectedOption) {
      toast.error('Please select an option.');
      return;
    }

    if (survey?.questionType === 'rating' && rating === null) {
      toast.error('Please provide a rating.');
      return;
    }

    if (survey?.questionType === 'text' && !textResponse) {
      toast.error('Please provide a response.');
      return;
    }

    try {
      const voteData = {
        voterName,
        userId: user.uid,
        ...(survey?.questionType === 'multiple-choice' && { selectedOption }),
        ...(survey?.questionType === 'rating' && { rating }),
        ...(survey?.questionType === 'text' && { textResponse }),
      };

      await updateDoc(doc(db, 'feedbacks', id!), {
        votes: arrayUnion(voteData),
        submittedBy: arrayUnion(user.uid),
      });
      
      setHasSubmitted(true);
      toast.success('Thank you for your response!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Error submitting your response. Please try again.');
    }
  };

  if (!survey) return <Typography>Loading...</Typography>;

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: 'auto',
        mt: 5,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h4" gutterBottom>
        {survey.question}
      </Typography>
      <Box sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: survey.description }} />

      {survey.questionType === 'multiple-choice' && (
        <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
          {Object.values(survey.options || {}).map((option, index) => (
            <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
          ))}
        </RadioGroup>
      )}

      {survey.questionType === 'rating' && (
        <Box sx={{ my: 2 }}>
          <Typography gutterBottom>Rating</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            max={survey.ratingScale?.max || 5}
            precision={survey.ratingScale?.step || 1}
          />
        </Box>
      )}

      {survey.questionType === 'text' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Response"
          value={textResponse}
          onChange={(e) => setTextResponse(e.target.value)}
          sx={{ my: 2 }}
        />
      )}

      <TextField
        fullWidth
        label="Your Full Name"
        value={voterName}
        onChange={(e) => setVoterName(e.target.value)}
        sx={{ my: 2 }}
      />
      <Button 
        variant="contained" 
        onClick={handleVote} 
        sx={{ mt: 2 }}
        disabled={hasSubmitted}
      >
        {hasSubmitted ? 'Already Submitted' : 'Submit'}
      </Button>
    </Box>
  );
}
