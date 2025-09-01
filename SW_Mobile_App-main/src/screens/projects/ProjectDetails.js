import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get project data from route params
  const projectData = route.params?.project;
  const projectId = projectData?.id || route.params?.projectId || route.params?.id;
  
  console.log('Route params:', route.params);
  console.log('Project data:', projectData);
  console.log('Project ID extracted:', projectId);
  
  const [project, setProject] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    estimated_end_date: '',
    image_url: null,
    members: [],
    checklists: []
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  // Use useFocusEffect to refresh data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      getCurrentUser();
      fetchProjectDetails();
      if (projectId) {
        fetchProjectMembers();
      }
    }, [projectId])
  );

  // Get the current logged-in user
  const getCurrentUser = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      const username = await AsyncStorage.getItem('username');
      const userId = await AsyncStorage.getItem('user_id');
      
      if (email && username && userId) {
        setCurrentUser({
          id: parseInt(userId),
          email: email,
          name: username
        });
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  // Fetch project details from backend
  const fetchProjectDetails = async () => {
    if (!projectId) {
      Alert.alert('Error', 'No project ID provided');
      navigation.goBack();
      return;
    }

    try {
      // Use project data from navigation params if available
      if (projectData) {
        console.log('Using project data from navigation params');
        setProject(prev => ({
          ...prev,
          id: projectData.id,
          name: projectData.name || 'Untitled Project',
          description: projectData.description || 'No description available',
          start_date: projectData.start_date,
          estimated_end_date: projectData.estimated_end_date,
          image_url: projectData.image_url,
          user_id: projectData.user_id,
          current_stage_id: projectData.current_stage_id,
        }));
        setLoading(false);
        return;
      }

      // Fallback: fetch from API if project data not provided
      console.log('Fetching project details for ID:', projectId);
      
      const email = await AsyncStorage.getItem('email');
      if (!email) {
        Alert.alert('Error', 'User email not found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${email}`);
      console.log('All Projects Response:', response.data);
      
      // Filter to find the specific project
      const foundProject = response.data.find(p => p.id === parseInt(projectId));
      console.log('Found project:', foundProject);
      
      if (foundProject) {
        setProject(prev => ({
          ...prev,
          id: foundProject.id,
          name: foundProject.name || 'Untitled Project',
          description: foundProject.description || 'No description available',
          start_date: foundProject.start_date,
          estimated_end_date: foundProject.estimated_end_date,
          image_url: foundProject.image_url,
          user_id: foundProject.user_id,
          current_stage_id: foundProject.current_stage_id,
        }));
      } else {
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      Alert.alert('Error', 'Failed to load project details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Fetch project members separately
  const fetchProjectMembers = async () => {
    setMembersLoading(true);
    try {
      console.log('Fetching members for project ID:', projectId);
      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/members`);
      console.log('Members response:', response.data);
      
      setProject(prev => ({
        ...prev,
        members: response.data || []
      }));
    } catch (error) {
      console.error('Error fetching project members:', error);
      // If the endpoint doesn't exist or fails, keep empty members array
      setProject(prev => ({
        ...prev,
        members: []
      }));
    } finally {
      setMembersLoading(false);
    }
  };

  // Display members including the current user
  const getDisplayMembers = () => {
    const projectMembers = project.members || [];
    const members = [...projectMembers];
    
    if (currentUser && currentUser.id) {
      const currentUserExists = members.some(member => member && member.id === currentUser.id);
      
      if (!currentUserExists) {
        members.push({
          ...currentUser,
          role: 'owner' // Assuming current user is the project owner
        });
      }
    }
    
    return members;
  };

  const handleDeleteProject = async () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.8.116:3000/api/project/${projectId}`);
              Alert.alert('Success', 'Project deleted successfully');
              navigation.navigate('ViewProjects');
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const navigateToChat = () => {
    navigation.navigate('ChatScreen', { id: projectId });
  };

  const navigateToMembers = () => {
    navigation.navigate('ProjectMembers', { 
      projectId: projectId,
      projectName: project.name,
      members: getDisplayMembers()
    });
  };

  const navigateToReports = () => {
    navigation.navigate('ProjectReports', { id: projectId });
  };

  const navigateToAddMembers = () => {
    navigation.navigate('AddMembers', { projectId: projectId });
  };

  const displayMembers = getDisplayMembers();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F6BD0F" />
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" style={styles.backButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{project.name}</Text>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Icon name="ellipsis-v" style={styles.menuButtonIcon} />
          </TouchableOpacity>
          
          {menuOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleDeleteProject}
              >
                <Text style={styles.menuItemText}>Delete Project</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('EditProject', { id: projectId })}
              >
                <Text style={styles.menuItemText}>Edit Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Project Image */}
      {project.image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: project.image_url }} style={styles.projectImage} />
        </View>
      )}

      {/* Project Info */}
      <View style={styles.projectInfo}>
        <Text style={styles.projectDescription}>{project.description}</Text>
        <Text style={styles.projectDate}>
          Start Date: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
        </Text>
        <Text style={styles.projectDate}>
          End Date: {project.estimated_end_date ? new Date(project.estimated_end_date).toLocaleDateString() : 'Not set'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToChat}>
          <View style={styles.iconCircle}>
            <Icon name="comment" style={styles.actionIcon} />
          </View>
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.iconCircle}>
            <Icon name="camera" style={styles.actionIcon} />
          </View>
          <Text style={styles.actionText}>Take photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToMembers}>
          <View style={styles.iconCircle}>
            <Icon name="users" style={styles.actionIcon} />
          </View>
          <Text style={styles.actionText}>Members</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={navigateToReports}>
          <View style={styles.iconCircle}>
            <Icon name="plus" style={styles.actionIcon} />
          </View>
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Project members</Text>
          <TouchableOpacity 
            style={styles.addMemberButton}
            onPress={navigateToAddMembers}
          >
            <Icon name="plus" style={styles.addMemberIcon} />
            <Text style={styles.addMemberText}>Add members</Text>
          </TouchableOpacity>
        </View>
        
        {membersLoading ? (
          <ActivityIndicator size="small" color="#F6BD0F" />
        ) : (
          <View style={styles.membersList}>
            {displayMembers && displayMembers.length > 0 ? (
              <View>
                <View style={styles.membersGrid}>
                  {displayMembers.slice(0, 6).map((member, index) => (
                    member && (
                      <View key={member.id || `member-${index}`} style={styles.memberAvatar}>
                        {member.avatar ? (
                          <Image 
                            source={{ uri: member.avatar }} 
                            style={styles.memberImage} 
                          />
                        ) : (
                          <Text style={styles.memberInitial}>
                            {member.name && typeof member.name === 'string' ? member.name.charAt(0).toUpperCase() : '?'}
                          </Text>
                        )}
                      </View>
                    )
                  ))}
                  {displayMembers.length > 6 && (
                    <TouchableOpacity style={styles.moreMembers} onPress={navigateToMembers}>
                      <Text style={styles.moreMembersText}>+{displayMembers.length - 6}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={navigateToMembers}>
                  <Text style={styles.viewAllText}>View All Members ({displayMembers.length})</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noMembersText}>No members found</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checklists</Text>
        <View style={styles.checklistsContainer}>
          {project.checklists && project.checklists.length > 0 ? (
            <View style={styles.progressRow}>
              <Text style={styles.checklistProgress}>
                {project.checklists.filter(item => item && item.completed).length} / {project.checklists.length}
              </Text>
              <Text style={styles.checklistName}>{project.name}</Text>
            </View>
          ) : (
            <Text style={styles.emptyChecklist}>0 / 0 {project.name}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#F6BD0F',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 20,
  },
  projectImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  projectInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  projectDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  projectDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 10,
  },
  menuButtonIcon: {
    fontSize: 20,
    color: '#F6BD0F',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 150,
    zIndex: 1000,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginVertical: 30,
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
    marginBottom: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F6BD0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6BD0F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addMemberIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 5,
  },
  addMemberText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  membersList: {
    marginBottom: 10,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F6BD0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  memberImage: {
    width: '100%',
    height: '100%',
  },
  memberInitial: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  moreMembers: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#rgba(246, 189, 15, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  moreMembersText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noMembersText: {
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  checklistsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  checklistProgress: {
    fontWeight: 'bold',
    color: '#F6BD0F',
    marginRight: 10,
  },
  checklistName: {
    color: '#333',
  },
  emptyChecklist: {
    color: '#757575',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default ProjectDetails;