const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db.config');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const mockToken = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, JWT_SECRET);

// Integration Test: Teams API with Database Mocking
describe('Teams API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a team and return team data', async () => {
    const mockTeamId = 5;
    const mockTeam = {
      id: mockTeamId,
      title: 'Frontend Team',
      description: 'Frontend development team',
      color: 'bg-indigo-600',
    };

    db.query
      .mockResolvedValueOnce([{ insertId: mockTeamId }]) // Insert team
      .mockResolvedValueOnce([[mockTeam]]); // Fetch created team

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
    expect(res.body.title).toBe('Frontend Team');
    expect(db.query).toHaveBeenCalledTimes(2);
  });

  it('should fetch all teams for authenticated user', async () => {
    const mockTeams = [
      {
        id: 1,
        title: 'Team Alpha',
        description: 'First team',
        color: 'bg-purple-600',
        user_team_role: 'owner',
      },
      {
        id: 2,
        title: 'Team Beta',
        description: 'Second team',
        color: 'bg-blue-600',
        user_team_role: 'member',
      },
    ];

    db.query.mockResolvedValueOnce([mockTeams]);

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

    db.query
      .mockResolvedValueOnce([[{ id: userId, email: 'member@example.com' }]]) // Find user
      .mockResolvedValueOnce([{ insertId: 10 }]); // Add to team

    const res = await request(app)
      .post(`/api/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        email: 'member@example.com',
        role: role,
      });

    expect(res.statusCode).toBe(201);
    expect(db.query).toHaveBeenCalledTimes(2);
  });

  it('should return 404 when team not found', async () => {
    db.query.mockResolvedValueOnce([[]]); // Team not found

    const res = await request(app)
      .get('/api/teams/999')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(404);
  });
});

