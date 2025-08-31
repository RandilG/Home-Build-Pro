const connection = require('../../services/connection');

// Get user budget
function getUserBudget(req, res) {
    const { email } = req.params;
    
    const sql = `
        SELECT monthly_budget, project_budget, budget_updated_at
        FROM users 
        WHERE email = ?
    `;
    
    connection.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            monthlyBudget: result[0].monthly_budget || 0,
            projectBudget: result[0].project_budget || 0,
            budgetUpdatedAt: result[0].budget_updated_at
        });
    });
}

// Set user budget
function setUserBudget(req, res) {
    const { email } = req.params;
    const { monthlyBudget, projectBudget } = req.body;
    
    if (!monthlyBudget && !projectBudget) {
        return res.status(400).json({ error: "At least one budget value is required" });
    }
    
    const sql = `
        UPDATE users 
        SET monthly_budget = ?, project_budget = ?, budget_updated_at = NOW()
        WHERE email = ?
    `;
    
    connection.query(
        sql, 
        [monthlyBudget || 0, projectBudget || 0, email],
        (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            return res.status(200).json({ message: "Budget updated successfully" });
        }
    );
}

module.exports = { getUserBudget, setUserBudget };