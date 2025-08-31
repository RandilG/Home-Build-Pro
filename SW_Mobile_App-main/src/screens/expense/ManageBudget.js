import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ManageBudget = () => {
  const navigation = useNavigation();
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: '',
    projectBudget: '',
  });
  const [currentBudget, setCurrentBudget] = useState({
    monthlyBudget: 0,
    projectBudget: 0,
  });
  const [expenseSummary, setExpenseSummary] = useState({
    monthlyAmount: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');

      // Fetch current budget
      const budgetResponse = await axios.get(`http://192.168.8.116:3000/api/budget/${email}`);
      setCurrentBudget(budgetResponse.data);
      setBudgetData({
        monthlyBudget: budgetResponse.data.monthlyBudget.toString(),
        projectBudget: budgetResponse.data.projectBudget.toString(),
      });

      // Fetch expense summary
      const summaryResponse = await axios.get(`http://192.168.8.116:3000/api/expenses/summary/${email}`);
      setExpenseSummary({
        monthlyAmount: summaryResponse.data.monthly.monthly_amount || 0,
        totalAmount: summaryResponse.data.total.total_amount || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      Alert.alert('Error', 'Failed to load budget data');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBudgetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBudget = async () => {
    const monthlyBudget = parseFloat(budgetData.monthlyBudget) || 0;
    const projectBudget = parseFloat(budgetData.projectBudget) || 0;

    if (monthlyBudget < 0 || projectBudget < 0) {
      Alert.alert('Error', 'Budget amounts cannot be negative');
      return;
    }

    try {
      setSaving(true);
      const email = await AsyncStorage.getItem('email');

      await axios.put(`http://192.168.8.116:3000/api/budget/${email}`, {
        monthlyBudget,
        projectBudget,
      });

      setCurrentBudget({ monthlyBudget, projectBudget });
      Alert.alert('Success', 'Budget updated successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  const getMonthlyBudgetStatus = () => {
    if (currentBudget.monthlyBudget === 0) return { color: '#C7ADCE', text: 'No Budget Set' };
    const percentage = (expenseSummary.monthlyAmount / currentBudget.monthlyBudget) * 100;
    if (percentage > 100) return { color: '#FF6B6B', text: 'Over Budget!' };
    if (percentage > 80) return { color: '#F6BD0F', text: 'Near Limit' };
    return { color: '#4ECDC4', text: 'On Track' };
  };

  const monthlyStatus = getMonthlyBudgetStatus();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Budget</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Budget Status</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>This Month</Text>
              <Text style={styles.statusAmount}>{formatCurrency(expenseSummary.monthlyAmount)}</Text>
              <Text style={[styles.statusText, { color: monthlyStatus.color }]}>
                {monthlyStatus.text}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Total Project</Text>
              <Text style={styles.statusAmount}>{formatCurrency(expenseSummary.totalAmount)}</Text>
              <Text style={styles.statusText}>All Time</Text>
            </View>
          </View>

          {/* Progress Bar for Monthly Budget */}
          {currentBudget.monthlyBudget > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Monthly Progress</Text>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${Math.min((expenseSummary.monthlyAmount / currentBudget.monthlyBudget) * 100, 100)}%`,
                      backgroundColor: expenseSummary.monthlyAmount > currentBudget.monthlyBudget ? '#FF6B6B' : '#4ECDC4'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((expenseSummary.monthlyAmount / currentBudget.monthlyBudget) * 100)}% used
              </Text>
            </View>
          )}
        </View>

        {/* Budget Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Budget Settings</Text>

          {/* Monthly Budget Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monthly Budget (LKR)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter monthly budget"
              value={budgetData.monthlyBudget}
              onChangeText={(value) => handleInputChange('monthlyBudget', value)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.helpText}>
              Set a monthly spending limit for all projects
            </Text>
          </View>

          {/* Project Budget Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Project Budget (LKR)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter total project budget"
              value={budgetData.projectBudget}
              onChangeText={(value) => handleInputChange('projectBudget', value)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.helpText}>
              Set a total budget limit for your current project
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveBudget}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="content-save" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Budget Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Budget Tips</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb" size={24} color="#F6BD0F" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Smart Budgeting</Text>
              <Text style={styles.tipText}>
                • Set realistic monthly limits based on your income{'\n'}
                • Include a 10-20% buffer for unexpected costs{'\n'}
                • Review and adjust budgets monthly{'\n'}
                • Track expenses regularly to stay on target
              </Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#E3F0AF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  statusTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 0.48,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  statusAmount: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBarBackground: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  settingsSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#E3F0AF',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#C7ADCE',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 15,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
  },
  tipTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#C7ADCE',
    lineHeight: 20,
  },
});

export default ManageBudget;