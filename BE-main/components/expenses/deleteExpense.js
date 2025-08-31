const connection = require('../../services/connection');

module.exports = function deleteExpense(req, res) {
    const { id } = req.params;
    
    const sql = 'DELETE FROM expenses WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        
        return res.status(200).json({ message: "Expense deleted successfully" });
    });
};