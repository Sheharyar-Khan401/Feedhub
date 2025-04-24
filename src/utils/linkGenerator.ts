export const generateLink = (feedbackId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/survey/${feedbackId}`;
}; 