import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <h2>{currentUser.firstName} {currentUser.lastName}</h2>
            <span className={`role-badge role-${currentUser.role}`}>
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>
          </div>
          
          <div className="profile-details">
            <div className="profile-row">
              <span className="label">Email:</span>
              <span className="value">{currentUser.email}</span>
            </div>
            
            <div className="profile-row">
              <span className="label">User ID:</span>
              <span className="value">{currentUser.id}</span>
            </div>
            
            <div className="profile-row">
              <span className="label">Role:</span>
              <span className="value">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;