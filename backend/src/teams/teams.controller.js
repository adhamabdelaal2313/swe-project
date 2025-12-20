const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Get all teams (admins see all, users see their own)
const getAllTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // Global role: 'admin' or 'user'
    
    let sql;
    let params = [];

    if (userRole === 'admin') {
      // Admins see all teams
      sql = `SELECT t.* FROM teams t ORDER BY t.created_at DESC`;
    } else {
      // Users see only teams they are members of
      sql = `
        SELECT t.*, tm.role as user_team_role
        FROM teams t
        JOIN team_members tm ON t.team_id = tm.team_id
        WHERE tm.user_id = ?
        ORDER BY t.created_at DESC
      `;
      params.push(userId);
    }

    const [teams] = await db.query(sql, params);
    
    // For each team, get its members
    const teamsWithMembers = await Promise.all(teams.map(async (team) => {
      const [members] = await db.query(`
        SELECT u.id, u.name, u.email, tm.role 
        FROM users u
        JOIN team_members tm ON u.id = tm.user_id
        WHERE tm.team_id = ?
      `, [team.team_id]);

      // If user is admin, they might not be in team_members, so user_team_role might be undefined
      // but they should have owner-like permissions.
      let currentUserTeamRole = team.user_team_role;
      if (userRole === 'admin' && !currentUserTeamRole) {
        currentUserTeamRole = 'owner'; // Grant full access to global admins
      }

      return {
        id: team.team_id,
        title: team.team_name,
        description: team.description || '',
        color: team.accent_color || '#FFFFFF',
        members: members,
        user_team_role: currentUserTeamRole
      };
    }));
    
    res.json(teamsWithMembers);
  } catch (err) {
    console.error("❌ READ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to convert Tailwind classes to hex colors and validate
const normalizeColor = (color) => {
  if (!color) return '#FFFFFF';
  
  // If it's already a hex color, validate and return
  if (color.startsWith('#')) {
    // Ensure it's exactly 7 characters (#RRGGBB)
    return color.length === 7 ? color : '#FFFFFF';
  }
  
  // Convert Tailwind classes to hex colors
  const colorMap = {
    'bg-purple-600': '#9333EA',
    'bg-cyan-500': '#06b6d4',
    'bg-pink-500': '#ec4899',
    'bg-emerald-500': '#10b981',
  };
  
  return colorMap[color] || '#FFFFFF';
};

// POST: Create a new team
const createTeam = async (req, res) => {
  try {
    const { title, name, description, color, accent_color } = req.body;
    const teamName = title || name;
    const accentColor = normalizeColor(color || accent_color);

    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Validate color length (database column is VARCHAR(7))
    if (accentColor.length > 7) {
      return res.status(400).json({ message: 'Invalid color format. Please use hex color (e.g., #FFFFFF)' });
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
    const currentUserId = req.user.id;
    const currentUserGlobalRole = req.user.role;

    // Check if the current user is an admin or owner of this team OR a global admin
    if (currentUserGlobalRole !== 'admin') {
      const [memberRoles] = await db.query(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        [teamId, currentUserId]
      );

      if (memberRoles.length === 0 || (memberRoles[0].role !== 'admin' && memberRoles[0].role !== 'owner')) {
        return res.status(403).json({ message: "Forbidden: Only team owners or admins can add members." });
      }
    }

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
    const currentUserId = req.user.id;
    const currentUserGlobalRole = req.user.role;

    // Check if the current user is an admin or owner of this team OR a global admin
    if (currentUserGlobalRole !== 'admin') {
      const [memberRoles] = await db.query(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        [teamId, currentUserId]
      );

      if (memberRoles.length === 0 || (memberRoles[0].role !== 'admin' && memberRoles[0].role !== 'owner')) {
        return res.status(403).json({ message: "Forbidden: Only team owners or admins can remove members." });
      }
    }

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
    const currentUserId = req.user.id;
    const currentUserGlobalRole = req.user.role;

    // Check if the current user is the owner of this team OR a global admin
    if (currentUserGlobalRole !== 'admin') {
      const [teamOwner] = await db.query(
        "SELECT tm.user_id FROM team_members tm WHERE tm.team_id = ? AND tm.role = 'owner'",
        [id]
      );

      if (teamOwner.length === 0 || teamOwner[0].user_id !== currentUserId) {
        return res.status(403).json({ message: "Forbidden: Only the team owner can delete a team." });
      }
    }

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
