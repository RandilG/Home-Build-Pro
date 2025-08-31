const connection = require('../../services/connection');

module.exports = async function getProjectMessages(req, res) {
    const { id: projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const sql = `
        SELECT 
            m.id,
            m.project_id,
            m.user_id,
            m.content,
            m.timestamp,
            m.created_at,
            m.updated_at,
            u.name as user_name
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.project_id = ?
        ORDER BY m.timestamp ASC
        LIMIT ? OFFSET ?
    `;

    try {
        connection.query(sql, [projectId, parseInt(limit), parseInt(offset)], (err, result) => {
            if (err) {
                console.error("Database error while fetching messages:", err);
                return res.status(500).json({ error: "Failed to fetch messages" });
            }

            // Format the messages for frontend
            const formattedMessages = result.map(message => ({
                id: message.id,
                projectId: message.project_id,
                userId: message.user_id,
                userName: message.user_name,
                content: message.content,
                timestamp: message.timestamp,
                createdAt: message.created_at,
                updatedAt: message.updated_at
            }));

            return res.status(200).json(formattedMessages);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};