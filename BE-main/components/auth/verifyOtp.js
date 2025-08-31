const connection = require('../../services/connection');
const { generateAccessToken, generateRefreshToken } = require('../../utils/authUtils');

module.exports = async function (req, res) {
    const selectOtpSql = 'SELECT * FROM homebuild.otp WHERE email = ?';

    try {
        // Ensure we're working with strings for comparison
        const email = String(req.body.email).trim();
        const providedOtp = String(req.body.otp).trim();
        
        console.log("Verifying OTP:", email, providedOtp); // Debug log
        
        const [otpResults] = await connection.promise().query(selectOtpSql, [email]);
        
        if (otpResults.length === 0) {
            console.log("No OTP found for email:", email);
            return res.status(404).json({ message: "OTP not found for this email." });
        }

        const otpRecord = otpResults[0];
        const currentTime = new Date();
        
        // Check if OTP has expired
        if (new Date(otpRecord.otp_expiry) < currentTime) {
            console.log("OTP expired");
            // Delete expired OTP
            await connection.promise().query('DELETE FROM homebuild.otp WHERE email = ?', [email]);
            return res.status(408).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Ensure we're comparing strings
        const storedOtp = String(otpRecord.otp).trim();
        
        if (storedOtp === providedOtp) {
            console.log("OTP verified successfully");
            
            // Update user's verification status
            const updateUserSql = 'UPDATE `homebuild`.`users` SET `is_verified` = ? WHERE `email` = ?';
            
            try {
                const [updateResult] = await connection.promise().query(updateUserSql, [true, email]);
                
                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                
                console.log("User verification status updated successfully");
            } catch (updateError) {
                console.error("Error updating user verification status:", updateError);
                return res.status(500).json({ message: "Failed to update verification status", error: updateError.message });
            }

            // Get user data
            const [userData] = await connection.promise().query('SELECT * FROM `homebuild`.`users` WHERE `email` = ?', [email]);
            
            if (userData.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            // Generate JWT tokens
            const accessToken = generateAccessToken(email);
            const refreshToken = generateRefreshToken(email);
            
            // Delete the OTP record
            await connection.promise().query('DELETE FROM homebuild.otp WHERE email = ?', [email]);

            return res.status(200).json({
                message: 'Email verification successful. Your account has been activated.',
                accessToken,
                refreshToken,
                username: userData[0].name,
                email: userData[0].email
            });
        } else {
            console.log("Invalid OTP provided");
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};