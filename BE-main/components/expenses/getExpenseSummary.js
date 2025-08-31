const connection = require('../../services/connection');

module.exports = function getExpenseSummary(req, res) {
    const { email } = req.params;
    const { projectId } = req.query;
    
    let sql = `
        SELECT 
            COUNT(*) as total_expenses,
            SUM(e.amount) as total_amount,
            AVG(e.amount) as avg_expense,
            DATE(MAX(e.created_at)) as last_expense_date
        FROM expenses e
        JOIN projects p ON e.project_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE u.email = ?
    `;
    
    const queryParams = [email];
    
    if (projectId) {
        sql += ' AND e.project_id = ?';
        queryParams.push(projectId);
    }
    
    connection.query(sql, queryParams, (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        // Get this month's expenses
        const monthSql = `
            SELECT 
                COUNT(*) as monthly_expenses,
                SUM(e.amount) as monthly_amount
            FROM expenses e
            JOIN projects p ON e.project_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE u.email = ? 
            AND MONTH(e.date) = MONTH(CURRENT_DATE()) 
            AND YEAR(e.date) = YEAR(CURRENT_DATE())
            ${projectId ? 'AND e.project_id = ?' : ''}
        `;
        
        connection.query(monthSql, queryParams, (err, monthResult) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            return res.status(200).json({
                total: result[0] || { total_expenses: 0, total_amount: 0, avg_expense: 0, last_expense_date: null },
                monthly: monthResult[0] || { monthly_expenses: 0, monthly_amount: 0 }
            });
        });
    });
};