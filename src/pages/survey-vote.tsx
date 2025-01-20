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
} from '@mui/material';
import { db } from '../firebase';

export default function SurveyVote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [voterName, setVoterName] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyDoc = await getDoc(doc(db, 'feedbacks', id!));
        if (surveyDoc.exists()) {
          setSurvey(surveyDoc.data());
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
  }, [id, navigate]);

  const handleVote = async () => {
    if (!voterName || !selectedOption) {
      toast.error('Please enter your name and select an option.');
      return;
    }

    try {
      await updateDoc(doc(db, 'feedbacks', id!), {
        votes: arrayUnion({ voterName, selectedOption }),
      });
      toast.success('Thank you for voting!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Error submitting your vote. Please try again.');
    }
  };

  if (!survey) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {survey.question}
      </Typography>
      <Box sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: survey.description }} />
      <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        {[survey.option1, survey.option2, survey.option3, survey.option4].map((option, index) => (
          <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
        ))}
      </RadioGroup>
      <TextField
        fullWidth
        label="Your Full Name"
        value={voterName}
        onChange={(e) => setVoterName(e.target.value)}
        sx={{ my: 2 }}
      />
      <Button variant="contained" onClick={handleVote}>
        Save
      </Button>
    </Box>
  );
}
