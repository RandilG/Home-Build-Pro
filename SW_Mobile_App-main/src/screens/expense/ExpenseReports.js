import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ExpenseReports = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params || {};

  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics();
    }
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');

      // Fetch user projects
      const projectsResponse = await axios.get(`http://192.168.8.116:3000/api/projects/${email}`);
      setProjects(projectsResponse.data);

      // Set default project if not provided
      if (!selectedProject && projectsResponse.data.length > 0) {
        setSelectedProject(projectsResponse.data[0].id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`http://192.168.8.116:3000/api/expenses/analytics/${selectedProject}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics');
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      materials: '#FF6B6B',
      labor: '#4ECDC4',
      transport: '#45B7D1',
      permits: '#96CEB4',
      equipment: '#FECA57',
      utilities: '#FF9FF3',
      other: '#C7ADCE',
    };
    return colors[category] || '#C7ADCE';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      materials: 'hammer-wrench',
      labor: 'account-hard-hat',
      transport: 'truck',
      permits: 'file-document',
      equipment: 'tools',
      utilities: 'lightning-bolt',
      other: 'receipt',
    };
    return icons[category] || 'receipt';
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
        <Text style={styles.headerTitle}>Expense Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Project Selection */}
        <View style={styles.projectSelection}>
          <Text style={styles.label}>Select Project</Text>
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

        {analytics && (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Project Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{analytics.summary.total_expenses || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Expenses</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCurrency(analytics.summary.total_amount)}</Text>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCurrency(analytics.summary.avg_expense)}</Text>
                  <Text style={styles.summaryLabel}>Average</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCurrency(analytics.summary.highest_expense)}</Text>
                  <Text style={styles.summaryLabel}>Highest</Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {analytics.categoryBreakdown.length > 0 ? (
                analytics.categoryBreakdown.map((category, index) => (
                  <View key={index} style={styles.categoryBreakdownCard}>
                    <View style={styles.categoryInfo}>
                      <Icon 
                        name={getCategoryIcon(category.category)} 
                        size={24} 
                        color={getCategoryColor(category.category)} 
                      />
                      <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>
                          {category.category?.charAt(0).toUpperCase() + category.category?.slice(1)}
                        </Text>
                        <Text style={styles.categoryCount}>
                          {category.expense_count} expenses
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryAmounts}>
                      <Text style={styles.categoryTotal}>
                        {formatCurrency(category.total_amount)}
                      </Text>
                      <Text style={styles.categoryAverage}>
                        Avg: {formatCurrency(category.avg_amount)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No expense data available</Text>
                </View>
              )}
            </View>

            {/* Monthly Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
              {analytics.monthlyBreakdown.length > 0 ? (
                analytics.monthlyBreakdown.map((month, index) => (
                  <View key={index} style={styles.monthCard}>
                    <View style={styles.monthInfo}>
                      <Icon name="calendar-month" size={24} color="#4ECDC4" />
                      <View style={styles.monthDetails}>
                        <Text style={styles.monthName}>
                          {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </Text>
                        <Text style={styles.monthCount}>
                          {month.expense_count} expenses
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.monthAmount}>
                      {formatCurrency(month.total_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No monthly data available</Text>
                </View>
              )}
            </View>
          </>
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
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  projectSelection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
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
  summaryCard: {
    backgroundColor: '#E3F0AF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  summaryTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryValue: {
    fontSize: 18,
    color: '#118B50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryBreakdownCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDetails: {
    marginLeft: 15,
  },
  categoryName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  categoryCount: {
    fontSize: 14,
    color: '#C7ADCE',
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  categoryAverage: {
    fontSize: 12,
    color: '#C7ADCE',
  },
  monthCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monthDetails: {
    marginLeft: 15,
  },
  monthName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  monthCount: {
    fontSize: 14,
    color: '#C7ADCE',
  },
  monthAmount: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
  },
  noDataText: {
    fontSize: 16,
    color: '#C7ADCE',
    textAlign: 'center',
  },
});

export default ExpenseReports;