const connection = require('../../services/connection');

module.exports = function getExpenseAnalytics(req, res) {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const queryParams = [projectId];
    
    if (startDate && endDate) {
        dateFilter = 'AND e.date BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }
    
    // Get category-wise expenses
    const categorySql = `
        SELECT 
            category,
            COUNT(*) as expense_count,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount
        FROM expenses e
        WHERE project_id = ? ${dateFilter}
        GROUP BY category
        ORDER BY total_amount DESC
    `;
    
    connection.query(categorySql, queryParams, (err, categoryResult) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        // Get monthly breakdown
        const monthlySql = `
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                COUNT(*) as expense_count,
                SUM(amount) as total_amount
            FROM expenses e
            WHERE project_id = ? ${dateFilter}
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month DESC
        `;
        
        connection.query(monthlySql, queryParams, (err, monthlyResult) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            // Get total project expenses
            const totalSql = `
                SELECT 
                    COUNT(*) as total_expenses,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_expense,
                    MAX(amount) as highest_expense,
                    MIN(amount) as lowest_expense
                FROM expenses e
                WHERE project_id = ? ${dateFilter}
            `;
            
            connection.query(totalSql, queryParams, (err, totalResult) => {
                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                
                return res.status(200).json({
                    categoryBreakdown: categoryResult,
                    monthlyBreakdown: monthlyResult,
                    summary: totalResult[0] || {
                        total_expenses: 0,
                        total_amount: 0,
                        avg_expense: 0,
                        highest_expense: 0,
                        lowest_expense: 0
                    }
                });
            });
        });
    });
};