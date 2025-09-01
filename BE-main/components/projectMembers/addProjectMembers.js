const connection = require('../../services/connection');

module.exports = function addProjectMembers(req, res) {
  const { id } = req.params;
  const { userIds } = req.body;
  
  console.log('Project ID:', id);
  console.log('User IDs to add:', userIds);
  
  // Validate input
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'No users specified or invalid format' });
  }

  // First, check if the project exists
  connection.query(
    'SELECT id FROM projects WHERE id = ?',
    [id],
    (err, projectRows) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if users exist
      const userPlaceholders = userIds.map(() => '?').join(',');
      connection.query(
        `SELECT id FROM users WHERE id IN (${userPlaceholders})`,
        userIds,
        (err, existingUsers) => {
          if (err) {
            console.error("Error checking user existence:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (existingUsers.length !== userIds.length) {
            return res.status(400).json({ message: 'Some users do not exist' });
          }

          // Check which users are already members
          connection.query(
            `SELECT user_id FROM project_members WHERE project_id = ? AND user_id IN (${userPlaceholders})`,
            [id, ...userIds],
            (err, existingMembers) => {
              if (err) {
                console.error("Error checking existing members:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              // Filter out users who are already members
              const existingMemberIds = existingMembers.map(row => row.user_id);
              const newUserIds = userIds.filter(userId => !existingMemberIds.includes(parseInt(userId)));

              if (newUserIds.length === 0) {
                return res.status(400).json({ message: 'All selected users are already members' });
              }

              // Add members one by one to handle individual errors
              let addedCount = 0;
              let processedCount = 0;

              newUserIds.forEach(userId => {
                connection.query(
                  'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
                  [id, userId, 'member'],
                  (err, result) => {
                    processedCount++;
                    
                    if (err) {
                      console.error("Error adding member:", err);
                    } else {
                      addedCount++;
                    }

                    // When all users have been processed
                    if (processedCount === newUserIds.length) {
                      return res.status(201).json({ 
                        message: 'Members added successfully',
                        added: addedCount,
                        skipped: existingMemberIds.length,
                        total_requested: userIds.length
                      });
                    }
                  }
                );
              });
            }
          );
        }
      );
    }
  );
};