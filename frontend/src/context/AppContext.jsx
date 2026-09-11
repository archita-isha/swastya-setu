import { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // User Authentication & Session State
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // Emergency Popup State
  const [emergencyPopup, setEmergencyPopup] = useState({
    isOpen: false,
    data: null
  });

  // Log in user and establish session
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('last_active', Date.now().toString());
  };

  // Log out user and clear session
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('last_active');
    window.location.href = '/login';
  };

  // Inactivity tracking (15 minutes limit)
  useEffect(() => {
    if (!user) return;

    // Update active time when user interacts with page
    const updateActivity = () => {
      localStorage.setItem('last_active', Date.now().toString());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check inactivity every 10 seconds
    const checkInterval = setInterval(() => {
      const lastActive = localStorage.getItem('last_active');
      if (lastActive) {
        const timeElapsed = Date.now() - parseInt(lastActive, 10);
        const timeoutLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        if (timeElapsed >= timeoutLimit) {
          console.log("Inactivity timeout: Logging out user...");
          logout();
        }
      } else {
        localStorage.setItem('last_active', Date.now().toString());
      }
    }, 10000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(checkInterval);
    };
  }, [user]);

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
      closeEmergency,
      user,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
