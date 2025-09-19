import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectMembers = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { projectId, projectName } = route.params;
  
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      getCurrentUser();
      fetchProjectMembers();
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

  // Fetch project members
  const fetchProjectMembers = async () => {
    setLoading(true);
    try {
      console.log('Fetching members for project ID:', projectId);
      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/members`);
      console.log('Members response:', response.data);
      
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching project members:', error);
      if (error.response?.status === 404) {
        setMembers([]);
      } else {
        Alert.alert('Error', 'Failed to load project members');
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove member from project
  const removeMember = async (memberId) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.8.116:3000/api/projects/${projectId}/members/${memberId}`);
              Alert.alert('Success', 'Member removed successfully');
              fetchProjectMembers(); // Refresh the list
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  // Get all members including current user if not already in the list
  const getAllMembers = () => {
    const projectMembers = [...members];
    
    if (currentUser && currentUser.id) {
      const currentUserExists = projectMembers.some(member => member.id === currentUser.id);
      
      if (!currentUserExists) {
        projectMembers.unshift({
          ...currentUser
        });
      }
    }
    
    return projectMembers;
  };

  const renderMember = ({ item: member }) => {
    const isCurrentUser = currentUser && member.id === currentUser.id;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          {member.avatar ? (
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
          ) : (
            <View style={styles.memberInitial}>
              <Text style={styles.initialText}>
                {member.name && typeof member.name === 'string' ? member.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          
          <View style={styles.memberDetails}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{member.name}</Text>
              {isCurrentUser && <Text style={styles.youTag}>(You)</Text>}
            </View>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
        </View>
        
        {!isCurrentUser && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeMember(member.id)}
          >
            <Icon name="trash" style={styles.removeIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const allMembers = getAllMembers();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F6BD0F" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" style={styles.backButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Project Members</Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMembers', { projectId })}
        >
          <Icon name="plus" style={styles.addButtonIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{projectName || 'Project'}</Text>
        <Text style={styles.memberCount}>
          {allMembers.length} member{allMembers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {allMembers.length > 0 ? (
        <FlatList
          data={allMembers}
          renderItem={renderMember}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.membersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="users" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No members found</Text>
          <Text style={styles.emptySubtext}>Add members to collaborate on this project</Text>
          <TouchableOpacity 
            style={styles.addMembersButton}
            onPress={() => navigation.navigate('AddMembers', { projectId })}
          >
            <Text style={styles.addMembersButtonText}>Add Members</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#F6BD0F',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#F6BD0F',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  projectInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  projectName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#118B50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  initialText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  youTag: {
    fontSize: 12,
    color: '#F6BD0F',
    marginLeft: 8,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#FF4444',
    borderRadius: 20,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  removeIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    color: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  addMembersButton: {
    backgroundColor: '#F6BD0F',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addMembersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default ProjectMembers;