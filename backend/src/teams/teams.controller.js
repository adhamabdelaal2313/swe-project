const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Get teams that the logged-in user is a part of
const getAllTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch only teams where the user is a member
    const [teams] = await db.query(`
      SELECT t.* 
      FROM teams t
      JOIN team_members tm ON t.team_id = tm.team_id
      WHERE tm.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId]);
    
    // For each team, get its members
    const teamsWithMembers = await Promise.all(teams.map(async (team) => {
      const [members] = await db.query(`
        SELECT u.id, u.name, u.email, tm.role 
        FROM users u
        JOIN team_members tm ON u.id = tm.user_id
        WHERE tm.team_id = ?
      `, [team.team_id]);

      return {
        id: team.team_id,
        title: team.team_name,
        description: team.description || '',
        color: team.accent_color || '#FFFFFF',
        members: members
      };
    }));
    
    res.json(teamsWithMembers);
  } catch (err) {
    console.error("❌ READ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST: Create a new team
const createTeam = async (req, res) => {
  try {
    const { title, name, description, color, accent_color } = req.body;
    const teamName = title || name;
    const accentColor = color || accent_color || '#FFFFFF';

    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const [result] = await db.query(
      "INSERT INTO teams (team_name, description, accent_color) VALUES (?, ?, ?)",
      [teamName, description || '', accentColor]
    );

    const teamId = result.insertId;
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : null;

    // If a user created it, make them the owner
    if (userId) {
      await db.query(
        "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
        [teamId, userId, 'owner']
      );
    }

    await logActivity(`Team created: ${teamName} (#${teamId})`, userId, userName);
    res.status(201).json({ message: "Team created", id: teamId });
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST: Add a member to a team
const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role } = req.body;

    // Find user by email
    const [users] = await db.query("SELECT id, name FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToAdd = users[0];

    // Check if already a member
    const [existing] = await db.query(
      "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?",
      [teamId, userToAdd.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "User is already a member of this team" });
    }

    await db.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
      [teamId, userToAdd.id, role || 'member']
    );

    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : null;
    await logActivity(`Added member ${userToAdd.name} to team ${teamId}`, userId, userName);

    res.json({ message: "Member added successfully" });
  } catch (err) {
    console.error("❌ ADD MEMBER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove a member from a team
const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    await db.query(
      "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
      [teamId, userId]
    );

    const authUserId = req.user ? req.user.id : null;
    const authUserName = req.user ? req.user.name : null;
    await logActivity(`Removed member ${userId} from team ${teamId}`, authUserId, authUserName);

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("❌ REMOVE MEMBER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete a team
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // team_members and tasks will be handled by ON DELETE CASCADE/SET NULL in DB
    await db.query("DELETE FROM teams WHERE team_id = ?", [id]);
    
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : null;
    await logActivity(`Team deleted: ${id}`, userId, userName);
    
    res.json({ message: "Team deleted" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  addMember,
  removeMember,
  deleteTeam
};
