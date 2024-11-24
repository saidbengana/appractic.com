import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({
    userId: 'test-user-id',
    getToken: jest.fn(),
  }),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
  useAuth: () => ({
    isLoaded: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn(),
  }),
}));

// Global fetch mock
global.fetch = jest.fn();
