const connection = require('../../services/connection');

module.exports = async function addProjectMember(req, res) {
    const { projectId } = req.params;
    const { userId, role = 'viewer' } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sql = `
        INSERT INTO project_members (project_id, user_id, role, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
            role = VALUES(role),
            updated_at = NOW()
    `;

    try {
        connection.query(sql, [projectId, userId, role], (err, result) => {
            if (err) {
                console.error("Database error while adding project member:", err);
                return res.status(500).json({ error: "Failed to add project member" });
            }

            return res.status(201).json({
                success: true,
                message: "Project member added successfully"
            });
        });
    } catch (error) {
        console.error("Error adding project member:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};