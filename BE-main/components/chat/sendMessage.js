const connection = require('../../services/connection');

module.exports = async function sendMessage(req, res) {
    const { projectId } = req.params;
    const { content, userId } = req.body;

    console.log('Send message request:', { projectId, userId, content: content?.substring(0, 50) });

    if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
    }

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user is either the project owner OR a member of this project
    const checkAccessSql = `
        SELECT 'owner' as role FROM projects p WHERE p.id = ? AND p.user_id = ?
        UNION
        SELECT 'member' as role FROM project_members pm WHERE pm.project_id = ? AND pm.user_id = ?
    `;

    try {
        connection.query(checkAccessSql, [projectId, userId, projectId, userId], (err, accessResult) => {
            if (err) {
                console.error("Database error checking project access:", err);
                return res.status(500).json({ error: "Failed to verify project access" });
            }

            console.log('Access check result:', accessResult);

            if (accessResult.length === 0) {
                return res.status(403).json({ error: "You are not authorized to send messages in this project" });
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

                console.log('Message inserted with ID:', result.insertId);

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

                    if (messageResult.length === 0) {
                        console.error("Message not found after insert");
                        return res.status(500).json({ error: "Message sent but not found" });
                    }

                    const newMessage = {
                        id: messageResult[0].id,
                        projectId: messageResult[0].project_id,
                        userId: messageResult[0].user_id,
                        userName: messageResult[0].user_name,
                        content: messageResult[0].content,
                        timestamp: messageResult[0].timestamp
                    };
                    
                    console.log('New message created:', newMessage);

                    // Broadcast to WebSocket clients
                    try {
                        if (req.app.get('wss')) {
                            req.app.get('wss').broadcastToProject(projectId, {
                                type: 'new_message',
                                message: newMessage
                            });
                            console.log('Message broadcasted to WebSocket clients');
                        }
                    } catch (wsError) {
                        console.error('WebSocket broadcast error:', wsError);
                        // Don't fail the request if WebSocket fails
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