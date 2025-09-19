const connection = require('../../services/connection');

module.exports = function getProjectMembers(req, res) {
  const { id } = req.params;
  
  console.log('Fetching members for project ID:', id);
  
  connection.query(
    `SELECT u.id, u.name, u.email, u.profileImage as avatar
     FROM users u
     JOIN project_members pm ON u.id = pm.user_id
     WHERE pm.project_id = ?`,
    [id],
    (err, memberRows) => {
      if (err) {
        console.error("Error fetching members:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      console.log('Found members:', memberRows.length);
      return res.json(memberRows);
    }
  );
};