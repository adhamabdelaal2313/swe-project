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
    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query.mockResolvedValueOnce([{ insertId: 50 }, []]);

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

    // Step 2: Fetch all tasks and verify the created task exists
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

    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query.mockResolvedValueOnce([[mockTask], []]);

    const fetchRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes.statusCode).toBe(200);
    expect(Array.isArray(fetchRes.body)).toBe(true);
    expect(fetchRes.body[0].title).toBe('System Test Task');

    // Step 3: Update task status (move to IN_PROGRESS)
    // Mock: Security check query (SELECT with EXISTS), then UPDATE, then logActivity
    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    const mockTaskForUpdate = {
      id: taskId,
      title: 'System Test Task',
      status: 'TODO',
      priority: 'MEDIUM',
      team_id: null,
      assignee_id: userId, // Task is assigned to the user, so they can update it
      is_team_member: 0, // 0 = false (not a team task)
    };
    
    db.query
      .mockResolvedValueOnce([[mockTaskForUpdate], []]) // Security check query
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]) // UPDATE query
      .mockResolvedValueOnce([{}, []]); // logActivity query

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(updateRes.statusCode).toBe(200);

    // Step 4: Move task via Kanban endpoint
    // Mock: Security check query, then UPDATE, then logActivity
    const mockTaskForKanban = {
      id: taskId,
      title: 'System Test Task',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      team_id: null,
      assignee_id: userId,
      is_team_member: 0,
    };
    
    db.query
      .mockResolvedValueOnce([[mockTaskForKanban], []]) // Security check query
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]) // UPDATE query
      .mockResolvedValueOnce([{}, []]); // logActivity query

    const kanbanRes = await request(app)
      .put(`/api/kanban/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'DONE' });

    expect(kanbanRes.statusCode).toBe(200);

    // Step 5: Delete the task
    // Mock: Security check query, then DELETE, then logActivity
    const mockTaskForDelete = {
      id: taskId,
      title: 'System Test Task',
      status: 'DONE',
      priority: 'MEDIUM',
      team_id: null,
      assignee_id: userId,
      is_team_member: 0,
    };
    
    db.query
      .mockResolvedValueOnce([[mockTaskForDelete], []]) // Security check query
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]) // DELETE query
      .mockResolvedValueOnce([{}, []]); // logActivity query

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.statusCode).toBe(200);

    // Step 6: Verify task is deleted (should not appear in task list)
    db.query.mockResolvedValueOnce([[], []]);

    const verifyRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.length).toBe(0);
  });

  it('should handle task assignment and team association', async () => {
    const teamId = 5;
    const assigneeId = 2;
    const taskId = 100;

    // Create task with team and assignee
    db.query.mockResolvedValueOnce([{ insertId: taskId }, []]);

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

    // Fetch all tasks and verify team/assignee
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

    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query.mockResolvedValueOnce([[mockTask], []]);

    const fetchRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes.statusCode).toBe(200);
    expect(Array.isArray(fetchRes.body)).toBe(true);
    expect(fetchRes.body[0].team_id).toBe(teamId);
    expect(fetchRes.body[0].assignee_id).toBe(assigneeId);
  });
});

