import { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Emergency Popup State
  const [emergencyPopup, setEmergencyPopup] = useState({
    isOpen: false,
    data: null
  });

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  // Trigger Emergency Popup
  const triggerEmergency = (requestData) => {
    setEmergencyPopup({
      isOpen: true,
      data: requestData
    });
  };

  const closeEmergency = () => {
    setEmergencyPopup({
      isOpen: false,
      data: null
    });
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      emergencyPopup,
      triggerEmergency,
      closeEmergency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
