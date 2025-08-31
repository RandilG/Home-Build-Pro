const connection = require('../../services/connection');

module.exports = function addNewProject(req, res) {
    console.log('Received project data:', req.body);
    const { name, description, startDate, estimatedEndDate, userId, imageUrl, currentStageId } = req.body;
    
    if (!name || !userId) {
        return res.status(400).json({ error: "Name and userId are required" });
    }
    
    const sql = `
        INSERT INTO projects 
        (name, description, start_date, estimated_end_date, user_id, image_url, current_stage_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    connection.query(
        sql, 
        [name, description || null, startDate || null, estimatedEndDate || null, userId, imageUrl || null, currentStageId || null],
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
};