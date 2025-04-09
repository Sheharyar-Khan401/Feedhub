import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Rating } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchFeedbackFromDb, updateFeedbackInDb } from '../models/firebaseModel';
import type { Feedback } from '../models/firebaseModel';

interface FormData {
  name: string;
  email: string;
  question: string;
  description: string;
  questionType: 'multiple-choice' | 'rating' | 'text';
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  ratingScale: {
    min: number;
    max: number;
    step: number;
  };
}

export default function UpdateFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    question: '',
    description: '',
    questionType: 'multiple-choice',
    options: {
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    },
    ratingScale: {
      min: 1,
      max: 5,
      step: 1,
    },
  });

  const steps = ['Personal Information', 'Survey Details'];

  useEffect(() => {
    const fetchFeedback = async () => {
      if (id) {
        try {
          const feedback = await fetchFeedbackFromDb(id);
          setFormData(feedback as FormData);
        } catch (error) {
          toast.error(error.message || 'Error fetching survey.');
          navigate('/feedbacks');
        }
      }
    };

    fetchFeedback();
  }, [id, navigate]);

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleOptionChange = (optionKey: keyof FormData['options'], value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [optionKey]: value,
      },
    }));
  };

  const handleRatingScaleChange = (field: keyof FormData['ratingScale'], value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      ratingScale: {
        ...prevData.ratingScale,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (id) {
      try {
        await updateFeedbackInDb(id, formData);
        toast.success('Survey successfully updated!');
        navigate('/feedbacks');
      } catch (error) {
        toast.error(error.message || 'Error updating survey. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ width: '80%', margin: 'auto', mt: 5 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 3 }}>
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Survey Question"
              fullWidth
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
            />
            <Typography variant="subtitle1">Description</Typography>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
            />
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={formData.questionType}
                label="Question Type"
                onChange={(e) => handleChange('questionType', e.target.value)}
              >
                <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="text">Text Response</MenuItem>
              </Select>
            </FormControl>

            {formData.questionType === 'multiple-choice' && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Option 1"
                  fullWidth
                  value={formData.options.option1}
                  onChange={(e) => handleOptionChange('option1', e.target.value)}
                />
                <TextField
                  label="Option 2"
                  fullWidth
                  value={formData.options.option2}
                  onChange={(e) => handleOptionChange('option2', e.target.value)}
                />
                <TextField
                  label="Option 3"
                  fullWidth
                  value={formData.options.option3}
                  onChange={(e) => handleOptionChange('option3', e.target.value)}
                />
                <TextField
                  label="Option 4"
                  fullWidth
                  value={formData.options.option4}
                  onChange={(e) => handleOptionChange('option4', e.target.value)}
                />
              </Box>
            )}

            {formData.questionType === 'rating' && (
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography>Rating Scale</Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Min"
                    type="number"
                    value={formData.ratingScale.min}
                    onChange={(e) => handleRatingScaleChange('min', Number(e.target.value))}
                  />
                  <TextField
                    label="Max"
                    type="number"
                    value={formData.ratingScale.max}
                    onChange={(e) => handleRatingScaleChange('max', Number(e.target.value))}
                  />
                  <TextField
                    label="Step"
                    type="number"
                    value={formData.ratingScale.step}
                    onChange={(e) => handleRatingScaleChange('step', Number(e.target.value))}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeStep === steps.length && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Steps Completed
            </Typography>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Back
          </Button>
          {activeStep < steps.length && (
            <Button onClick={handleNext} variant="contained">
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
