const connection = require('../../services/connection');

module.exports = function getProjectMessages(req, res) {
  const { id } = req.params;
  
  connection.query(
    `SELECT m.id, m.content, m.timestamp, m.user_id as userId, u.name as userName, u.avatar
     FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.project_id = ?
     ORDER BY m.timestamp ASC`,
    [id],
    (err, messageRows) => {
      if (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      return res.json(messageRows);
    }
  );
};