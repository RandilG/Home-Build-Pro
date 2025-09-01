const connection = require('../../services/connection');

module.exports = function removeProjectMember(req, res) {
  const { id: projectId, memberId } = req.params;
  
  console.log('Project ID:', projectId);
  console.log('Member ID to remove:', memberId);
  
  // Validate input
  if (!projectId || !memberId) {
    return res.status(400).json({ message: 'Project ID and Member ID are required' });
  }

  // First, check if the project exists
  connection.query(
    'SELECT id FROM projects WHERE id = ?',
    [projectId],
    (err, projectRows) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if the member exists in the project
      connection.query(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, memberId],
        (err, memberRows) => {
          if (err) {
            console.error("Error checking member existence:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (memberRows.length === 0) {
            return res.status(404).json({ message: 'Member not found in this project' });
          }

          // Remove the member
          connection.query(
            'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectId, memberId],
            (err, result) => {
              if (err) {
                console.error("Error removing member:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Member not found or already removed' });
              }

              console.log('Member removed successfully');
              return res.status(200).json({ 
                message: 'Member removed successfully',
                removedMemberId: memberId
              });
            }
          );
        }
      );
    }
  );
};