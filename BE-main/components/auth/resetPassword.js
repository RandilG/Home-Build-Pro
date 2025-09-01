const connection = require('../../services/connection');
const { hashPassword } = require('../../utils/authUtils');

module.exports = async function resetPassword(req, res) {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
        return res.status(400).json({ message: "Password must include uppercase, lowercase, number and special character" });
    }

    try {
        // First verify that the user exists
        const selectUserSql = 'SELECT * FROM users WHERE email = ?';
        const [userResult] = await connection.promise().query(selectUserSql, [email]);

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the password
        const updatePasswordSql = 'UPDATE homebuild.users SET password = ? WHERE email = ?';
        const [updateResult] = await connection.promise().query(updatePasswordSql, [hashedPassword, email]);

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to update password" });
        }

        // Optional: Delete used OTP records for this email
        const deleteOtpSql = 'DELETE FROM homebuild.otp WHERE email = ?';
        await connection.promise().query(deleteOtpSql, [email]);

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};