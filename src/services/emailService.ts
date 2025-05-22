import emailjs from 'emailjs-com';

export const sendEmail = async (to: string, toName: string, content: string) => {
  try {
    const templateParams = {
      to_email: to, // User's email address
      to_name: toName, // User's name
      subject: 'Your Survey Link', // Email subject
      message: content, // Message with survey link
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
