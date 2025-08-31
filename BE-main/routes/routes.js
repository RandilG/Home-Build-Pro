const express = require('express');
const router = express.Router();

// Utils & Middleware
const { authenticateToken } = require('../utils/authUtils');
const { uploadStageImage } = require('../middleware/uploadMiddleware');

// Auth Components
const userSignup = require('../components/auth/userSignup'); //
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

// Stages
const stagesController = require('../components/stages/stagesController');

// Test
const mailTest = require('../components/test/mailTest');

// ================== ROUTES ==================

router.post('/signup', async(req, res) => {
    userSignup(req, res);
});

router.post('/signin', async(req, res) => {
    userSignin(req, res);
});

router.get('/protected', authenticateToken, (req, res) => { 
    res.status(200).json("Protected Route");
});

router.get('/test/email', (req, res) => {   
    mailTest(req, res);
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

router.put('/upload-image', (req, res) => {
    uploadImage(req, res);
});

router.get('/get-user/:id', (req, res) => {
    getUserById(req, res);
});

router.put('/edit-user', (req, res) => {
    updateProfile(req, res);
});

router.put('/change-password', (req, res) => {
    changePassword(req, res);
});


// Root route
router.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Stage routes - directly added to the main router
router.get('/stages', stagesController.getAllStages);
router.get('/stages/:id', stagesController.getStageById);
router.post('/stages', uploadStageImage.single('image'), stagesController.addStage);
router.put('/stages/:id', uploadStageImage.single('image'), stagesController.updateStage);
router.delete('/stages/:id', stagesController.deleteStage);

// Project routes
router.get('/projects/:email', getUserProjects);
router.get('/project/:id', getProjectById);
router.post('/addNewProject', addNewProject);

// Project routes
router.get('/projects', getAllProjects); // Get all projects
router.get('/projects/:id', getProjectDetails);
router.delete('/projects/:id', deleteProject);

// Project messages routes
router.get('/projects/:id/messages', getProjectMessages);
router.post('/projects/:id/messages', createProjectMessage);

// Project members routes
router.get('/projects/:id/members', getProjectMembers);
router.post('/projects/:id/members', addProjectMembers);

// User search route
router.get('/users/search', searchUsers);

// Profile routes
router.get('/get-user/:email', ProfileController.getUserProfile);
router.put('/update-user/:email', ProfileController.updateProfile);

// Settings routes
router.get('/user-settings/:email', settingsController.getUserSettings);
router.post('/update-settings/:email', settingsController.updateSettings);

module.exports = router;