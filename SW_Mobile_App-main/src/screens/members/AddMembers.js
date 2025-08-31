import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  FlatList, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddMembersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId } = route.params; // Make sure this matches what ProjectDetails passes
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current project members
  useEffect(() => {
    const fetchCurrentMembers = async () => {
      try {
        const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/members`);
        setCurrentMembers(response.data);
      } catch (error) {
        console.error('Error fetching project members:', error);
        // If endpoint doesn't exist, set empty array
        setCurrentMembers([]);
      }
    };
    
    if (projectId) {
      fetchCurrentMembers();
    }
  }, [projectId]);

  // Search users
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`http://192.168.8.116:3000/api/users/search?q=${searchQuery}`);
        
        // Filter out users who are already members
        const filteredResults = response.data.filter(
          user => !currentMembers.some(member => member.id === user.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentMembers]);

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const addMembers = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`http://192.168.8.116:3000/api/projects/${projectId}/members`, {
        userIds: selectedUsers.map(user => user.id)
      });
      
      Alert.alert(
        'Success', 
        `Successfully added ${response.data.added || selectedUsers.length} member(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to ProjectDetails with the project data
              navigation.navigate('ProjectDetails', { projectId });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding members:', error);
      let errorMessage = 'Failed to add members';
      
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to add members to this project';
      } else if (error.response?.status === 404) {
        errorMessage = 'Project not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectedUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.selectedUser} 
      onPress={() => toggleUserSelection(item)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      ) : (
        <View style={styles.userInitial}>
          <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.userName}>{item.name}</Text>
      <Icon name="times" style={styles.removeIcon} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={styles.userInitial}>
            <Text style={styles.initialText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        {isSelected && <Icon name="check" style={styles.checkIcon} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" style={styles.backButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Add Members</Text>
        
        <TouchableOpacity 
          style={[
            styles.addButton, 
            (selectedUsers.length === 0 || isLoading) && styles.addButtonDisabled
          ]} 
          onPress={addMembers}
          disabled={selectedUsers.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearSearch} 
            onPress={() => setSearchQuery('')}
          >
            <Icon name="times" style={styles.clearSearchIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersSection}>
          <Text style={styles.sectionTitle}>
            Selected Users ({selectedUsers.length})
          </Text>
          <FlatList
            data={selectedUsers}
            renderItem={renderSelectedUser}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedUsersList}
          />
        </View>
      )}
      
      <View style={styles.searchResultsContainer}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#118B50" />
            <Text style={styles.loadingText}>Searching users...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length >= 2 ? (
          <Text style={styles.noResults}>No users found matching "{searchQuery}"</Text>
        ) : (
          <View style={styles.instructionContainer}>
            <Icon name="search" style={styles.instructionIcon} />
            <Text style={styles.instructionText}>
              Search for users to add to your project
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    color: '#118B50',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#F6BD0F',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    fontSize: 16,
    color: '#757575',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000000',
  },
  clearSearch: {
    padding: 10,
  },
  clearSearchIcon: {
    fontSize: 16,
    color: '#757575',
  },
  selectedUsersSection: {
    marginBottom: 20,
  },
  selectedUsersList: {
    maxHeight: 80,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  searchResultsContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedUserItem: {
    backgroundColor: '#F5F5F5',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#118B50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  initialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 18,
    color: '#118B50',
  },
  removeIcon: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  noResults: {
    textAlign: 'center',
    padding: 40,
    color: '#757575',
    fontSize: 16,
  },
  instructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionIcon: {
    fontSize: 48,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AddMembersScreen;