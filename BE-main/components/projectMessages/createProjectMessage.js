const connection = require('../../services/connection');

module.exports = async function createProjectMessage(req, res) {
    const { id: projectId } = req.params;
    const { content, userId } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
    }

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user is a member of this project
    const checkMemberSql = `
        SELECT pm.id FROM project_members pm 
        WHERE pm.project_id = ? AND pm.user_id = ?
    `;

    try {
        connection.query(checkMemberSql, [projectId, userId], (err, memberResult) => {
            if (err) {
                console.error("Database error checking membership:", err);
                return res.status(500).json({ error: "Failed to verify project access" });
            }

            if (memberResult.length === 0) {
                return res.status(403).json({ error: "You are not a member of this project" });
            }

            // Insert the message
            const insertSql = `
                INSERT INTO messages (project_id, user_id, content, timestamp, created_at, updated_at) 
                VALUES (?, ?, ?, NOW(), NOW(), NOW())
            `;

            connection.query(insertSql, [projectId, userId, content.trim()], (err, result) => {
                if (err) {
                    console.error("Database error while sending message:", err);
                    return res.status(500).json({ error: "Failed to send message" });
                }

                // Get the inserted message with user info
                const getMessageSql = `
                    SELECT 
                        m.id,
                        m.project_id,
                        m.user_id,
                        m.content,
                        m.timestamp,
                        u.name as user_name
                    FROM messages m
                    JOIN users u ON m.user_id = u.id
                    WHERE m.id = ?
                `;
                
                connection.query(getMessageSql, [result.insertId], (err, messageResult) => {
                    if (err) {
                        console.error("Error fetching sent message:", err);
                        return res.status(500).json({ error: "Message sent but failed to retrieve" });
                    }

                    const newMessage = {
                        id: messageResult[0].id,
                        projectId: messageResult[0].project_id,
                        userId: messageResult[0].user_id,
                        userName: messageResult[0].user_name,
                        content: messageResult[0].content,
                        timestamp: messageResult[0].timestamp
                    };
                    
                    // Broadcast to WebSocket clients
                    if (req.app.get('wss')) {
                        req.app.get('wss').broadcastToProject(projectId, {
                            type: 'new_message',
                            message: newMessage
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message: newMessage
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};