import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ViewAllExpenses = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params || {};

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [totalAmount, setTotalAmount] = useState(0);

  const categories = [
    { name: 'all', label: 'All', icon: 'view-grid' },
    { name: 'materials', label: 'Materials', icon: 'hammer-wrench' },
    { name: 'labor', label: 'Labor', icon: 'account-hard-hat' },
    { name: 'transport', label: 'Transport', icon: 'truck' },
                          { name: 'permits', label: 'Permits', icon: 'file-document-outline' },
    { name: 'equipment', label: 'Equipment', icon: 'tools' },
    { name: 'utilities', label: 'Utilities', icon: 'lightning-bolt' },
    { name: 'other', label: 'Other', icon: 'receipt' },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchQuery, selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');
      
      let response;
      if (projectId) {
        response = await axios.get(`http://192.168.8.116:3000/api/expenses/project/${projectId}`);
      } else {
        response = await axios.get(`http://192.168.8.116:3000/api/expenses/user/${email}`);
      }
      
      // Safely handle the response
      const expensesData = Array.isArray(response.data) ? response.data : [];
      setExpenses(expensesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    // Safely handle expenses array
    if (!Array.isArray(expenses)) {
      setFilteredExpenses([]);
      setTotalAmount(0);
      return;
    }

    let filtered = expenses;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(expense =>
        (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
    
    // Calculate total safely
    const total = filtered.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    setTotalAmount(total);
  };

  const handleDeleteExpense = async (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.8.116:3000/api/expenses/${expenseId}`);
              fetchExpenses(); // Refresh the list
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : 'receipt';
  };

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
        <Text style={styles.headerTitle}>All Expenses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddExpense')} style={styles.addButton}>
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.categoryFilterCard,
              selectedCategory === category.name && styles.selectedCategoryFilter
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Icon name={category.icon} size={20} color={selectedCategory === category.name ? '#118B50' : '#FFFFFF'} />
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === category.name && styles.selectedCategoryFilterText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Total Amount */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total: {formatCurrency(totalAmount)}</Text>
        <Text style={styles.totalCount}>({filteredExpenses.length} expenses)</Text>
      </View>

      {/* Expenses List */}
      <ScrollView style={styles.expensesList}>
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense, index) => (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onPress={() => navigation.navigate('ExpenseDetails', { expense })}
            >
              <View style={styles.expenseIcon}>
                <Icon name={getCategoryIcon(expense.category)} size={24} color="#118B50" />
              </View>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseTitle}>{expense.description}</Text>
                <Text style={styles.expenseCategory}>
                  {expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1)}
                </Text>
                <Text style={styles.expenseDate}>
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
                {expense.project_name && (
                  <Text style={styles.projectName}>Project: {expense.project_name}</Text>
                )}
              </View>
              <View style={styles.expenseActions}>
                <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExpense(expense.id)}
                >
                  <Icon name="delete" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="receipt" size={60} color="#C7ADCE" />
            <Text style={styles.noDataText}>No expenses found</Text>
            <Text style={styles.noDataSubText}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Add your first expense to get started'}
            </Text>
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
  addButton: {
    backgroundColor: '#F6BD0F',
    padding: 8,
    borderRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    backgroundColor: '#E3F0AF',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 10,
    paddingVertical: 10,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryFilterCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryFilter: {
    backgroundColor: '#E3F0AF',
  },
  categoryFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedCategoryFilterText: {
    color: '#118B50',
  },
  totalContainer: {
    backgroundColor: '#E3F0AF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  totalCount: {
    fontSize: 14,
    color: '#666666',
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
    fontSize: 16,
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
  projectName: {
    fontSize: 12,
    color: '#118B50',
    fontWeight: '600',
    marginTop: 3,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deleteButton: {
    padding: 5,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginTop: 50,
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
});

export default ViewAllExpenses;