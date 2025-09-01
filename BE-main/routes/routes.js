const express = require('express');
const router = express.Router();

// Utils & Middleware
const { authenticateToken } = require('../utils/authUtils');
const { uploadStageImage } = require('../middleware/uploadMiddleware');

// Auth Components
const userSignup = require('../components/auth/userSignup');
const userSignin = require('../components/auth/userSignin');
const verifyOtp = require('../components/auth/verifyOtp');
const ResetPasswordVerification = require('../components/auth/ResetPasswordVerification');
const resetPassword = require('../components/auth/resetPassword');
const changePassword = require('../components/auth/changePassword');

// User Components
const uploadImage = require('../components/user/uploadImage');
const getUserById = require('../components/user/getUserById');
const getUserByEmail = require('../components/user/getUserByEmail');
const ProfileController = require('../components/user/Profile');
const settingsController = require('../components/user/Settings');
const searchUsers = require('../components/user/searchUsers');

// Project Components
const getUserProjects = require('../components/project/getUserProjects');
const addNewProject = require('../components/project/addNewProject');
const getProjectById = require('../components/project/getProjectById');
const getProjectDetails = require('../components/project/getProjectDetails');
const getAllProjects = require('../components/project/getAllProjects');
const deleteProject = require('../components/project/deleteProject');

// Project Messages
const getProjectMessages = require('../components/projectMessages/getProjectMessages');
const createProjectMessage = require('../components/projectMessages/createProjectMessage');

// Project Members
const getProjectMembers = require('../components/projectMembers/getProjectMembers');
const addProjectMembers = require('../components/projectMembers/addProjectMembers');
const removeProjectMember = require('../components/projectMembers/removeMember');

// Chat Components (NEW)
const getChatList = require('../components/chat/getChatList');

// Stages
const stagesController = require('../components/stages/stagesController');

// Expense Components
const addNewExpense = require('../components/expenses/addExpense');
const getProjectExpenses = require('../components/expenses/getProjectExpenses');
const getUserExpenses = require('../components/expenses/getUserExpenses');
const getExpenseDetails = require('../components/expenses/getExpenseDetails');
const updateExpense = require('../components/expenses/updateExpense');
const deleteExpense = require('../components/expenses/deleteExpense');
const { getUserBudget, setUserBudget } = require('../components/expenses/manageBudget');
const getExpenseAnalytics = require('../components/expenses/getExpenseAnalytics');
const getExpenseSummary = require('../components/expenses/getExpenseSummary');

// Test
const mailTest = require('../components/test/mailTest');

// ================== ROUTES ==================

// Auth Routes
router.post('/signup', async(req, res) => {
    userSignup(req, res);
});

router.post('/signin', async(req, res) => {
    userSignin(req, res);
});

router.get('/protected', authenticateToken, (req, res) => { 
    res.status(200).json("Protected Route");
});

router.post('/verify-otp', (req, res) => {
    verifyOtp(req, res);
});

router.post('/reset-password-verification', (req, res) => {
    ResetPasswordVerification(req, res);
});

router.post('/reset-password', (req, res) => {
    resetPassword(req, res);
});

router.put('/change-password', (req, res) => {
    changePassword(req, res);
});

// User Routes
router.put('/upload-image', (req, res) => {
    uploadImage(req, res);
});

router.get('/get-user/:id', (req, res) => {
    getUserById(req, res);
});

router.get('/get-user/:email', ProfileController.getUserProfile);

router.put('/update-user/:email', ProfileController.updateProfile);

router.put('/edit-user', (req, res) => {
    updateProfile(req, res);
});

router.get('/users/search', searchUsers);

// Settings Routes
router.get('/user-settings/:email', settingsController.getUserSettings);
router.post('/update-settings/:email', settingsController.updateSettings);

// Root route
router.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Test Routes
router.get('/test/email', (req, res) => {   
    mailTest(req, res);
});

// Stage Routes
router.get('/stages', stagesController.getAllStages);
router.get('/stages/:id', stagesController.getStageById);
router.post('/stages', uploadStageImage.single('image'), stagesController.addStage);
router.put('/stages/:id', uploadStageImage.single('image'), stagesController.updateStage);
router.delete('/stages/:id', stagesController.deleteStage);

// Project Routes
router.get('/projects/:email', getUserProjects);
router.get('/project/:id', getProjectById);
router.post('/addNewProject', addNewProject);
router.get('/projects', getAllProjects); // Get all projects
router.get('/projects/:id', getProjectDetails);
router.delete('/projects/:id', deleteProject);

// Project Messages Routes (UPDATED for WebSocket support)
router.get('/projects/:id/messages', getProjectMessages);
router.post('/projects/:id/messages', createProjectMessage);

// Project Members Routes
router.get('/projects/:id/members', getProjectMembers);
router.post('/projects/:id/members', addProjectMembers);
router.delete('/projects/:id/members/:memberId', removeProjectMember);

// Chat Routes (NEW)
router.get('/chats/:userId', getChatList);

// Get user info by ID (for chat functionality)
router.get('/user/:userId', (req, res) => {
    const connection = require('../services/connection');
    const { userId } = req.params;
    
    const sql = `SELECT id, name, email FROM users WHERE id = ?`;
    
    try {
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            
            if (result.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            
            return res.status(200).json(result[0]);
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Expense Routes
router.post('/expenses', addNewExpense);                              // Add new expense
router.get('/expenses/project/:projectId', getProjectExpenses);       // Get project expenses
router.get('/expenses/user/:email', getUserExpenses);                 // Get user expenses
router.get('/expenses/:id', getExpenseDetails);                       // Get expense details
router.put('/expenses/:id', updateExpense);                           // Update expense
router.delete('/expenses/:id', deleteExpense);                        // Delete expense

// Budget Routes
router.get('/budget/:email', getUserBudget);                          // Get user budget
router.put('/budget/:email', setUserBudget);                          // Set user budget

// Analytics Routes
router.get('/expenses/analytics/:projectId', getExpenseAnalytics);    // Get expense analytics
router.get('/expenses/summary/:email', getExpenseSummary);            // Get expense summary for dashboard

module.exports = router;