import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../api/auth.api';

const Header = () => {
  const { currentUser, updateUser, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logoutUser();
    updateUser(null);
    navigate('/login');
  };
  
  return (
    <header className="main-header">
      <div className="container">
        <div className="logo">
          <Link to="/">Restaurant App</Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
            
            {currentUser ? (
              <>
                <li><Link to="/profile">Profile</Link></li>
                
                {hasRole('customer') && (
                  <li><Link to="/my-orders">My Orders</Link></li>
                )}
                
                <li>
                  <button onClick={handleLogout} className="btn-logout">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;