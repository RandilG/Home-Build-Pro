import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  FlatList, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddMembersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch current project members
  useEffect(() => {
    const fetchCurrentMembers = async () => {
      try {
        const response = await axios.get(`http://192.168.8.116:3000/api/projects/${id}/members`);
        setCurrentMembers(response.data);
      } catch (error) {
        console.error('Error fetching project members:', error);
      }
    };
    
    fetchCurrentMembers();
  }, [id]);

  // Search users
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`/api/users/search?q=${searchQuery}`);
        
        // Filter out users who are already members
        const filteredResults = response.data.filter(
          user => !currentMembers.some(member => member.id === user.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
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
    
    try {
      await axios.post(`/api/projects/${id}/members`, {
        userIds: selectedUsers.map(user => user.id)
      });
      
      navigation.navigate('ProjectDetails', { id });
    } catch (error) {
      console.error('Error adding members:', error);
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
      <Icon name="check" style={styles.checkIcon} />
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
        <Text style={styles.userName}>{item.name}</Text>
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
            selectedUsers.length === 0 && styles.addButtonDisabled
          ]} 
          onPress={addMembers}
          disabled={selectedUsers.length === 0}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      {isSearching ? (
        <ActivityIndicator size="large" color="#118B50" style={styles.loader} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
        />
      ) : searchQuery.length >= 2 ? (
        <Text style={styles.noResults}>No users found</Text>
      ) : null}
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
  },
  searchInput: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
  },
  clearSearch: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  clearSearchIcon: {
    fontSize: 16,
    color: '#757575',
  },
  selectedUsersSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
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
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  checkIcon: {
    fontSize: 18,
    color: '#118B50',
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#757575',
    fontSize: 16,
  },
  loader: {
    marginTop: 20
  }
});

export default AddMembersScreen;