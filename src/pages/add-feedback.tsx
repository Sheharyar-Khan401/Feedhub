import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { sendEmail } from 'src/services/emailService';
import { addFeedbackToDb } from '../models/firebaseModel';

interface FormData {
  name: string;
  email: string;
  question: string;
  description: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

export default function AddFeedback() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    question: '',
    description: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
  });
  const navigate = useNavigate();

  const steps = ['Personal Information', 'Survey Details'];

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const generateSurveyLink = async (surveyId: string) =>
    `${window.location.origin}/survey/${surveyId}`;

  const handleSubmit = async () => {
    try {
      const feedbackId = await addFeedbackToDb(formData);
      const surveyLink = await generateSurveyLink(feedbackId);

      // Send the survey link via email (pseudo-code)
      await sendEmail(formData.email, `Your survey link: ${surveyLink}`);

      toast.success('Survey created and link sent!');
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Error creating survey. Please try again.');
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
            <TextField
              label="Option 1"
              fullWidth
              value={formData.option1}
              onChange={(e) => handleChange('option1', e.target.value)}
            />
            <TextField
              label="Option 2"
              fullWidth
              value={formData.option2}
              onChange={(e) => handleChange('option2', e.target.value)}
            />
            <TextField
              label="Option 3"
              fullWidth
              value={formData.option3}
              onChange={(e) => handleChange('option3', e.target.value)}
            />
            <TextField
              label="Option 4"
              fullWidth
              value={formData.option4}
              onChange={(e) => handleChange('option4', e.target.value)}
            />
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
      </Box>
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
  );
}
