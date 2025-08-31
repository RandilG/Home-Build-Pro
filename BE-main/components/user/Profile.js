// controllers/profile.js
const connection = require('./../../services/connection');

// Function to get user profile
const getUserProfile = async function(req, res) {
  try {
    const userEmail = req.params.email;
    
    const sql = 'SELECT id, name, email, phone, address, profileImage FROM homebuild.users WHERE email = ?';
    
    connection.query(sql, [userEmail], (err, results) => {
      if (err) {
        console.log('Error fetching user data:', err);
        return res.status(500).json({ error: 'Error fetching user data' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getUserProfile:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Function to update user profile
const updateProfile = async function(req, res) {
  try {
    const { name, email, phone, address, profileImage } = req.body;
    
    const sql = 'UPDATE homebuild.users SET name = ?, phone = ?, address = ?, profileImage = ? WHERE email = ?';
    
    connection.query(sql, [name, phone, address, profileImage, email], (err, result) => {
      if (err) {
        console.log('Error updating profile:', err);
        return res.status(500).json({ error: 'Error updating user profile' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully',
        updatedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('Server error in updateProfile:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateProfile
};