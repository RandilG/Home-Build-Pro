const connection = require('../../services/connection');

module.exports = function getAllProjects(req, res) {
    const sql = `SELECT * FROM projects`;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json(result);
    });
};