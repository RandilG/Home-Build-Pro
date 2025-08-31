const connection = require('../../services/connection');

module.exports = async function getProjectMembers(req, res) {
    const { projectId } = req.params;

    const sql = `
        SELECT 
            u.id,
            u.name,
            u.email,
            pm.role,
            pm.created_at as joined_at
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
        ORDER BY pm.created_at ASC
    `;

    try {
        connection.query(sql, [projectId], (err, result) => {
            if (err) {
                console.error("Database error while fetching project members:", err);
                return res.status(500).json({ error: "Failed to fetch project members" });
            }

            return res.status(200).json(result);
        });
    } catch (error) {
        console.error("Error fetching project members:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};