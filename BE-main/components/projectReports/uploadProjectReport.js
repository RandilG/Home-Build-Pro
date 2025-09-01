const connection = require('../../services/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for project report uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../public/uploads/reports');
        
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
        cb(null, 'project-report-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // limit to 50MB for reports
    },
    fileFilter: (req, file, cb) => {
        // Allow common document formats
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed. Please upload PDF, Word, Excel, or image files.'), false);
        }
    }
}).single('report');

module.exports = async function uploadProjectReport(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No report file provided' });
        }

        const { id: projectId } = req.params;
        const { userId, reportTitle, reportDescription, reportType } = req.body;

        if (!projectId || !userId || !reportTitle) {
            // Remove uploaded file if validation fails
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: 'Project ID, User ID, and Report Title are required' });
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
                    if (req.file && req.file.path) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(500).json({ error: "Failed to verify project access" });
                }

                if (memberResult.length === 0) {
                    if (req.file && req.file.path) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(403).json({ error: "You are not a member of this project" });
                }

                // Insert report record into database
                const reportUrl = `/uploads/reports/${req.file.filename}`;
                const insertSql = `
                    INSERT INTO project_reports (project_id, user_id, report_title, report_description, report_file_url, report_file_name, file_size, file_type, report_type) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(insertSql, [
                    projectId, 
                    userId, 
                    reportTitle,
                    reportDescription || '',
                    reportUrl, 
                    req.file.originalname,
                    req.file.size,
                    req.file.mimetype,
                    reportType || 'other'
                ], (err, result) => {
                    if (err) {
                        console.error("Database error while saving report:", err);
                        if (req.file && req.file.path) {
                            fs.unlinkSync(req.file.path);
                        }
                        return res.status(500).json({ error: "Failed to save report" });
                    }

                    // Get the inserted report with user info
                    const getReportSql = `
                        SELECT 
                            r.id,
                            r.project_id,
                            r.user_id,
                            r.report_title,
                            r.report_description,
                            r.report_file_url,
                            r.report_file_name,
                            r.file_size,
                            r.file_type,
                            r.report_type,
                            r.status,
                            r.uploaded_at,
                            u.name as user_name,
                            u.profileImage as user_avatar
                        FROM project_reports r
                        JOIN users u ON r.user_id = u.id
                        WHERE r.id = ?
                    `;
                    
                    connection.query(getReportSql, [result.insertId], (err, reportResult) => {
                        if (err) {
                            console.error("Error fetching saved report:", err);
                            return res.status(500).json({ error: "Report saved but failed to retrieve" });
                        }

                        const newReport = {
                            id: reportResult[0].id,
                            projectId: reportResult[0].project_id,
                            userId: reportResult[0].user_id,
                            userName: reportResult[0].user_name,
                            userAvatar: reportResult[0].user_avatar,
                            reportTitle: reportResult[0].report_title,
                            reportDescription: reportResult[0].report_description,
                            reportFileUrl: reportResult[0].report_file_url,
                            reportFileName: reportResult[0].report_file_name,
                            fileSize: reportResult[0].file_size,
                            fileType: reportResult[0].file_type,
                            reportType: reportResult[0].report_type,
                            status: reportResult[0].status,
                            uploadedAt: reportResult[0].uploaded_at
                        };
                        
                        // Broadcast to WebSocket clients if available
                        if (req.app && req.app.get('wss')) {
                            req.app.get('wss').broadcastToProject(projectId, {
                                type: 'new_report',
                                report: newReport
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            report: newReport
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Error uploading project report:", error);
            // Remove uploaded file on error
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};
