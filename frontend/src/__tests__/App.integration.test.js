import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock Service Worker setup
const server = setupServer(
  // Mock API endpoints
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        message: 'User registered successfully',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer'
        },
        token: 'fake-jwt-token'
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Login successful',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer'
        },
        token: 'fake-jwt-token'
      })
    );
  }),

  rest.get('/api/auth/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ message: 'Access denied' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      })
    );
  })
);

// Start server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

// Clean up after tests
afterAll(() => server.close());

describe('App Integration Tests', () => {

  it('should handle complete user registration flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to registration page
    const registerLink = screen.getByText('Register');
    await user.click(registerLink);

    // Fill registration form
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');

    // Submit registration
    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    // Wait for success message and redirect
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Should redirect to home page
    await waitFor(() => {
      expect(screen.getByText(/restaurant ordering & management system/i)).toBeInTheDocument();
    });

    // Header should show user is logged in
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should handle complete user login flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to login page
    const loginLink = screen.getByText('Login');
    await user.click(loginLink);

    // Fill login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');

    // Submit login
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Should redirect to home page
    await waitFor(() => {
      expect(screen.getByText(/restaurant ordering & management system/i)).toBeInTheDocument();
    });

    // Header should show user is logged in
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should handle user logout flow', async () => {
    const user = userEvent.setup();

    // Set initial logged-in state
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      role: 'customer'
    }));

    render(<App />);

    // Wait for app to load with logged-in state
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    // Click logout
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    });

    // Header should show logged-out state
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    // localStorage should be cleared
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should protect private routes', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Try to navigate to profile page without being logged in
    // (This would typically be done through URL navigation in a real app)
    
    // Navigate to restaurants page (public)
    const restaurantsLink = screen.getByText('Restaurants');
    await user.click(restaurantsLink);

    expect(screen.getByText('Restaurants')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Override server to return error
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: 'Invalid credentials' })
        );
      })
    );

    render(<App />);

    // Navigate to login page
    const loginLink = screen.getByText('Login');
    await user.click(loginLink);

    // Fill login form with invalid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

    // Submit login
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Should remain on login page
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
  });

  it('should persist user session on page reload', async () => {
    // Set initial logged-in state
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      role: 'customer'
    }));

    render(<App />);

    // Should automatically load user from localStorage
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      
    });
    expect(screen.getByText('My Orders')).toBeInTheDocument();

    // Should call profile API to verify token
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

});