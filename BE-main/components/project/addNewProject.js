const connection = require('../../services/connection');

module.exports = function addNewProject(req, res) {
    console.log('Received project data:', req.body);
    const { name, description, startDate, estimatedEndDate, userId, imageUrl } = req.body;
    
    if (!name || !userId) {
        return res.status(400).json({ error: "Name and userId are required" });
    }
    
    // First, get the first available stage ID or set to null
    const getFirstStageQuery = 'SELECT id FROM stages ORDER BY id ASC LIMIT 1';
    
    connection.query(getFirstStageQuery, (err, stageResult) => {
        if (err) {
            console.error("Error fetching first stage:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        const currentStageId = stageResult.length > 0 ? stageResult[0].id : null;
        
        const sql = `
            INSERT INTO projects 
            (name, description, start_date, estimated_end_date, user_id, image_url, current_stage_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        connection.query(
            sql, 
            [name, description || null, startDate || null, estimatedEndDate || null, userId, imageUrl || null, currentStageId],
            (err, result) => {
                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                
                return res.status(201).json({
                    id: result.insertId,
                    message: "Project created successfully"
                });
            }
        );
    });
};