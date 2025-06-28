import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authAPI from '../../api/auth.api';

// Mock API
jest.mock('../../api/auth.api');

// Test component to use the context
const TestComponent = () => {
  const { currentUser, loading, error, hasRole, isAuthenticated, updateUser } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated() ? 'true' : 'false'}</div>
      <div data-testid="user-email">{currentUser?.email || 'No user'}</div>
      <div data-testid="user-role">{currentUser?.role || 'No role'}</div>
      <div data-testid="is-admin">{hasRole('admin') ? 'true' : 'false'}</div>
      <button onClick={() => updateUser(null)}>Logout</button>
      <button onClick={() => updateUser({
        id: '1',
        email: 'test@example.com',
        role: 'customer'
      })}>Login</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial state when no user is stored', async () => {
    authAPI.getUserProfile.mockRejectedValue(new Error('No token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('loads user from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'stored@example.com',
      role: 'customer'
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'fake-token');
    
    authAPI.getUserProfile.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('updates user state correctly', async () => {
    authAPI.getUserProfile.mockRejectedValue(new Error('No token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    // Click login button to update user
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('handles logout correctly', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'customer'
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'fake-token');
    
    authAPI.getUserProfile.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');

    // Check localStorage is cleared
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('correctly identifies user roles', async () => {
    authAPI.getUserProfile.mockRejectedValue(new Error('No token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });

    // Update to admin user
    const mockAdminUser = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin'
    };

    // We need to create a component that can update user to admin
    const TestAdminComponent = () => {
      const { hasRole, updateUser } = useAuth();
      
      React.useEffect(() => {
        updateUser(mockAdminUser);
      }, [updateUser]);

      return <div data-testid="is-admin">{hasRole('admin') ? 'true' : 'false'}</div>;
    };

    render(
      <AuthProvider>
        <TestAdminComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });
  });

});