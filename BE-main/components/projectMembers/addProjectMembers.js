const connection = require('../../services/connection');

module.exports = function addProjectMembers(req, res) {
  const { id } = req.params;
  const { userIds } = req.body;
  const userId = req.user.id; // Assuming authentication middleware sets req.user
  
  // Check if user has permission to add members
  connection.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [id, userId],
    (err, roleRows) => {
      if (err) {
        console.error("Error checking user permissions:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (roleRows.length === 0 || (roleRows[0].role !== 'owner' && roleRows[0].role !== 'admin')) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Track successful additions
      let addedCount = 0;
      let errorCount = 0;
      
      // If no users to add, return immediately
      if (!userIds || userIds.length === 0) {
        return res.status(400).json({ message: 'No users specified' });
      }
      
      // Add each user
      userIds.forEach(userId => {
        connection.query(
          'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
          [id, userId, 'member'],
          (err) => {
            if (err) {
              // Ignore duplicate entry errors
              if (err.code !== 'ER_DUP_ENTRY') {
                console.error("Error adding member:", err);
                errorCount++;
              }
            } else {
              addedCount++;
            }
            
            // When all queries have been attempted
            if (addedCount + errorCount === userIds.length) {
              return res.status(201).json({ 
                message: 'Members added successfully',
                added: addedCount,
                errors: errorCount
              });
            }
          }
        );
      });
    }
  );
};