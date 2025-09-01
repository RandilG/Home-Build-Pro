import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ExpenseDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { expense: initialExpense } = route.params;

  const [expense, setExpense] = useState(initialExpense);
  const [loading, setLoading] = useState(false);

  const categories = {
    materials: { label: 'Materials', icon: 'hammer-wrench', color: '#FF6B6B' },
    labor: { label: 'Labor', icon: 'account-hard-hat', color: '#4ECDC4' },
    transport: { label: 'Transport', icon: 'truck', color: '#45B7D1' },
    permits: { label: 'Permits', icon: 'file-document-outline', color: '#96CEB4' },
    equipment: { label: 'Equipment', icon: 'tools', color: '#FECA57' },
    utilities: { label: 'Utilities', icon: 'lightning-bolt', color: '#FF9FF3' },
    other: { label: 'Other', icon: 'receipt', color: '#C7ADCE' },
  };

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://192.168.8.116:3000/api/expenses/${expense.id}`);
      setExpense(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expense details:', error);
      Alert.alert('Error', 'Failed to load expense details');
      setLoading(false);
    }
  };

  const handleDeleteExpense = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.8.116:3000/api/expenses/${expense.id}`);
              Alert.alert('Success', 'Expense deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const handleEditExpense = () => {
    navigation.navigate('EditExpense', { expense });
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const category = categories[expense.category] || categories.other;

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
        <Text style={styles.headerTitle}>Expense Details</Text>
        <TouchableOpacity onPress={handleEditExpense} style={styles.editButton}>
          <Icon name="pencil" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Main Expense Card */}
        <View style={styles.mainCard}>
          <View style={styles.categoryBadge}>
            <Icon name={category.icon} size={30} color={category.color} />
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </View>
          
          <Text style={styles.expenseTitle}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#C7ADCE" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
          </View>

          {expense.project_name && (
            <View style={styles.detailRow}>
              <Icon name="view-grid" size={20} color="#C7ADCE" />
              <Text style={styles.detailLabel}>Project</Text>
              <Text style={styles.detailValue}>{expense.project_name}</Text>
            </View>
          )}

          {expense.user_name && (
            <View style={styles.detailRow}>
              <Icon name="account" size={20} color="#C7ADCE" />
              <Text style={styles.detailLabel}>Added by</Text>
              <Text style={styles.detailValue}>{expense.user_name}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Icon name="clock" size={20} color="#C7ADCE" />
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(expense.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Notes Section */}
        {expense.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{expense.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editActionButton} onPress={handleEditExpense}>
            <Icon name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteActionButton} onPress={handleDeleteExpense}>
            <Icon name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete Expense</Text>
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
  editButton: {
    backgroundColor: '#F6BD0F',
    padding: 8,
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#E3F0AF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  categoryBadge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginTop: 8,
  },
  expenseTitle: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  expenseAmount: {
    fontSize: 32,
    color: '#118B50',
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 15,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#C7ADCE',
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 30,
  },
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  notesText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  editActionButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 15,
    flex: 0.48,
  },
  deleteActionButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 15,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ExpenseDetails;