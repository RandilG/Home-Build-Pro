const connection = require('../../services/connection');

module.exports = async function getProjectReports(req, res) {
    const { id: projectId } = req.params;
    const { limit = 50, offset = 0, reportType, status = 'published' } = req.query;

    if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
    }

    let sql = `
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
        WHERE r.project_id = ? AND r.status = ?
    `;

    const params = [projectId, status];

    // Add report type filter if specified
    if (reportType && reportType !== 'all') {
        sql += ` AND r.report_type = ?`;
        params.push(reportType);
    }

    sql += ` ORDER BY r.uploaded_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    try {
        connection.query(sql, params, (err, result) => {
            if (err) {
                console.error("Database error while fetching project reports:", err);
                return res.status(500).json({ error: "Failed to fetch project reports" });
            }

            // Format the reports for frontend
            const formattedReports = result.map(report => ({
                id: report.id,
                projectId: report.project_id,
                userId: report.user_id,
                userName: report.user_name,
                userAvatar: report.user_avatar,
                reportTitle: report.report_title,
                reportDescription: report.report_description,
                reportFileUrl: report.report_file_url,
                reportFileName: report.report_file_name,
                fileSize: report.file_size,
                fileType: report.file_type,
                reportType: report.report_type,
                status: report.status,
                uploadedAt: report.uploaded_at
            }));

            return res.status(200).json(formattedReports);
        });
    } catch (error) {
        console.error("Error fetching project reports:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
