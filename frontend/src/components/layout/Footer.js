import React from 'react';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Restaurant Ordering & Management System</p>
        <p>This is a demonstration project showcasing RESTful API integration.</p>
      </div>
    </footer>
  );
};

export default Footer;