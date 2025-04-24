import emailjs from 'emailjs-com';

export const sendEmail = async (to: string, toName: string, content: string) => {
  try {
    const templateParams = {
      to_email: to, // User's email address
      to_name: toName, // User's name
      subject: 'Your Survey Link', // Email subject
      message: content, // Message with survey link
    };

    const serviceId = 'service_ep5olnc';
    const templateId = 'template_u4xt6i9';
    const publicKey = 'MYbU9nM2Z2Ov2Vt9W';

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
