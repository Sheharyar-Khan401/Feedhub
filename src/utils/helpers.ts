export const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  };