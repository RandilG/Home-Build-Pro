const connection = require('../../services/connection');

module.exports = function getExpenseDetails(req, res) {
    const { id } = req.params;
    
    const sql = `
        SELECT e.*, u.name as user_name, u.email as user_email, p.name as project_name
        FROM expenses e
        JOIN users u ON e.user_id = u.id
        JOIN projects p ON e.project_id = p.id
        WHERE e.id = ?
    `;
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        return res.status(200).json(result[0]);
    });
};