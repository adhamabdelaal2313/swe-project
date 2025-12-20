const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db.config');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// System Test: Complete Task Management Flow
describe('Task Management System Flow', () => {
  let authToken;
  let userId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = jwt.sign(
      { id: userId, name: 'Test User', email: 'test@example.com' },
      JWT_SECRET
    );
  });

  it('should complete full task lifecycle: create, update, move, delete', async () => {
    let taskId;

    // Step 1: Create a new task
    db.query.mockResolvedValueOnce([{ insertId: 50 }]);

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'System Test Task',
        description: 'Testing full lifecycle',
        status: 'TODO',
        priority: 'MEDIUM',
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('taskId');
    taskId = createRes.body.taskId;

    // Step 2: Fetch the created task
    const mockTask = {
      id: taskId,
      title: 'System Test Task',
      description: 'Testing full lifecycle',
      status: 'TODO',
      priority: 'MEDIUM',
      team_id: null,
      assignee_id: null,
      tags: null,
      due_date: null,
      created_at: '2024-01-15',
    };

    db.query.mockResolvedValueOnce([[mockTask]]);

    const fetchRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.body.title).toBe('System Test Task');

    // Step 3: Update task status (move to IN_PROGRESS)
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(updateRes.statusCode).toBe(200);

    // Step 4: Move task via Kanban endpoint
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const kanbanRes = await request(app)
      .put(`/api/kanban/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'DONE' });

    expect(kanbanRes.statusCode).toBe(200);

    // Step 5: Delete the task
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.statusCode).toBe(200);

    // Step 6: Verify task is deleted
    db.query.mockResolvedValueOnce([[]]);

    const verifyRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(verifyRes.statusCode).toBe(404);
  });

  it('should handle task assignment and team association', async () => {
    const teamId = 5;
    const assigneeId = 2;
    const taskId = 100;

    // Create task with team and assignee
    db.query.mockResolvedValueOnce([{ insertId: taskId }]);

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Team Task',
        status: 'TODO',
        priority: 'HIGH',
        team_id: teamId,
        assignee_id: assigneeId,
      });

    expect(createRes.statusCode).toBe(201);

    // Fetch task and verify team/assignee
    const mockTask = {
      id: taskId,
      title: 'Team Task',
      status: 'TODO',
      priority: 'HIGH',
      team_id: teamId,
      assignee_id: assigneeId,
      team_name: 'Frontend Team',
      assignee_name: 'John Doe',
    };

    db.query.mockResolvedValueOnce([[mockTask]]);

    const fetchRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.body.team_id).toBe(teamId);
    expect(fetchRes.body.assignee_id).toBe(assigneeId);
  });
});

