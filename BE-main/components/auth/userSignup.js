const connection = require('../../services/connection');
const { hashPassword } = require('../../utils/authUtils');
const sendMail = require('../../utils/sendMail');
const generateOTP = require('../../utils/generateOTP');
const path = require('path');

module.exports = async function userSignup(req, res) {
    const selectsql = 'SELECT * FROM users WHERE email = ?';

    try {
        // Check if user already exists by email
        const [existingUsers] = await connection.promise().query(selectsql, [req.body.email]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const password = await hashPassword(req.body.password);

        // Insert user (without NIC, contact_number)
        const insertUserSql = `
            INSERT INTO homebuild.users 
            (name, email, role, password, is_verified) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const userValues = [
            req.body.name,
            req.body.email,
            req.body.role,
            password,
            false // not verified yet
        ];

        const [insertResult] = await connection.promise().query(insertUserSql, userValues);

        if (insertResult.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to create user account" });
        }

        // Generate OTP
        const otp = generateOTP(req.body.email);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        // Store OTP
        const insertOtpSql = `
            INSERT INTO homebuild.otp (email, otp, otp_expiry) 
            VALUES (?, ?, ?)
        `;
        await connection.promise().query(insertOtpSql, [
            req.body.email,
            otp,
            otpExpiry
        ]);

        // Send email with OTP
        const subject = "Welcome to Home Build Pro! Verify your email address";
        const htmlTemplatePath = path.resolve(__dirname, '../../templates/otpSend.html');
        const replacements = { name: req.body.name, otp };

        await sendMail(req.body.email, subject, htmlTemplatePath, replacements);

        return res.status(201).json({
            message: "Account created! Verification code sent to your email.",
            email: req.body.email
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
