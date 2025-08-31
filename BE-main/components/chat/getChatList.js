const connection = require('../../services/connection');

module.exports = async function getChatList(req, res) {
    const { userId } = req.params;

    const sql = `
        SELECT DISTINCT
            p.id as project_id,
            p.name as project_name,
            p.description,
            pm.role,
            (SELECT m.content 
             FROM messages m 
             WHERE m.project_id = p.id 
             ORDER BY m.timestamp DESC 
             LIMIT 1) as last_message,
            (SELECT m.timestamp 
             FROM messages m 
             WHERE m.project_id = p.id 
             ORDER BY m.timestamp DESC 
             LIMIT 1) as last_message_time,
            (SELECT COUNT(*) 
             FROM messages m 
             WHERE m.project_id = p.id 
             AND m.timestamp > COALESCE(pm.last_read, '1970-01-01')) as unread_count
        FROM project_members pm
        JOIN projects p ON pm.project_id = p.id
        WHERE pm.user_id = ?
        ORDER BY last_message_time DESC
    `;

    try {
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                console.error("Database error while fetching chat list:", err);
                return res.status(500).json({ error: "Failed to fetch chat list" });
            }

            return res.status(200).json(result);
        });
    } catch (error) {
        console.error("Error fetching chat list:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};