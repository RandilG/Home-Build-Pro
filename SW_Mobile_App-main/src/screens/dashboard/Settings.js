import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    locationServices: true,
    dataSync: true,
    autoBackup: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const userEmail = await AsyncStorage.getItem('email');
      
      if (!userEmail) {
        Alert.alert('Error', 'User email not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching settings for email:', userEmail);
      
      const response = await axios.get(`http://192.168.8.116:3000/api/user-settings/${userEmail}`);
      
      console.log('Settings response:', response.data);
      
      if (response.data && response.data.success && response.data.settings) {
        setSettings(response.data.settings);
      } else {
        console.log('Using default settings');
        // Keep default settings if none found
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
      
      if (error.response) {
        // Server responded with error status
        Alert.alert('Error', `Failed to load settings: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // Network error
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        // Other error
        Alert.alert('Error', 'Failed to load settings');
      }
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const userEmail = await AsyncStorage.getItem('email');
      
      if (!userEmail) {
        Alert.alert('Error', 'User email not found. Please login again.');
        setSaving(false);
        return;
      }

      console.log('Saving settings for email:', userEmail);
      console.log('Settings to save:', settings);
      
      const response = await axios.post(`http://192.168.8.116:3000/api/update-settings/${userEmail}`, {
        settings
      });
      
      console.log('Save response:', response.data);
      
      setSaving(false);
      
      if (response.data && response.data.success) {
        Alert.alert('Success', response.data.message || 'Settings updated successfully');
      } else {
        Alert.alert('Error', 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
      
      if (error.response) {
        // Server responded with error status
        Alert.alert('Error', `Failed to save settings: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // Network error
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        // Other error
        Alert.alert('Error', 'Failed to save settings');
      }
    }
  };

  const toggleSetting = (setting) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting]
    }));
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will not affect your projects or account data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              // Clear app cache (example implementation)
              await AsyncStorage.removeItem('app_cache');
              // You can add more cache clearing logic here
              
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy feature will be implemented soon.');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service feature will be implemented soon.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading Settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="bell" size={24} color="#118B50" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.notifications ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="email" size={24} color="#118B50" />
                <Text style={styles.settingText}>Email Alerts</Text>
              </View>
              <Switch
                value={settings.emailAlerts}
                onValueChange={() => toggleSetting('emailAlerts')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.emailAlerts ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
          </View>
          
          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="theme-light-dark" size={24} color="#118B50" />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.darkMode ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="map-marker" size={24} color="#118B50" />
                <Text style={styles.settingText}>Location Services</Text>
              </View>
              <Switch
                value={settings.locationServices}
                onValueChange={() => toggleSetting('locationServices')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.locationServices ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
          </View>
          
          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="sync" size={24} color="#118B50" />
                <Text style={styles.settingText}>Auto Sync Data</Text>
              </View>
              <Switch
                value={settings.dataSync}
                onValueChange={() => toggleSetting('dataSync')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.dataSync ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="backup-restore" size={24} color="#118B50" />
                <Text style={styles.settingText}>Auto Backup</Text>
              </View>
              <Switch
                value={settings.autoBackup}
                onValueChange={() => toggleSetting('autoBackup')}
                trackColor={{ false: '#D0D0D0', true: '#0D6E3E' }}
                thumbColor={settings.autoBackup ? '#F6BD0F' : '#F0F0F0'}
              />
            </View>
            
            <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
              <Icon name="delete-sweep" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
          
          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.3</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>125</Text>
            </View>
            
            <TouchableOpacity style={styles.linkItem} onPress={handlePrivacyPolicy}>
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Icon name="chevron-right" size={24} color="#118B50" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkItem} onPress={handleTermsOfService}>
              <Text style={styles.linkText}>Terms of Service</Text>
              <Icon name="chevron-right" size={24} color="#118B50" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="content-save" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#118B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333333',
  },
  actionButton: {
    backgroundColor: '#118B50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    fontSize: 16,
    color: '#118B50',
  },
  saveButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0C75F',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default SettingsScreen;