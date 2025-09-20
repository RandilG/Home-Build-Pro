const connection = require('../../services/connection');
const path = require('path');
const fs = require('fs');

module.exports = async function deleteProjectPhoto(req, res) {
    const { id: projectId, photoId } = req.params;
    const { userId } = req.body;

    // Validate required parameters
    if (!projectId || !photoId || !userId) {
        return res.status(400).json({ 
            success: false,
            error: 'Project ID, Photo ID, and User ID are required' 
        });
    }

    try {
        // First, get the photo details to check ownership and get file path
        const getPhotoSql = `
            SELECT 
                p.id,
                p.project_id,
                p.user_id,
                p.photo_url,
                p.photo_name,
                p.description,
                p.uploaded_at,
                u.name as user_name
            FROM project_photos p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ? AND p.project_id = ?
        `;
        
        connection.query(getPhotoSql, [photoId, projectId], (err, photoResult) => {
            if (err) {
                console.error("Database error while fetching photo:", err);
                return res.status(500).json({ 
                    success: false,
                    error: "Database error" 
                });
            }

            if (photoResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Photo not found'
                });
            }

            const photo = photoResult[0];

            // Check if the user owns this photo
            if (photo.user_id !== parseInt(userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only delete your own photos'
                });
            }

            // Delete the physical file
            if (photo.photo_url) {
                // Create the full file path
                const filePath = path.join(__dirname, '../../../public', photo.photo_url);
                
                // Check if file exists and delete it
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    } catch (fileError) {
                        console.error('Error deleting file:', fileError);
                        // Continue with database deletion even if file deletion fails
                    }
                } else {
                    console.log(`File not found: ${filePath}`);
                }
            }

            // Delete from database
            const deleteSql = `DELETE FROM project_photos WHERE id = ? AND project_id = ? AND user_id = ?`;
            
            connection.query(deleteSql, [photoId, projectId, userId], (err, deleteResult) => {
                if (err) {
                    console.error('Error deleting from database:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to delete photo from database'
                    });
                }

                // Check if deletion was successful
                if (deleteResult.affectedRows > 0) {
                    // Optional: Log the deletion activity
                    const logActivitySql = `
                        INSERT INTO activity_logs (user_id, project_id, action, details, created_at) 
                        VALUES (?, ?, 'photo_deleted', ?, NOW())
                    `;
                    
                    connection.query(logActivitySql, [
                        userId, 
                        projectId, 
                        JSON.stringify({ 
                            photoId: photo.id, 
                            photoName: photo.photo_name 
                        })
                    ], (logErr) => {
                        if (logErr) {
                            console.error('Error logging activity:', logErr);
                            // Don't fail the request if logging fails
                        }
                    });

                    // Broadcast to WebSocket clients if available
                    if (req.app && req.app.get('wss')) {
                        req.app.get('wss').broadcastToProject(projectId, {
                            type: 'photo_deleted',
                            photoId: photoId,
                            userId: userId
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Photo deleted successfully'
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        error: 'Failed to delete photo from database'
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};