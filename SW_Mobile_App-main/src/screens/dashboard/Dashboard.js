import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const Dashboard = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [upcomingStages, setUpcomingStages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_URL = 'http://192.168.8.116:3000/api';

  // Date formatting utility function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Extract data fetching logic into a separate function
  const fetchData = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const email = await AsyncStorage.getItem('email');
      if (!email) {
        console.log('No email found, user might need to login');
        return;
      }

      // Fetch all data in parallel
      const [userResponse, projectsResponse, stagesResponse] = await Promise.all([
        axios.get(`${API_URL}/get-user/${email}`).catch(err => {
          console.error('Error fetching user:', err);
          return { data: null };
        }),
        axios.get(`${API_URL}/projects/${email}`).catch(err => {
          console.error('Error fetching projects:', err);
          return { data: [] };
        }),
        axios.get(`${API_URL}/stages`).catch(err => {
          console.error('Error fetching stages:', err);
          return { data: [] };
        })
      ]);

      // Set user data
      if (userResponse.data) {
        setUserData(userResponse.data);
      }

      // Set projects data
      const projectsData = projectsResponse.data || [];
      setProjects(projectsData);

      if (projectsData.length > 0) {
        setCurrentProject(projectsData[0]);
      } else {
        setCurrentProject(null);
      }

      // Set stages data
      const stagesData = stagesResponse.data || [];
      setStages(stagesData);

      // Set upcoming stages (show first 3 stages)
      setUpcomingStages(stagesData.slice(0, 3));

      // Set current milestone
      if (projectsData.length > 0 && projectsData[0].current_stage_id && stagesData.length > 0) {
        const currentStage = stagesData.find(
          stage => stage.id === projectsData[0].current_stage_id
        );
        setCurrentMilestone(currentStage || null);
      } else if (stagesData.length > 0) {
        // If no current stage ID, show the first available stage
        setCurrentMilestone(stagesData[0]);
      } else {
        setCurrentMilestone(null);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Use useFocusEffect to refresh data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const viewMoreProjects = () => navigation.navigate('ViewProjects');
  const viewMoreMilestones = () => navigation.navigate('UpcommingStages');
  const navigateToSearch = () => navigation.navigate('Search');
  const goToStageDetails = (stage) => navigation.navigate('Stagedetails', { 
    stage, 
    onStageUpdated: () => fetchData()
  });
  const addNewProject = () => navigation.navigate('AddProject');
  const goToProjectDetails = (project) => navigation.navigate('ProjectDetails', { project });

  const placeholderImage = require('../../../assets/img/festive.jpg');

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Hamburger Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </TouchableOpacity>

      {sidebarOpen && (
        <>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Dream Home</Text>
              <TouchableOpacity onPress={toggleSidebar}>
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {[
                { icon: 'home', label: 'Dashboard', screen: 'Dashboard' },
                { icon: 'view-grid', label: 'Projects', screen: 'ViewProjects' },
                { icon: 'flag-checkered', label: 'Milestones', screen: 'UpcommingStages' },
                { icon: 'currency-usd', label: 'Expenses', screen: 'ExpenseTracking' },
                { icon: 'plus-circle', label: 'Add Project', screen: 'AddProject' },
                { icon: 'account', label: 'Profile', screen: 'ProfileScreen' },
                { icon: 'cog', label: 'Settings', screen: 'Settings' },
                { icon: 'help-circle', label: 'Help', screen: 'Help' },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    toggleSidebar();
                    navigation.navigate(item.screen);
                  }}
                >
                  <Icon name={item.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleSidebar} />
        </>
      )}

      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F6BD0F']} // Android
            tintColor="#F6BD0F" // iOS
            title="Pull to refresh..." // iOS
            titleColor="#FFFFFF" // iOS
          />
        }
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Hello, {userData ? userData.name : 'User'}</Text>
          <Icon style={styles.waveIcon} name="hand-wave" size={30} color="#F6BD0F" />
        </View>

        <Text style={styles.subTitle}>Let's Build Your Dream Home</Text>

        {/* Current Project Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Project</Text>
          <TouchableOpacity onPress={viewMoreProjects}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {currentProject ? (
          <TouchableOpacity onPress={() => goToProjectDetails(currentProject)}>
            <View style={styles.containerbox}>
              <Image
                source={currentProject.imageUrl ? { uri: currentProject.imageUrl } : placeholderImage}
                style={styles.image}
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventDetailText1}>{currentProject.name}</Text>
                <Text style={styles.eventDetailText2}>Start: {formatDate(currentProject.start_date)}</Text>
                <Text style={styles.eventDetailText2}>End: {formatDate(currentProject.estimated_end_date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.eventDetailText3}>More</Text>
                  <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Projects Available</Text>
          </View>
        )}

        <TouchableOpacity onPress={addNewProject} style={styles.addButton}>
          <Icon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Project</Text>
        </TouchableOpacity>

        {/* Current Milestone Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Milestone</Text>
          <TouchableOpacity onPress={viewMoreMilestones}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {currentMilestone ? (
          <TouchableOpacity onPress={() => goToStageDetails(currentMilestone)}>
            <View style={styles.containerbox}>
              <Image
                source={currentMilestone.image_path 
                  ? { uri: `${API_URL}${currentMilestone.image_path}` } 
                  : placeholderImage}
                style={styles.image}
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventDetailText1}>{currentMilestone.name}</Text>
                <Text style={styles.eventDetailText2}>Start: {formatDate(currentMilestone.start_date)}</Text>
                <Text style={styles.eventDetailText2}>End: {formatDate(currentMilestone.end_date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.eventDetailText3}>More</Text>
                  <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Milestones Available</Text>
          </View>
        )}

        {/* Upcoming Stages Section
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Stages</Text>
          <TouchableOpacity onPress={viewMoreMilestones}>
            <Text style={styles.viewMoreText}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingStages.length > 0 ? (
          upcomingStages.map((stage, index) => (
            <TouchableOpacity key={index} onPress={() => goToStageDetails(stage)}>
              <View style={styles.containerbox}>
                <Image
                  source={stage.image_path 
                    ? { uri: `${API_URL}${stage.image_path}` } 
                    : placeholderImage}
                  style={styles.image}
                />
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetailText1}>{stage.name}</Text>
                  <Text style={styles.eventDetailText2}>Start: {formatDate(stage.start_date)}</Text>
                  <Text style={styles.eventDetailText2}>End: {formatDate(stage.end_date)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.eventDetailText3}>More</Text>
                    <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Upcoming Stages Available</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddStage')} 
              style={styles.smallAddButton}
            >
              <Text style={styles.smallAddButtonText}>+ Add Stage</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Add some bottom padding for better scrolling */}
        <View style={{ height: 50 }} />
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
    paddingTop: 10,
  },
  containerbox: {
    backgroundColor: '#E3F0AF',
    flexDirection: 'row',
    width: '100%',
    height: 180,
    borderRadius: 20,
    marginTop: 15,
  },
  image: {
    width: 150,
    height: 160,
    borderRadius: 20,
    margin: 10,
  },
  eventDetails: {
    flex: 1,
    marginLeft: 10,
    marginTop: 20,
  },
  eventDetailText1: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  eventDetailText2: {
    fontSize: 15,
    color: '#000000',
    marginTop: 10,
  },
  eventDetailText3: {
    fontSize: 15,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 90,
    marginBottom: 5,
    paddingLeft: 10,
  },
  waveIcon: {
    marginTop: 10,
    marginLeft: 10,
  },
  subTitle: {
    fontSize: 20,
    color: '#C7ADCE',
    marginBottom: 10,
    paddingLeft: 10,
  },
  viewMoreText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 25,
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 12,
    marginTop: 20,
    width: '100%',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noDataContainer: {
    backgroundColor: '#E3F0AF',
    padding: 20,
    borderRadius: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  smallAddButton: {
    backgroundColor: '#F6BD0F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  smallAddButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Custom hamburger
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

export default Dashboard;