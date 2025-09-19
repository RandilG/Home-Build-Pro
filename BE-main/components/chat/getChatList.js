const connection = require('../../services/connection');

module.exports = async function getChatList(req, res) {
    const { userId } = req.params;
    
    console.log('Fetching chat list for user:', userId);

    const sql = `
        SELECT DISTINCT
            p.id as project_id,
            p.name as project_name,
            p.description,
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
             WHERE m.project_id = p.id) as message_count
        FROM project_members pm
        JOIN projects p ON pm.project_id = p.id
        WHERE pm.user_id = ?
        ORDER BY last_message_time DESC NULLS LAST
    `;

    try {
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                console.error("Database error while fetching chat list:", err);
                return res.status(500).json({ error: "Failed to fetch chat list" });
            }

            console.log(`Found ${result.length} chats for user ${userId}`);

            // Format the result
            const formattedResult = result.map(chat => ({
                project_id: chat.project_id,
                project_name: chat.project_name,
                description: chat.description,
                last_message: chat.last_message,
                last_message_time: chat.last_message_time,
                message_count: chat.message_count || 0,
                unread_count: 0 // You can implement read status tracking later
            }));

            return res.status(200).json(formattedResult);
        });
    } catch (error) {
        console.error("Error fetching chat list:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};