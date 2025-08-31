const connection = require('../../services/connection');

module.exports = function getProjectById(req, res) {
    const { id } = req.params;
    const sql = `SELECT * FROM projects WHERE id = ?`;
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        return res.status(200).json(result[0]);
    });
};