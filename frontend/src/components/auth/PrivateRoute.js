import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { currentUser, loading, hasRole } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PrivateRoute;