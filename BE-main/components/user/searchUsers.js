const connection = require('../../services/connection');

module.exports = function searchUsers(req, res) {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  connection.query(
    `SELECT id, name, email, avatar 
     FROM users 
     WHERE name LIKE ? OR email LIKE ?
     LIMIT 10`,
    [`%${q}%`, `%${q}%`],
    (err, userRows) => {
      if (err) {
        console.error("Error searching users:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      return res.json(userRows);
    }
  );
};