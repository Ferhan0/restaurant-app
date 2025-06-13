import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser && localStorage.getItem('authToken')) {
          setCurrentUser(JSON.parse(storedUser));
          
          try {
            const userData = await getUserProfile();
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to fetch updated user profile:', error);
          }
        }
      } catch (error) {
        setError(error);
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const updateUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  };
  
  const hasRole = (role) => {
    return currentUser && currentUser.role === role;
  };
  
  const isAuthenticated = () => {
    return !!currentUser;
  };
  
  const value = {
    currentUser,
    updateUser,
    loading,
    error,
    hasRole,
    isAuthenticated
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};