const User = require('../../models/user.model');

describe('User Model', () => {
  
  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'customer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Hashed olmalı
    });

    it('should hash password before saving', async () => {
      const password = 'PlainPassword123';
      const user = new User({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: password,
        role: 'customer'
      });

      await user.save();
      
      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should set default role to customer', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123'
      });

      await user.save();
      expect(user.role).toBe('customer');
    });
  });

  describe('User Validation', () => {
    it('should require firstName', async () => {
      const user = new User({
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
    });

    it('should require unique email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'Password123'
      };

      // İlk kullanıcıyı kaydet
      const user1 = new User(userData);
      await user1.save();

      // Aynı email ile ikinci kullanıcı
      const user2 = new User(userData);
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should validate email format', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123'
      });
    
      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }
    
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });
  });

  describe('User Methods', () => {
    it('should compare password correctly', async () => {
      const password = 'TestPassword123';
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: password
      });

      await user.save();

      const isMatch = await user.comparePassword(password);
      const isNotMatch = await user.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

});