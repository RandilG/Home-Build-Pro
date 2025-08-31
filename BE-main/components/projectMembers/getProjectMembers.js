const connection = require('../../services/connection');

module.exports = function getProjectMembers(req, res) {
  const { id } = req.params;
  
  connection.query(
    `SELECT u.id, u.name, u.email, u.avatar, pm.role 
     FROM users u
     JOIN project_members pm ON u.id = pm.user_id
     WHERE pm.project_id = ?`,
    [id],
    (err, memberRows) => {
      if (err) {
        console.error("Error fetching members:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      return res.json(memberRows);
    }
  );
};