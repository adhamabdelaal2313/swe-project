const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db.config');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const mockToken = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }, JWT_SECRET);

// Integration Test: Teams API with Database Mocking
describe('Teams API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a team and return team data', async () => {
    const mockTeamId = 5;

    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    // Controller makes 3 queries: insert team, insert team member, log activity
    db.query
      .mockResolvedValueOnce([{ insertId: mockTeamId }, []]) // Insert team [result, fields]
      .mockResolvedValueOnce([{}, []]) // Insert team member (owner) [result, fields]
      .mockResolvedValueOnce([{}, []]); // Log activity [result, fields]

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Frontend Team',
        description: 'Frontend development team',
        color: 'bg-indigo-600',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', mockTeamId);
    expect(res.body).toHaveProperty('message', 'Team created');
    expect(db.query).toHaveBeenCalledTimes(3);
  });

  it('should fetch all teams for authenticated user', async () => {
    const mockTeams = [
      {
        team_id: 1,
        team_name: 'Team Alpha',
        description: 'First team',
        accent_color: 'bg-purple-600',
        user_team_role: 'owner',
      },
      {
        team_id: 2,
        team_name: 'Team Beta',
        description: 'Second team',
        accent_color: 'bg-blue-600',
        user_team_role: 'member',
      },
    ];

    // Mock: First query returns teams, then for each team, a members query
    // MySQL2 returns [rows, fields], so mock should return [rows]
    db.query
      .mockResolvedValueOnce([mockTeams, []]) // Get teams [rows, fields]
      .mockResolvedValueOnce([[{ id: 1, name: 'User 1', email: 'user1@example.com', role: 'owner' }], []]) // Members for team 1
      .mockResolvedValueOnce([[{ id: 2, name: 'User 2', email: 'user2@example.com', role: 'member' }], []]); // Members for team 2

    const res = await request(app)
      .get('/api/teams')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('user_team_role');
  });

  it('should add member to team', async () => {
    const teamId = 1;
    const userId = 2;
    const role = 'member';

    // Mock: Check user role (owner/admin), find user, check if already member, insert member, log activity
    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    // Note: The controller checks if user is admin OR has owner/admin role in team
    // Since mockToken has role 'user', we need to return owner role for the team check
    db.query
      .mockResolvedValueOnce([[{ role: 'owner' }], []]) // Check user role in team (user_id=1 is owner)
      .mockResolvedValueOnce([[{ id: userId, name: 'New Member', email: 'member@example.com' }], []]) // Find user by email
      .mockResolvedValueOnce([[], []]) // Check if already member (not found)
      .mockResolvedValueOnce([{ insertId: 10 }, []]) // Insert member
      .mockResolvedValueOnce([{}, []]); // Log activity

    const res = await request(app)
      .post(`/api/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        email: 'member@example.com',
        role: role,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Member added successfully');
  });

  it('should return 404 when team not found', async () => {
    // MySQL2 returns [rows, fields], so mock should return [rows, fields]
    db.query.mockResolvedValueOnce([[], []]); // Team not found

    const res = await request(app)
      .get('/api/teams/999')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(404);
  });
});

