const connection = require('./../../services/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../public/uploads/profiles');
        
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
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // limit to 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('profileImage');

module.exports = async function uploadImage(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { userId } = req.body;

        if (!userId) {
            // Remove uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            // Update user profile with new image URL
            const imageUrl = `/uploads/profiles/${req.file.filename}`;
            const sql = `UPDATE users SET profileImage = ? WHERE id = ?`;

            connection.query(sql, [imageUrl, userId], (err, result) => {
                if (err) {
                    console.error("Database error while saving profile image:", err);
                    fs.unlinkSync(req.file.path);
                    return res.status(500).json({ error: "Failed to save profile image" });
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Profile image updated successfully',
                    imageUrl: imageUrl
                });
            });
        } catch (error) {
            console.error('Server error in uploadImage:', error);
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ error: 'Server error' });
        }
    });
};