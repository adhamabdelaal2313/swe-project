const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db.config');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const mockToken = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }, JWT_SECRET);

// Integration Test: Dashboard API
describe('Dashboard API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch dashboard statistics', async () => {
    // Mock: Dashboard makes multiple queries - total, todo, inProgress, done, chartData
    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query
      .mockResolvedValueOnce([[{ count: 25 }], []]) // Total tasks [rows, fields]
      .mockResolvedValueOnce([[{ count: 10 }], []]) // Todo tasks
      .mockResolvedValueOnce([[{ count: 8 }], []]) // In progress tasks
      .mockResolvedValueOnce([[{ count: 7 }], []]) // Done tasks
      .mockResolvedValueOnce([[], []]); // Chart data (empty for simplicity)

    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalTasks', 25);
    expect(res.body).toHaveProperty('todo', 10);
    expect(res.body).toHaveProperty('inProgress', 8);
    expect(res.body).toHaveProperty('completed', 7);
  });

  it('should fetch recent activity feed', async () => {
    const mockActivities = [
      {
        id: 1,
        action: 'User logged in',
        user_name: 'John Doe',
        created_at: '2024-01-15 10:00:00',
      },
      {
        id: 2,
        action: 'Task created',
        user_name: 'Jane Smith',
        created_at: '2024-01-15 09:30:00',
      },
    ];

    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query.mockResolvedValueOnce([mockActivities, []]); // Activity feed query returns [rows, fields]

    const res = await request(app)
      .get('/api/dashboard/activity')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('action');
    expect(res.body[0]).toHaveProperty('user_name');
  });

  it('should require authentication for dashboard endpoints', async () => {
    const res = await request(app).get('/api/dashboard/stats');

    expect(res.statusCode).toBe(401);
  });
});

