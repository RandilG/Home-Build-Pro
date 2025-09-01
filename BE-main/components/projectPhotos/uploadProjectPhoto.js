const connection = require('../../services/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for project photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../public/uploads/projects');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'project-photo-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // limit to 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('photo');

module.exports = async function uploadProjectPhoto(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No photo file provided' });
        }

        const { id: projectId } = req.params;
        const { userId, photoName, description } = req.body;

        if (!projectId || !userId) {
            // Remove uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Project ID and User ID are required' });
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
                    fs.unlinkSync(req.file.path);
                    return res.status(500).json({ error: "Failed to verify project access" });
                }

                if (memberResult.length === 0) {
                    fs.unlinkSync(req.file.path);
                    return res.status(403).json({ error: "You are not a member of this project" });
                }

                // Insert photo record into database
                const photoUrl = `/uploads/projects/${req.file.filename}`;
                const insertSql = `
                    INSERT INTO project_photos (project_id, user_id, photo_url, photo_name, description, file_size, file_type) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(insertSql, [
                    projectId, 
                    userId, 
                    photoUrl, 
                    photoName || req.file.originalname,
                    description || '',
                    req.file.size,
                    req.file.mimetype
                ], (err, result) => {
                    if (err) {
                        console.error("Database error while saving photo:", err);
                        fs.unlinkSync(req.file.path);
                        return res.status(500).json({ error: "Failed to save photo" });
                    }

                    // Get the inserted photo with user info
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
                        WHERE p.id = ?
                    `;
                    
                    connection.query(getPhotoSql, [result.insertId], (err, photoResult) => {
                        if (err) {
                            console.error("Error fetching saved photo:", err);
                            return res.status(500).json({ error: "Photo saved but failed to retrieve" });
                        }

                        const newPhoto = {
                            id: photoResult[0].id,
                            projectId: photoResult[0].project_id,
                            userId: photoResult[0].user_id,
                            userName: photoResult[0].user_name,
                            photoUrl: photoResult[0].photo_url,
                            photoName: photoResult[0].photo_name,
                            description: photoResult[0].description,
                            uploadedAt: photoResult[0].uploaded_at
                        };
                        
                        // Broadcast to WebSocket clients if available
                        if (req.app && req.app.get('wss')) {
                            req.app.get('wss').broadcastToProject(projectId, {
                                type: 'new_photo',
                                photo: newPhoto
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            photo: newPhoto
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Error uploading project photo:", error);
            // Remove uploaded file on error
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};
