const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Get all teams
const getAllTeams = async (req, res) => {
  try {
    const sql = "SELECT * FROM teams ORDER BY created_at DESC";
    const [data] = await db.query(sql);
    
    // Convert members JSON string back to array
    const formattedData = data.map(team => ({
      ...team,
      members: team.members ? JSON.parse(team.members) : []
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
    const sql = "INSERT INTO teams (`title`, `description`, `color`, `members`) VALUES (?)";
    
    // Convert members array to JSON string for storage
    const membersString = JSON.stringify(req.body.members || []);
    
    const values = [
      req.body.title,
      req.body.description,
      req.body.color,
      membersString
    ];

    const [result] = await db.query(sql, [values]);
    const { userId, userName } = req.body;
    await logActivity(`Team created: ${req.body.title} (#${result.insertId})`, userId || null, userName || null);
    res.json({ message: "Team created", id: result.insertId });
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete a team
const deleteTeam = async (req, res) => {
  try {
    const sql = "DELETE FROM teams WHERE id = ?";
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

