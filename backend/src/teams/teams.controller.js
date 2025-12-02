const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Get all teams
const getAllTeams = async (req, res) => {
  try {
    const sql = "SELECT * FROM teams ORDER BY created_at DESC";
    const [data] = await db.query(sql);
    
    // Map database columns to frontend expected format
    const formattedData = data.map(team => ({
      id: team.team_id,
      title: team.team_name,
      description: team.description || '',
      color: team.accent_color || '#FFFFFF',
      members: [] // Schema doesn't have members column
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error("❌ READ ERROR:", err.message);
    // If table doesn't exist yet, return empty array instead of crashing
    res.json([]);
  }
};

// POST: Create a new team
const createTeam = async (req, res) => {
  try {
    // Map frontend fields to database columns
    const sql = "INSERT INTO teams (`team_name`, `description`, `accent_color`) VALUES (?, ?, ?)";
    
    const values = [
      req.body.title || req.body.name, // Accept both 'title' and 'name' from frontend
      req.body.description || '',
      req.body.color || req.body.accent_color || '#FFFFFF' // Accept both 'color' and 'accent_color'
    ];

    const [result] = await db.query(sql, values);
    const { userId, userName } = req.body;
    const teamName = req.body.title || req.body.name;
    await logActivity(`Team created: ${teamName} (#${result.insertId})`, userId || null, userName || null);
    res.json({ message: "Team created", id: result.insertId });
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete a team
const deleteTeam = async (req, res) => {
  try {
    const sql = "DELETE FROM teams WHERE team_id = ?";
    await db.query(sql, [req.params.id]);
    const { userId, userName } = req.body;
    await logActivity(`Team deleted: ${req.params.id}`, userId || null, userName || null);
    res.json({ message: "Team deleted" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  deleteTeam
};

