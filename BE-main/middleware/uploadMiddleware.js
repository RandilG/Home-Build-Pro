// uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const configureStageImageUpload = () => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = path.join(__dirname, '../../public/uploads/stages');
            
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
            cb(null, 'stage-' + uniqueSuffix + ext);
        }
    });

    // Filter to only allow image files
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    };

    return multer({ 
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // limit to 5MB
        }
    });
};

// Create and export the upload middleware
const uploadStageImage = configureStageImageUpload();

module.exports = {
    uploadStageImage
};