import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [demoUsers] = useState([
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('demo_user_email');
    if (savedEmail) {
      const user = demoUsers.find(u => u.email === savedEmail);
      if (user) setCurrentUser(user);
    } else {
      setCurrentUser(demoUsers[0]);
      localStorage.setItem('demo_user_email', demoUsers[0].email);
    }
  }, [demoUsers]);

  const switchUser = (email) => {
    const user = demoUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('demo_user_email', email);
      // Reload to clear state
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, demoUsers, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
