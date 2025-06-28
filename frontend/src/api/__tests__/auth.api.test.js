import axios from 'axios';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../auth.api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock axios instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: '1', email: 'john@example.com' },
          token: 'fake-token'
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await registerUser(userData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on registration failure', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const mockError = {
        response: {
          data: { message: 'Email already exists' }
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(registerUser(userData)).rejects.toEqual(mockError.response.data);
    });

    it('should handle network error', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const networkError = new Error('Network Error');
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(registerUser(userData)).rejects.toEqual('Network Error');
    });
  });

  describe('loginUser', () => {
    it('should login user and store token', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'Password123'
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { id: '1', email: 'john@example.com' },
          token: 'fake-jwt-token'
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await loginUser(credentials);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
      
      // Check if token and user are stored in localStorage
      expect(localStorage.getItem('authToken')).toBe('fake-jwt-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    });

    it('should throw error on login failure', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(loginUser(credentials)).rejects.toEqual(mockError.response.data);
      
      // Check that nothing is stored on failed login
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockResponse = {
        data: {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer'
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getUserProfile();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when unauthorized', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid token' }
        }
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(getUserProfile()).rejects.toEqual(mockError.response.data);
    });
  });

  describe('logoutUser', () => {
    it('should clear localStorage on logout', () => {
      // Set some data in localStorage first
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));

      // Call logout
      logoutUser();

      // Check that localStorage is cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle logout when localStorage is already empty', () => {
      // Call logout when localStorage is empty
      logoutUser();

      // Should not throw error
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

});