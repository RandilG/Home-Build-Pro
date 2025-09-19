import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ExpenseTracking = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const email = await AsyncStorage.getItem('email');
      console.log('Email from AsyncStorage:', email);
      
      if (!email) {
        console.error('No email found in AsyncStorage');
        Alert.alert('Error', 'Please login again');
        navigation.navigate('Login');
        if (!isRefresh) setLoading(false);
        return;
      }

      // Fetch user data
      console.log('Fetching user data for email:', email);
      const userResponse = await axios.get(`http://192.168.8.116:3000/api/get-user/${email}`);
      console.log('User data response:', userResponse.data);
      setUserData(userResponse.data);

      // Fetch projects
      console.log('Fetching projects for email:', email);
      const projectsResponse = await axios.get(`http://192.168.8.116:3000/api/projects/${email}`);
      console.log('Projects response:', projectsResponse.data);
      const projectsData = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];
      setProjects(projectsData);

      if (projectsData.length > 0) {
        setCurrentProject(projectsData[0]);

        // Fetch expenses for current project
        try {
          console.log('Fetching expenses for project ID:', projectsData[0].id);
          const expensesResponse = await axios.get(
            `http://192.168.8.116:3000/api/expenses/project/${projectsData[0].id}`
          );
          console.log('Expenses response:', expensesResponse.data);
          
          // Ensure expenses is always an array
          const expensesData = Array.isArray(expensesResponse.data) ? expensesResponse.data : [];
          setExpenses(expensesData);
          
          // Calculate total expenses safely
          const total = expensesData.reduce((sum, expense) => {
            const amount = parseFloat(expense.amount) || 0;
            return sum + amount;
          }, 0);
          setTotalExpenses(total);
          
        } catch (expenseError) {
          console.error('Error fetching expenses:', expenseError.response?.data || expenseError.message);
          setExpenses([]); // Set empty array as fallback
          setTotalExpenses(0);
        }
      } else {
        // No projects found
        console.log('No projects found for user');
        setExpenses([]);
        setTotalExpenses(0);
      }

      // Fetch monthly budget
      try {
        console.log('Fetching budget for email:', email);
        const budgetResponse = await axios.get(`http://192.168.8.116:3000/api/budget/${email}`);
        console.log('Budget response:', budgetResponse.data);
        const budgetAmount = parseFloat(budgetResponse.data?.monthlyBudget) || 0;
        setMonthlyBudget(budgetAmount);
      } catch (budgetError) {
        console.error('Error fetching budget:', budgetError.response?.data || budgetError.message);
        setMonthlyBudget(0);
      }

      if (!isRefresh) setLoading(false);
    } catch (error) {
      console.error('Error fetching expense data:', error.response?.data || error.message);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load expense data. Please check your connection and try again.');
      }
      if (!isRefresh) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData(true);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addNewExpense = () => navigation.navigate('AddExpense');
  const viewAllExpenses = () => navigation.navigate('ViewAllExpenses');
  const manageBudget = () => navigation.navigate('ManageBudget');
  const viewExpenseDetails = (expense) => navigation.navigate('ExpenseDetails', { expense });
  const generateReport = () => navigation.navigate('ExpenseReports');

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return `LKR ${numericAmount.toLocaleString()}`;
  };

  const getBudgetStatus = () => {
    if (monthlyBudget === 0) return { color: '#FFFFFF', text: 'No Budget Set' };
    const percentage = (totalExpenses / monthlyBudget) * 100;
    if (percentage > 100) return { color: '#FF6B6B', text: 'Over Budget!' };
    if (percentage > 80) return { color: '#F6BD0F', text: 'Near Budget Limit' };
    return { color: '#4ECDC4', text: 'Within Budget' };
  };

  const getRecentExpenses = () => {
    // Safely handle expenses array
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return [];
    }
    
    return expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const getCategoryTotal = (categoryName) => {
    if (!Array.isArray(expenses)) return 0;
    
    return expenses
      .filter(expense => expense?.category?.toLowerCase() === categoryName.toLowerCase())
      .reduce((sum, expense) => {
        const amount = parseFloat(expense.amount) || 0;
        return sum + amount;
      }, 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading expense data...</Text>
      </View>
    );
  }

  const budgetStatus = getBudgetStatus();
  const recentExpenses = getRecentExpenses();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F6BD0F']} // Android
            tintColor="#F6BD0F" // iOS
            title="Pull to refresh" // iOS
            titleColor="#666" // iOS
          />
        }
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Expense Tracker</Text>
          <Icon style={styles.moneyIcon} name="currency-usd" size={30} color="#F6BD0F" />
        </View>

        <Text style={styles.subTitle}>Manage Your Project Expenses</Text>

        {/* Budget Overview */}
        <View style={styles.budgetOverview}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Spent</Text>
            <Text style={styles.budgetAmount}>{formatCurrency(totalExpenses)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Monthly Budget</Text>
            <Text style={styles.budgetAmount}>{formatCurrency(monthlyBudget)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Status</Text>
            <Text style={[styles.budgetStatus, { color: budgetStatus.color }]}>
              {budgetStatus.text}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={addNewExpense} style={styles.actionButton}>
            <Icon name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={manageBudget} style={[styles.actionButton, styles.secondaryButton]}>
            <Icon name="wallet" size={24} color="#118B50" />
            <Text style={[styles.actionButtonText, { color: '#118B50' }]}>Set Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Current Project Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentProject ? `${currentProject.name} Expenses` : 'Project Expenses'}
          </Text>
          <TouchableOpacity onPress={viewAllExpenses}>
            <Text style={styles.viewMoreText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense, index) => (
            <TouchableOpacity key={expense.id || index} onPress={() => viewExpenseDetails(expense)}>
              <View style={styles.expenseCard}>
                <View style={styles.expenseIcon}>
                  <Icon 
                    name={expense.category === 'materials' ? 'hammer-wrench' : 
                          expense.category === 'labor' ? 'account-hard-hat' :
                          expense.category === 'transport' ? 'truck' : 'receipt'}
                    size={24} 
                    color="#118B50" 
                  />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseTitle}>{expense.description || 'No Description'}</Text>
                  <Text style={styles.expenseCategory}>
                    {expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1) || 'Other'}
                  </Text>
                  <Text style={styles.expenseDate}>
                    {expense.date ? new Date(expense.date).toLocaleDateString() : 'No Date'}
                  </Text>
                </View>
                <View style={styles.expenseAmount}>
                  <Text style={styles.expenseAmountText}>
                    {formatCurrency(expense.amount || 0)}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#000000" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="receipt" size={60} color="#C7ADCE" />
            <Text style={styles.noDataText}>No expenses recorded yet</Text>
            <Text style={styles.noDataSubText}>
              {currentProject ? 'Add your first expense to get started' : 'Create a project first to track expenses'}
            </Text>
          </View>
        )}

        {/* Expense Categories Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          <TouchableOpacity onPress={generateReport}>
            <Text style={styles.viewMoreText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {[
            { name: 'Materials', icon: 'hammer-wrench', color: '#FF6B6B' },
            { name: 'Labor', icon: 'account-hard-hat', color: '#4ECDC4' },
            { name: 'Transport', icon: 'truck', color: '#45B7D1' },
            { name: 'Other', icon: 'receipt', color: '#96CEB4' },
          ].map((category, index) => {
            const categoryTotal = getCategoryTotal(category.name);

            return (
              <View key={index} style={[styles.categoryCard, { borderLeftColor: category.color }]}>
                <Icon name={category.icon} size={28} color={category.color} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(categoryTotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* Budget Progress Bar */}
        {monthlyBudget > 0 && (
          <View style={styles.budgetProgress}>
            <Text style={styles.sectionTitle}>Budget Progress</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${Math.min((totalExpenses / monthlyBudget) * 100, 100)}%`,
                      backgroundColor: totalExpenses > monthlyBudget ? '#FF6B6B' : '#4ECDC4'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {formatCurrency(totalExpenses)} / {formatCurrency(monthlyBudget)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
    paddingLeft: 10,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  moneyIcon: {
    marginTop: 10,
    marginLeft: 10,
  },
  subTitle: {
    fontSize: 20,
    color: '#C7ADCE',
    marginBottom: 20,
    paddingLeft: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 25,
    color: '#FFFFFF',
  },
  viewMoreText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },

  // Budget Overview
  budgetOverview: {
    backgroundColor: '#E3F0AF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  budgetStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.48,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Expense Cards
  expenseCard: {
    backgroundColor: '#E3F0AF',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  expenseIcon: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  expenseDate: {
    fontSize: 12,
    color: '#888888',
  },
  expenseAmount: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmountText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginRight: 5,
  },

  // No Data State
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginTop: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 15,
    fontWeight: '600',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#C7ADCE',
    marginTop: 5,
    textAlign: 'center',
  },

  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryCard: {
    backgroundColor: '#E3F0AF',
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  categoryName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
  },
  categoryAmount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },

  // Budget Progress
  budgetProgress: {
    marginTop: 20,
    marginBottom: 30,
  },
  progressBarContainer: {
    marginTop: 15,
  },
  progressBarBackground: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },

  // Hamburger Menu Styles
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#ffffff22',
    padding: 10,
    borderRadius: 8,
    height: 30,
    width: 35,
    justifyContent: 'space-between',
  },
  line: {
    width: '100%',
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: '#0D6E3E',
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 15,
  },
});

export default ExpenseTracking;