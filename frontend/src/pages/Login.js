import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const initialValues = {
    email: '',
    password: ''
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      const result = await loginUser(values);
      updateUser(result.user);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field type="email" id="email" name="email" className="form-control" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field type="password" id="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>
            
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="auth-links">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;