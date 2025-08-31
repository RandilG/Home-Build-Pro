const connection = require('../../services/connection');

module.exports = function getProjectExpenses(req, res) {
    const { projectId } = req.params;
    const { startDate, endDate, category } = req.query;
    
    let sql = `
        SELECT e.*, u.name as user_name, p.name as project_name
        FROM expenses e
        JOIN users u ON e.user_id = u.id
        JOIN projects p ON e.project_id = p.id
        WHERE e.project_id = ?
    `;
    
    const queryParams = [projectId];
    
    // Add optional filters
    if (startDate) {
        sql += ' AND e.date >= ?';
        queryParams.push(startDate);
    }
    
    if (endDate) {
        sql += ' AND e.date <= ?';
        queryParams.push(endDate);
    }
    
    if (category) {
        sql += ' AND e.category = ?';
        queryParams.push(category);
    }
    
    sql += ' ORDER BY e.date DESC, e.created_at DESC';
    
    connection.query(sql, queryParams, (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json(result);
    });
};