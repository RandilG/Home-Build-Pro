const connection = require('../../services/connection');

module.exports = function removeProjectMember(req, res) {
  const { id: projectId, memberId } = req.params;
  
  console.log('Remove member request - Project ID:', projectId, 'Member ID:', memberId);
  console.log('Full params:', req.params);
  console.log('Full URL:', req.originalUrl);
  
  // Validate input
  if (!projectId || !memberId) {
    console.log('Missing required parameters');
    return res.status(400).json({ message: 'Project ID and Member ID are required' });
  }

  // Convert to integers for comparison
  const projectIdInt = parseInt(projectId);
  const memberIdInt = parseInt(memberId);

  if (isNaN(projectIdInt) || isNaN(memberIdInt)) {
    console.log('Invalid ID format');
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // First, check if the project exists
  connection.query(
    'SELECT id FROM projects WHERE id = ?',
    [projectIdInt],
    (err, projectRows) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (projectRows.length === 0) {
        console.log('Project not found');
        return res.status(404).json({ message: 'Project not found' });
      }

      console.log('Project exists, checking member...');

      // Check if the member exists in the project
      connection.query(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectIdInt, memberIdInt],
        (err, memberRows) => {
          if (err) {
            console.error("Error checking member existence:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          console.log('Member check result:', memberRows);

          if (memberRows.length === 0) {
            console.log('Member not found in project');
            return res.status(404).json({ message: 'Member not found in this project' });
          }

          // Don't allow removing project owner
          if (memberRows[0].role === 'owner') {
            console.log('Cannot remove project owner');
            return res.status(403).json({ message: 'Cannot remove project owner' });
          }

          // Remove the member
          connection.query(
            'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectIdInt, memberIdInt],
            (err, result) => {
              if (err) {
                console.error("Error removing member:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (result.affectedRows === 0) {
                console.log('No rows affected during deletion');
                return res.status(404).json({ message: 'Member not found or already removed' });
              }

              console.log('Member removed successfully');
              return res.status(200).json({ 
                message: 'Member removed successfully',
                removedMemberId: memberIdInt
              });
            }
          );
        }
      );
    }
  );
};