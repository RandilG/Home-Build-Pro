const connection = require('../../services/connection');

module.exports = function updateProject(req, res) {
    console.log('Received update project data:', req.body);
    console.log('Project ID from params:', req.params.id);
    
    const projectId = req.params.id;
    const { name, description, startDate, estimatedEndDate, imageUrl } = req.body;
    
    if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
    }
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: "Project name is required" });
    }
    
    // First check if project exists
    const checkSql = `SELECT id FROM projects WHERE id = ?`;
    
    connection.query(checkSql, [projectId], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        // Project exists, proceed with update
        const updateSql = `
            UPDATE projects 
            SET name = ?, 
                description = ?, 
                start_date = ?, 
                estimated_end_date = ?, 
                image_url = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        connection.query(
            updateSql, 
            [
                name.trim(), 
                description || null, 
                startDate || null, 
                estimatedEndDate || null, 
                imageUrl || null,
                projectId
            ],
            (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Database update error:", updateErr);
                    return res.status(500).json({ error: "Failed to update project" });
                }
                
                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ error: "Project not found or no changes made" });
                }
                
                console.log(`Project ${projectId} updated successfully`);
                return res.status(200).json({
                    id: parseInt(projectId),
                    message: "Project updated successfully"
                });
            }
        );
    });
};