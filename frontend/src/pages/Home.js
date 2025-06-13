import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Restaurant Ordering & Management System</h1>
        <p>
          A demonstration of RESTful API principles and JWT authentication using a restaurant 
          ordering platform. Browse restaurants, place orders, and manage your dining experience.
        </p>
        <div className="hero-buttons">
          <Link to="/restaurants" className="btn-explore">
            Explore Restaurants
          </Link>
          {!currentUser && (
            <Link to="/register" className="btn-explore">
              Get Started
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;