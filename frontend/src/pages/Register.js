
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const Register = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      const { confirmPassword, ...registrationData } = values;
      const result = await registerUser(registrationData);
      updateUser(result.user);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <h2>Create an Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Registration successful! Redirecting...</div>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <Field type="text" id="firstName" name="firstName" className="form-control" />
              <ErrorMessage name="firstName" component="div" className="error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <Field type="text" id="lastName" name="lastName" className="form-control" />
              <ErrorMessage name="lastName" component="div" className="error" />
            </div>
            
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
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field type="password" id="confirmPassword" name="confirmPassword" className="form-control" />
              <ErrorMessage name="confirmPassword" component="div" className="error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Register as</label>
              <Field as="select" id="role" name="role" className="form-control">
                <option value="customer">Customer</option>
                <option value="staff">Restaurant Staff</option>
              </Field>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            
            <div className="auth-links">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;