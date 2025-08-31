// stagesController.js
const connection = require('./../../services/connection');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const query = promisify(connection.query).bind(connection);

// Get all stages
exports.getAllStages = async (req, res) => {
    try {
        const sql = `SELECT * FROM stages ORDER BY start_date ASC`;
        const stages = await query(sql);
        
        // Format dates for frontend display
        const formattedStages = stages.map(stage => ({
            ...stage,
            start_date: formatDate(stage.start_date),
            end_date: formatDate(stage.end_date)
        }));
        
        return res.status(200).json(formattedStages);
    } catch (err) {
        console.error("Error fetching stages:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get single stage by ID
exports.getStageById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM stages WHERE id = ?`;
        const results = await query(sql, [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Stage not found" });
        }
        
        const stage = results[0];
        // Format dates for frontend display
        stage.start_date = formatDate(stage.start_date);
        stage.end_date = formatDate(stage.end_date);
        
        return res.status(200).json(stage);
    } catch (err) {
        console.error("Error fetching stage:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Add new stage
exports.addStage = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;
        let imagePath = null;
        
        // Validate required fields
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ message: "Name, start date and end date are required" });
        }
        
        // Handle image upload if exists
        if (req.file) {
            imagePath = `/uploads/stages/${req.file.filename}`;
        }
        
        const sql = `INSERT INTO stages (name, description, start_date, end_date, image_path) VALUES (?, ?, ?, ?, ?)`;
        const result = await query(sql, [name, description, startDate, endDate, imagePath]);
        
        return res.status(201).json({
            message: "Stage added successfully",
            stageId: result.insertId
        });
    } catch (err) {
        console.error("Error adding stage:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update existing stage
exports.updateStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate } = req.body;
        
        // Validate required fields
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ message: "Name, start date and end date are required" });
        }
        
        // Check if stage exists
        const checkSql = `SELECT * FROM stages WHERE id = ?`;
        const existingStage = await query(checkSql, [id]);
        
        if (existingStage.length === 0) {
            return res.status(404).json({ message: "Stage not found" });
        }
        
        let imagePath = existingStage[0].image_path;
        
        // Handle image update if a new file is uploaded
        if (req.file) {
            // Delete old image if exists
            if (imagePath && fs.existsSync(path.join(__dirname, `../../../public${imagePath}`))) {
                fs.unlinkSync(path.join(__dirname, `../../../public${imagePath}`));
            }
            imagePath = `/uploads/stages/${req.file.filename}`;
        }
        
        const updateSql = `UPDATE stages SET name = ?, description = ?, start_date = ?, end_date = ?, image_path = ? WHERE id = ?`;
        await query(updateSql, [name, description, startDate, endDate, imagePath, id]);
        
        return res.status(200).json({ message: "Stage updated successfully" });
    } catch (err) {
        console.error("Error updating stage:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a stage
exports.deleteStage = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if stage exists
        const checkSql = `SELECT * FROM stages WHERE id = ?`;
        const existingStage = await query(checkSql, [id]);
        
        if (existingStage.length === 0) {
            return res.status(404).json({ message: "Stage not found" });
        }
        
        // Delete associated image if exists
        const imagePath = existingStage[0].image_path;
        if (imagePath && fs.existsSync(path.join(__dirname, `../../../public${imagePath}`))) {
            fs.unlinkSync(path.join(__dirname, `../../../public${imagePath}`));
        }
        
        // Delete the stage
        const deleteSql = `DELETE FROM stages WHERE id = ?`;
        await query(deleteSql, [id]);
        
        return res.status(200).json({ message: "Stage deleted successfully" });
    } catch (err) {
        console.error("Error deleting stage:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}