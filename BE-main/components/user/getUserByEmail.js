const connection = require('../../services/connection');

module.exports = function getUserByEmail(req, res) {
    const { email } = req.params;
    const sql = `SELECT id, name, email, created_at FROM users WHERE email = ?`;
    
    connection.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.status(200).json(result[0]);
    });
};