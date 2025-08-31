// controllers/settings.js
const connection = require('./../../services/connection');

// Function to get user settings
const getUserSettings = async function(req, res) {
  try {
    const userEmail = req.params.email;
    
    const sql = 'SELECT settings FROM homebuild.users_settings WHERE email = ?';
    
    connection.query(sql, [userEmail], (err, results) => {
      if (err) {
        console.log('Error fetching settings:', err);
        return res.status(500).json({ error: 'Error fetching user settings' });
      }
      
      if (results.length === 0) {
        // If no settings found, return default settings
        return res.status(200).json({
          settings: {
            notifications: true,
            emailAlerts: true,
            darkMode: false,
            locationServices: true,
            dataSync: true,
            autoBackup: false
          }
        });
      }
      
      return res.status(200).json({ 
        settings: JSON.parse(results[0].settings)
      });
    });
  } catch (error) {
    console.error('Server error in getUserSettings:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Function to update user settings
const updateSettings = async function(req, res) {
  try {
    const userEmail = req.params.email;
    const { settings } = req.body;
    
    // Convert settings object to JSON string for storage
    const settingsJson = JSON.stringify(settings);
    
    // Check if user already has settings
    const checkSql = 'SELECT id FROM homebuild.users_settings WHERE email = ?';
    
    connection.query(checkSql, [userEmail], (checkErr, checkResults) => {
      if (checkErr) {
        console.log('Error checking settings existence:', checkErr);
        return res.status(500).json({ error: 'Error updating settings' });
      }
      
      let sql, params;
      
      if (checkResults.length === 0) {
        // Insert new settings
        sql = 'INSERT INTO homebuild.users_settings (email, settings) VALUES (?, ?)';
        params = [userEmail, settingsJson];
      } else {
        // Update existing settings
        sql = 'UPDATE homebuild.users_settings SET settings = ? WHERE email = ?';
        params = [settingsJson, userEmail];
      }
      
      connection.query(sql, params, (err, result) => {
        if (err) {
          console.log('Error updating settings:', err);
          return res.status(500).json({ error: 'Error updating settings' });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Settings updated successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Server error in updateSettings:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserSettings,
  updateSettings
};