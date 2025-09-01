const connection = require('../../services/connection');

module.exports = async function trackContentView(req, res) {
    const { projectId, userId, contentType, contentId } = req.body;

    if (!projectId || !userId || !contentType || !contentId) {
        return res.status(400).json({ error: "Project ID, User ID, Content Type, and Content ID are required" });
    }

    if (!['photo', 'report'].includes(contentType)) {
        return res.status(400).json({ error: "Content type must be 'photo' or 'report'" });
    }

    try {
        // Check if user is a member of this project
        const checkMemberSql = `
            SELECT pm.id FROM project_members pm 
            WHERE pm.project_id = ? AND pm.user_id = ?
        `;

        connection.query(checkMemberSql, [projectId, userId], (err, memberResult) => {
            if (err) {
                console.error("Database error checking membership:", err);
                return res.status(500).json({ error: "Failed to verify project access" });
            }

            if (memberResult.length === 0) {
                return res.status(403).json({ error: "You are not a member of this project" });
            }

            // Check if content exists
            const contentTable = contentType === 'photo' ? 'project_photos' : 'project_reports';
            const checkContentSql = `
                SELECT id FROM ${contentTable} 
                WHERE id = ? AND project_id = ?
            `;

            connection.query(checkContentSql, [contentId, projectId], (err, contentResult) => {
                if (err) {
                    console.error("Database error checking content:", err);
                    return res.status(500).json({ error: "Failed to verify content" });
                }

                if (contentResult.length === 0) {
                    return res.status(404).json({ error: "Content not found" });
                }

                // Insert or update view record
                const upsertSql = `
                    INSERT INTO project_content_views (project_id, user_id, content_type, content_id) 
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP
                `;

                connection.query(upsertSql, [projectId, userId, contentType, contentId], (err, result) => {
                    if (err) {
                        console.error("Database error while tracking view:", err);
                        return res.status(500).json({ error: "Failed to track view" });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "View tracked successfully"
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error tracking content view:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
