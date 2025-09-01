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
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const EditExpense = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { expense } = route.params;

  const [formData, setFormData] = useState({
    description: expense.description || '',
    amount: expense.amount?.toString() || '',
    category: expense.category || 'materials',
    date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: expense.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { name: 'materials', label: 'Materials', icon: 'hammer-wrench', color: '#FF6B6B' },
    { name: 'labor', label: 'Labor', icon: 'account-hard-hat', color: '#4ECDC4' },
    { name: 'transport', label: 'Transport', icon: 'truck', color: '#45B7D1' },
                          { name: 'permits', label: 'Permits', icon: 'file-document-outline', color: '#96CEB4' },
    { name: 'equipment', label: 'Equipment', icon: 'tools', color: '#FECA57' },
    { name: 'utilities', label: 'Utilities', icon: 'lightning-bolt', color: '#FF9FF3' },
    { name: 'other', label: 'Other', icon: 'receipt', color: '#C7ADCE' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateExpense = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes.trim() || null,
      };

      await axios.put(`http://192.168.8.116:3000/api/expenses/${expense.id}`, updateData);

      Alert.alert('Success', 'Expense updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    } finally {
      setSaving(false);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Expense</Text>
        <TouchableOpacity onPress={handleDeleteExpense} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter expense description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (LKR) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryCard,
                  formData.category === category.name && styles.selectedCategory,
                  { borderLeftColor: category.color }
                ]}
                onPress={() => handleInputChange('category', category.name)}
              >
                <Icon name={category.icon} size={24} color={category.color} />
                <Text style={[
                  styles.categoryText,
                  formData.category === category.name && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Additional notes..."
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateExpense}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="content-save" size={24} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Update Expense</Text>
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
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#E3F0AF',
    borderColor: '#F6BD0F',
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#000000',
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 40,
  },
  updateButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 15,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EditExpense;