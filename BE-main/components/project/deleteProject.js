const connection = require('../../services/connection');

module.exports = function deleteProject(req, res) {
  const { id } = req.params;
  const userId = req.user.id; // Assuming authentication middleware sets req.user
  
  // Check if user is project owner
  connection.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [id, userId],
    (err, roleRows) => {
      if (err) {
        console.error("Error checking user role:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (roleRows.length === 0 || roleRows[0].role !== 'owner') {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Delete the project (cascading deletes will handle related records)
      connection.query(
        'DELETE FROM projects WHERE id = ?', 
        [id],
        (err, result) => {
          if (err) {
            console.error("Error deleting project:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          
          return res.json({ message: 'Project deleted successfully' });
        }
      );
    }
  );
};