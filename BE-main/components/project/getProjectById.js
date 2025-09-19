const connection = require('../../services/connection');

module.exports = function getProjectById(req, res) {
    console.log('Fetching project with ID:', req.params.id);
    
    const { id } = req.params;
    
    // Validate that ID is a number
    const projectId = parseInt(id);
    if (isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({ error: "Invalid project ID" });
    }
    
    const sql = `
        SELECT 
            id,
            name,
            description,
            start_date,
            estimated_end_date,
            image_url,
            user_id,
            current_stage_id,
            created_at,
            updated_at
        FROM projects 
        WHERE id = ?
    `;
    
    connection.query(sql, [projectId], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            console.log(`Project with ID ${projectId} not found`);
            return res.status(404).json({ error: "Project not found" });
        }
        
        console.log(`Project ${projectId} fetched successfully`);
        return res.status(200).json(result[0]);
    });
};