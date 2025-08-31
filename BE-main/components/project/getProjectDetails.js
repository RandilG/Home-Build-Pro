const connection = require('../../services/connection');

module.exports = function getProjectDetails(req, res) {
  const { id } = req.params;
  
  // Get project details
  connection.query(
    'SELECT * FROM projects WHERE id = ?',
    [id],
    (err, projectRows) => {
      if (err) {
        console.error("Error fetching project:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const project = projectRows[0];
      
      // Get project members
      connection.query(
        `SELECT u.id, u.name, u.avatar, pm.role 
         FROM users u
         JOIN project_members pm ON u.id = pm.user_id
         WHERE pm.project_id = ?`,
        [id],
        (err, memberRows) => {
          if (err) {
            console.error("Error fetching project members:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          
          // Get project checklists
          connection.query(
            'SELECT * FROM checklists WHERE project_id = ?',
            [id],
            (err, checklistRows) => {
              if (err) {
                console.error("Error fetching checklists:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }
              
              let completedChecklists = 0;
              const checklists = [];
              
              // If no checklists, return project immediately
              if (checklistRows.length === 0) {
                return res.json({
                  ...project,
                  members: memberRows,
                  checklists: []
                });
              }
              
              // Process each checklist to get its items
              checklistRows.forEach((checklist, index) => {
                connection.query(
                  'SELECT * FROM checklist_items WHERE checklist_id = ?',
                  [checklist.id],
                  (err, itemRows) => {
                    if (err) {
                      console.error("Error fetching checklist items:", err);
                      return res.status(500).json({ error: "Internal Server Error" });
                    }
                    
                    checklists.push({
                      ...checklist,
                      items: itemRows
                    });
                    
                    completedChecklists++;
                    
                    // When all checklists are processed, return the complete project
                    if (completedChecklists === checklistRows.length) {
                      return res.json({
                        ...project,
                        members: memberRows,
                        checklists: checklists
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