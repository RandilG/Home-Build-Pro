const connection = require('../../services/connection');

module.exports = function deleteProject(req, res) {
  const { id } = req.params;
  
  console.log('Attempting to delete project with ID:', id);
  
  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  // Simply delete the project without any authentication checks
  connection.query(
    'DELETE FROM projects WHERE id = ?', 
    [id],
    (err, result) => {
      if (err) {
        console.error("Error deleting project:", err);
        return res.status(500).json({ error: "Failed to delete project", details: err.message });
      }
      
      console.log('Delete result:', result);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      console.log(`Project ${id} deleted successfully`);
      return res.status(200).json({ 
        message: 'Project deleted successfully',
        deletedProjectId: id
      });
    }
  );
};