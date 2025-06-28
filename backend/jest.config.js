module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    setupFiles: ['<rootDir>/tests/jest.env.js'],
    testMatch: [
      '<rootDir>/tests/**/*.test.js',
      '<rootDir>/tests/**/*.spec.js'
    ],
    collectCoverageFrom: [
      'controllers/**/*.js',
      'models/**/*.js',
      'utils/**/*.js',
      'middleware/**/*.js',
      '!**/node_modules/**',
      '!**/tests/**'
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
  };