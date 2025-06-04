export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
    name: 'Test User'
  },
  
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    name: 'Invalid User'
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User'
  }
}

export const testCards = {
  sampleCard: {
    title: 'Test Card',
    description: 'This is a test card for E2E testing',
    category: 'test',
    difficulty: 'easy'
  },

  complexCard: {
    title: 'Complex Test Card',
    description: 'This is a more complex card with longer description for testing purposes',
    category: 'advanced',
    difficulty: 'hard'
  }
}

export const apiEndpoints = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  cards: '/api/cards',
  users: '/api/users'
}

export const testConfig = {
  defaultTimeout: 30000,
  shortTimeout: 5000,
  longTimeout: 60000,
  retryCount: 3
}

export const generateTestData = {
  email: () => `test-${Date.now()}@example.com`,
  password: () => 'TestPassword123!',
  cardTitle: () => `Test Card ${Date.now()}`,
  cardDescription: () => `Description for test card created at ${new Date().toISOString()}`
} 