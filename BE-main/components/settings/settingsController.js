const connection = require('../../services/connection');

const settingsController = {
    // Get user settings
    getUserSettings: async (req, res) => {
        try {
            const { email } = req.params;
            
            if (!email) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email is required' 
                });
            }

            // First, get the user ID from email
            const getUserSql = 'SELECT id FROM users WHERE email = ?';
            
            connection.query(getUserSql, [email], (err, userResult) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error while fetching user' 
                    });
                }

                if (userResult.length === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }

                const userId = userResult[0].id;

                // Get user settings from database
                const getSettingsSql = 'SELECT * FROM user_settings WHERE user_id = ?';
                
                connection.query(getSettingsSql, [userId], (err, settingsResult) => {
                    if (err) {
                        console.error('Error fetching settings:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Database error while fetching settings' 
                        });
                    }

                    let settings;
                    
                    if (settingsResult.length === 0) {
                        // Return default settings if none exist
                        settings = {
                            notifications: true,
                            emailAlerts: true,
                            darkMode: false,
                            locationServices: true,
                            dataSync: true,
                            autoBackup: false
                        };
                    } else {
                        // Parse existing settings
                        const dbSettings = settingsResult[0];
                        settings = {
                            notifications: Boolean(dbSettings.notifications),
                            emailAlerts: Boolean(dbSettings.email_alerts),
                            darkMode: Boolean(dbSettings.dark_mode),
                            locationServices: Boolean(dbSettings.location_services),
                            dataSync: Boolean(dbSettings.data_sync),
                            autoBackup: Boolean(dbSettings.auto_backup)
                        };
                    }

                    return res.status(200).json({
                        success: true,
                        settings: settings
                    });
                });
            });

        } catch (error) {
            console.error('Error in getUserSettings:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    },

    // Update user settings
    updateSettings: async (req, res) => {
        try {
            const { email } = req.params;
            const { settings } = req.body;
            
            if (!email) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email is required' 
                });
            }

            if (!settings) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Settings data is required' 
                });
            }

            // First, get the user ID from email
            const getUserSql = 'SELECT id FROM users WHERE email = ?';
            
            connection.query(getUserSql, [email], (err, userResult) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error while fetching user' 
                    });
                }

                if (userResult.length === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }

                const userId = userResult[0].id;

                // Check if settings already exist for this user
                const checkSettingsSql = 'SELECT id FROM user_settings WHERE user_id = ?';
                
                connection.query(checkSettingsSql, [userId], (err, existingSettings) => {
                    if (err) {
                        console.error('Error checking existing settings:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Database error while checking settings' 
                        });
                    }

                    const settingsData = [
                        userId,
                        settings.notifications ? 1 : 0,
                        settings.emailAlerts ? 1 : 0,
                        settings.darkMode ? 1 : 0,
                        settings.locationServices ? 1 : 0,
                        settings.dataSync ? 1 : 0,
                        settings.autoBackup ? 1 : 0,
                        new Date()
                    ];

                    if (existingSettings.length === 0) {
                        // Insert new settings
                        const insertSettingsSql = `
                            INSERT INTO user_settings 
                            (user_id, notifications, email_alerts, dark_mode, location_services, data_sync, auto_backup, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        connection.query(insertSettingsSql, settingsData, (err, result) => {
                            if (err) {
                                console.error('Error inserting settings:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Database error while saving settings' 
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message: 'Settings saved successfully'
                            });
                        });
                    } else {
                        // Update existing settings
                        const updateSettingsSql = `
                            UPDATE user_settings 
                            SET notifications = ?, email_alerts = ?, dark_mode = ?, 
                                location_services = ?, data_sync = ?, auto_backup = ?, updated_at = ?
                            WHERE user_id = ?
                        `;
                        
                        const updateData = [
                            settings.notifications ? 1 : 0,
                            settings.emailAlerts ? 1 : 0,
                            settings.darkMode ? 1 : 0,
                            settings.locationServices ? 1 : 0,
                            settings.dataSync ? 1 : 0,
                            settings.autoBackup ? 1 : 0,
                            new Date(),
                            userId
                        ];
                        
                        connection.query(updateSettingsSql, updateData, (err, result) => {
                            if (err) {
                                console.error('Error updating settings:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Database error while updating settings' 
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message: 'Settings updated successfully'
                            });
                        });
                    }
                });
            });

        } catch (error) {
            console.error('Error in updateSettings:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
};

module.exports = settingsController;