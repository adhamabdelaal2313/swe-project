const request = require('supertest');
const app = require('../index');
const db = require('../config/db.config');

// Mock the database
jest.mock('../config/db.config', () => ({
  query: jest.fn(),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email or password missing on login', async () => {
    const res = await request(app)
      .post('/api/portal/login')
      .send({ email: 'test@example.com' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });

  it('should return 401 for invalid credentials', async () => {
    db.query.mockResolvedValue([[]]); // No user found

    const res = await request(app)
      .post('/api/portal/login')
      .send({ email: 'wrong@example.com', password: 'password123' });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should register a new user successfully', async () => {
    db.query
      .mockResolvedValueOnce([[]]) // Check if exists: empty
      .mockResolvedValueOnce([{ insertId: 1 }]); // Insert user: success

    const res = await request(app)
      .post('/api/portal/register')
      .send({ 
        name: 'Test User', 
        email: 'new@example.com', 
        password: 'password123' 
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'new@example.com');
  });
});

