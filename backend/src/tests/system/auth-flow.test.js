const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db.config');
const bcrypt = require('bcryptjs');

jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

// System Test: Complete Authentication Flow
describe('Authentication System Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full user registration and login flow', async () => {
    const userData = {
      name: 'System Test User',
      email: 'systemtest@example.com',
      password: 'SystemTest123!',
    };

    // Step 1: Register new user
    db.query
      .mockResolvedValueOnce([[]]) // Check if user exists: empty
      .mockResolvedValueOnce([{ insertId: 100 }]); // Insert user

    const registerRes = await request(app)
      .post('/api/portal/register')
      .send(userData);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('token');
    expect(registerRes.body.user).toHaveProperty('email', userData.email);
    
    const registerToken = registerRes.body.token;

    // Step 2: Use token to access protected endpoint
    db.query.mockResolvedValueOnce([[]]); // Empty tasks list

    const tasksRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${registerToken}`);

    expect(tasksRes.statusCode).toBe(200);
    expect(Array.isArray(tasksRes.body)).toBe(true);

    // Step 3: Login with registered credentials
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    db.query.mockResolvedValueOnce([[
      {
        id: 100,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    ]]);

    const loginRes = await request(app)
      .post('/api/portal/login')
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.email).toBe(userData.email);
  });

  it('should handle invalid login attempt and prevent access', async () => {
    // Attempt login with wrong credentials
    db.query.mockResolvedValueOnce([[]]); // User not found

    const loginRes = await request(app)
      .post('/api/portal/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

    expect(loginRes.statusCode).toBe(401);

    // Attempt to access protected endpoint without token
    const tasksRes = await request(app).get('/api/tasks');
    expect(tasksRes.statusCode).toBe(401);
  });
});

