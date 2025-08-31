const connection = require('../../services/connection');

module.exports = function updateExpense(req, res) {
    const { id } = req.params;
    const { description, amount, category, date, receiptUrl, notes } = req.body;
    
    if (!description || !amount) {
        return res.status(400).json({ error: "Description and amount are required" });
    }
    
    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
    }
    
    const sql = `
        UPDATE expenses 
        SET description = ?, amount = ?, category = ?, date = ?, receipt_url = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
    `;
    
    connection.query(
        sql, 
        [description, parseFloat(amount), category || 'other', date, receiptUrl || null, notes || null, id],
        (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            
            return res.status(200).json({ message: "Expense updated successfully" });
        }
    );
};