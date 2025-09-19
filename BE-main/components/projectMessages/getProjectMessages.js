// GET /api/projects/:projectId/messages
const connection = require('../../services/connection');

module.exports = async function getProjectMessages(req, res) {
    const { projectId } = req.params;
    
    console.log('Fetching messages for project:', projectId);

    // Check if user has access to this project (same logic as send message)
    const getMessagesSql = `
        SELECT 
            m.id,
            m.project_id,
            m.user_id,
            m.content,
            m.timestamp,
            u.name as user_name
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.project_id = ?
        ORDER BY m.timestamp ASC
    `;

    try {
        connection.query(getMessagesSql, [projectId], (err, messages) => {
            if (err) {
                console.error("Database error fetching messages:", err);
                return res.status(500).json({ error: "Failed to fetch messages" });
            }

            const formattedMessages = messages.map(msg => ({
                id: msg.id,
                projectId: msg.project_id,
                userId: msg.user_id,
                userName: msg.user_name,
                content: msg.content,
                timestamp: msg.timestamp
            }));

            console.log(`Returning ${formattedMessages.length} messages`);
            return res.status(200).json(formattedMessages);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};