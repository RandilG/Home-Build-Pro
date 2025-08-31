const connection = require('../../services/connection');

module.exports = function addNewExpense(req, res) {
    console.log('Received expense data:', req.body);
    const { description, amount, category, date, projectId, userId, receiptUrl, notes } = req.body;
    
    if (!description || !amount || !projectId || !userId) {
        return res.status(400).json({ error: "Description, amount, projectId, and userId are required" });
    }
    
    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
    }
    
    const sql = `
        INSERT INTO expenses 
        (description, amount, category, date, project_id, user_id, receipt_url, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    connection.query(
        sql, 
        [
            description, 
            parseFloat(amount), 
            category || 'other', 
            date || new Date().toISOString().split('T')[0], 
            projectId, 
            userId, 
            receiptUrl || null, 
            notes || null
        ],
        (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            return res.status(201).json({
                id: result.insertId,
                message: "Expense added successfully"
            });
        }
    );
};