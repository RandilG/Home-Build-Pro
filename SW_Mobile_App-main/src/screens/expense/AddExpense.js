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
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const AddExpense = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params || {};

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'materials',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const email = await AsyncStorage.getItem('email');

        // Fetch user data
        const userResponse = await axios.get(`http://192.168.8.116:3000/api/get-user/${email}`);
        setUserData(userResponse.data);

        // Fetch user projects
        const projectsResponse = await axios.get(`http://192.168.8.116:3000/api/projects/${email}`);
        setProjects(projectsResponse.data);

        // Set default project if not provided
        if (!selectedProject && projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveExpense = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    try {
      setSaving(true);

      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        projectId: selectedProject,
        userId: userData.id,
        notes: formData.notes.trim() || null,
      };

      await axios.post('http://192.168.8.116:3000/api/expenses', expenseData);

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.placeholder} />
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

        {/* Project Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectCard,
                  selectedProject === project.id && styles.selectedProject
                ]}
                onPress={() => setSelectedProject(project.id)}
              >
                <Text style={[
                  styles.projectText,
                  selectedProject === project.id && styles.selectedProjectText
                ]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveExpense}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="content-save" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </>
          )}
        </TouchableOpacity>
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
  projectScroll: {
    marginTop: 5,
  },
  projectCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedProject: {
    backgroundColor: '#E3F0AF',
    borderColor: '#F6BD0F',
  },
  projectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedProjectText: {
    color: '#000000',
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
  saveButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AddExpense;