const connection = require('../../services/connection');

module.exports = async function getProjectPhotos(req, res) {
    const { id: projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
    }

    const sql = `
        SELECT 
            p.id,
            p.project_id,
            p.user_id,
            p.photo_url,
            p.photo_name,
            p.description,
            p.file_size,
            p.file_type,
            p.uploaded_at,
            u.name as user_name,
            u.profileImage as user_avatar
        FROM project_photos p
        JOIN users u ON p.user_id = u.id
        WHERE p.project_id = ?
        ORDER BY p.uploaded_at DESC
        LIMIT ? OFFSET ?
    `;

    try {
        connection.query(sql, [projectId, parseInt(limit), parseInt(offset)], (err, result) => {
            if (err) {
                console.error("Database error while fetching project photos:", err);
                return res.status(500).json({ error: "Failed to fetch project photos" });
            }

            // Format the photos for frontend
            const formattedPhotos = result.map(photo => ({
                id: photo.id,
                projectId: photo.project_id,
                userId: photo.user_id,
                userName: photo.user_name,
                userAvatar: photo.user_avatar,
                photoUrl: photo.photo_url,
                photoName: photo.photo_name,
                description: photo.description,
                fileSize: photo.file_size,
                fileType: photo.file_type,
                uploadedAt: photo.uploaded_at
            }));

            return res.status(200).json(formattedPhotos);
        });
    } catch (error) {
        console.error("Error fetching project photos:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
