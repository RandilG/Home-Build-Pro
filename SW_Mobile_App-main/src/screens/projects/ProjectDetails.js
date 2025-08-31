import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  
  const [project, setProject] = useState({
    id: '',
    name: '',
    members: [],
    checklists: []
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get the current logged-in user
    const getCurrentUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    // Fetch project details from backend
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.8.116:3000/api/project/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
        // Set default state to prevent mapping errors
        setProject({
          id: id,
          name: 'Error loading project',
          members: [],
          checklists: []
        });
      }
    };

    getCurrentUser();
    fetchProjectDetails();
  }, [id]);

  // Display members including the current user
  const getDisplayMembers = () => {
    // Make sure project.members exists and is an array
    const projectMembers = project.members || [];
    
    // Create a new array - don't modify the original
    const members = [...projectMembers];
    
    // Check if current user exists and is not already in the members list
    if (currentUser && currentUser.id) {
      const currentUserExists = members.some(member => member && member.id === currentUser.id);
      
      if (!currentUserExists) {
        members.push(currentUser);
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
              await axios.delete(`http://192.168.8.116:3000/api/project/${id}`);
              navigation.navigate('Projects'); // Redirect to projects list
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
    navigation.navigate('ChatScreen', { id });
  };

  const navigateToMembers = () => {
    navigation.navigate('ProjectMembers', { id });
  };

  const navigateToReports = () => {
    navigation.navigate('ProjectReports', { id });
  };

  const navigateToAddMembers = () => {
    navigation.navigate('AddMembers', { projectId: id });
  };

  const displayMembers = getDisplayMembers();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" style={styles.backButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{project?.name || ''}</Text>
        
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
                onPress={() => navigation.navigate('EditProject', { id })}
              >
                <Text style={styles.menuItemText}>Edit Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
        
        <View style={styles.membersList}>
          {displayMembers && displayMembers.length > 0 ? (
            displayMembers.map((member, index) => (
              member && (
                <View key={member.id || `member-${index}`} style={styles.memberAvatar}>
                  {member.avatar ? (
                    <Image 
                      source={{ uri: member.avatar }} 
                      style={styles.memberImage} 
                    />
                  ) : (
                    <Text style={styles.memberInitial}>
                      {member.name && typeof member.name === 'string' ? member.name.charAt(0) : '?'}
                    </Text>
                  )}
                </View>
              )
            ))
          ) : (
            <Text>No members found</Text>
          )}
        </View>
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
            <Text style={styles.emptyChecklist}>0 / 0 {project.name || ''}</Text>
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
    color: '#FFFFFF',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    color: '#FFFFFF',
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