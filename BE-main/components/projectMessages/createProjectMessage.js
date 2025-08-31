const connection = require('../../services/connection');

module.exports = function createProjectMessage(req, res) {
  const { id } = req.params;
  const { content, userId } = req.body;
  
  // Validate user is a member of the project
  connection.query(
    'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
    [id, userId],
    (err, memberRows) => {
      if (err) {
        console.error("Error checking project membership:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (memberRows.length === 0) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Insert new message
      connection.query(
        'INSERT INTO messages (project_id, user_id, content) VALUES (?, ?, ?)',
        [id, userId, content],
        (err, result) => {
          if (err) {
            console.error("Error creating message:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          
          // Get the inserted message with user details
          connection.query(
            `SELECT m.id, m.content, m.timestamp, m.user_id as userId, u.name as userName, u.avatar
             FROM messages m
             JOIN users u ON m.user_id = u.id
             WHERE m.id = ?`,
            [result.insertId],
            (err, messageRows) => {
              if (err) {
                console.error("Error fetching new message:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }
              
              return res.status(201).json(messageRows[0]);
              
              // Broadcast message via WebSocket if implemented
              // websocketServer.broadcast(JSON.stringify(messageRows[0]));
            }
          );
        }
      );
    }
  );
};