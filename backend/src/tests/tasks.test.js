const request = require('supertest');
const app = require('../index');
const db = require('../config/db.config');
const jwt = require('jsonwebtoken');

jest.mock('../config/db.config', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const mockToken = jwt.sign({ id: 1, name: 'Test User', role: 'user' }, JWT_SECRET);

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
  });

  it('should fetch all tasks if authenticated', async () => {
    const mockTasks = [
      { id: 1, title: 'Test Task', status: 'TODO', tags: 'Dev,API' }
    ];
    db.query.mockResolvedValue([mockTasks]);

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${mockToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0]).toHaveProperty('title', 'Test Task');
    expect(res.body[0].tags).toEqual(['Dev', 'API']);
  });

  it('should create a new task if authenticated', async () => {
    db.query.mockResolvedValue([{ insertId: 10 }]);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'New Task',
        status: 'TODO',
        priority: 'MEDIUM',
        tags: ['Jest', 'Testing']
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('taskId', 10);
  });
});

