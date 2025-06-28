// Test başında environment variable ayarla
process.env.JWT_SECRET = 'test-secret-key';
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');
const { generateToken } = require('../../utils/jwt.utils');
const User = require('../../models/user.model');

describe('Auth Middleware', () => {

  describe('authenticateToken', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should authenticate valid token', async () => {
      // Test kullanıcısı oluştur
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'customer'
      });
      await user.save();

      // Valid token oluştur
      const token = generateToken(user);
      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject malformed authorization header', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied' });
    });
  });

  describe('authorizeRoles', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should authorize user with correct role', () => {
      mockReq.user = { role: 'admin' };
      const middleware = authorizeRoles('admin', 'staff');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject user with insufficient role', () => {
      mockReq.user = { role: 'customer' };
      const middleware = authorizeRoles('admin', 'staff');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request without user', () => {
      const middleware = authorizeRoles('admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });
  });

});