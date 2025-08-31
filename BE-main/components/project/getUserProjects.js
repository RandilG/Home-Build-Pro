const connection = require('../../services/connection');

module.exports = function getUserProjects(req, res) {
    const { email } = req.params;
    const sql = `
        SELECT p.* FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE u.email = ?
        ORDER BY p.created_at DESC
    `;
    
    connection.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json(result);
    });
};