const connection = require('../../services/connection');

module.exports = function getUserExpenses(req, res) {
    const { email } = req.params;
    
    const sql = `
        SELECT e.*, p.name as project_name, u.name as user_name
        FROM expenses e
        JOIN projects p ON e.project_id = p.id
        JOIN users u ON e.user_id = u.id
        WHERE u.email = ?
        ORDER BY e.date DESC, e.created_at DESC
    `;
    
    connection.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json(result);
    });
};