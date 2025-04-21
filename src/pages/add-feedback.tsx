import { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import { useFeedback } from '../contexts/feedback-context';
import { sendEmail } from '../services/emailService';
import { generateLink } from '../utils/linkGenerator';

interface FormData {
  name: string;
  email: string;
  question: string;
  description: string;
  questionType: 'multiple-choice' | 'rating' | 'text';
  options: string[];
  ratingScale: {
    min: number;
    max: number;
    step: number;
  };
}

export default function AddFeedback() {
  const navigate = useNavigate();
  const { addFeedback, error: contextError } = useFeedback();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    question: '',
    description: '',
    questionType: 'multiple-choice',
    options: ['', ''],
    ratingScale: {
      min: 1,
      max: 5,
      step: 1,
    },
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const steps = ['Personal Information', 'Survey Details'];

  useEffect(() => {
    if (contextError) {
      toast.error(contextError);
    }
  }, [contextError]);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (activeStep === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (activeStep === 1) {
      if (!formData.question.trim()) {
        newErrors.question = 'Question is required';
      }
      if (formData.questionType === 'multiple-choice' && formData.options.some(opt => !opt.trim())) {
        newErrors.options = 'All options must be filled';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      options: prevData.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const addOption = () => {
    setFormData((prevData) => ({
      ...prevData,
      options: [...prevData.options, ''],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      options: prevData.options.filter((_, i) => i !== index),
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
    try {
      const feedbackId = await addFeedback(formData);
      const feedbackLink = generateLink(feedbackId);
      
      // Send email with feedback link
      const emailContent = `
        <h2>Thank you for creating a feedback survey!</h2>
        <p>Here's your link to share with others:</p>
        <a href="${feedbackLink}" target="_blank">${feedbackLink}</a>
        <p>You can use this link to collect feedback from your audience.</p>
      `;
      await sendEmail(formData.email, emailContent);

      toast.success('Survey successfully created! An email with the survey link has been sent.');
      navigate('/feedbacks');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating survey. Please try again.');
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
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
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
              error={!!errors.question}
              helperText={errors.question}
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
                {formData.options.map((option, index) => (
                  <Box key={index} display="flex" gap={1}>
                    <TextField
                      label={`Option ${index + 1}`}
                      fullWidth
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      error={!!errors.options}
                      helperText={errors.options}
                    />
                    {formData.options.length > 2 && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeOption(index)}
                        sx={{ minWidth: '40px' }}
                      >
                        -
                      </Button>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={addOption}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Option
                </Button>
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
