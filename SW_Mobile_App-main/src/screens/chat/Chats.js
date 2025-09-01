import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChatItem = ({ project, onPress }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], {weekday: 'short'});
    } else {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.chatImageContainer}>
        <Icon name="home-city" size={40} color="#118B50" />
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {project.project_name}
          </Text>
          <Text style={styles.chatTime}>
            {formatTime(project.last_message_time)}
          </Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.chatDescription} numberOfLines={2}>
            {project.last_message || 'No messages yet'}
          </Text>
          {project.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {project.unread_count > 99 ? '99+' : project.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Chats = () => {
  const navigation = useNavigation();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserAndChats();
  }, []);

  const fetchUserAndChats = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('username');
      const email = await AsyncStorage.getItem('email');
      
      console.log('User info from AsyncStorage:', { userId, userName, email });
      
      if (!userId) {
        console.log('No userId found, navigating to Login');
        navigation.navigate('Login');
        return;
      }
      
      setUser({ id: parseInt(userId) });
      console.log('Fetching chats for user:', parseInt(userId));
      await fetchChatList(userId);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setLoading(false);
    }
  };

  const fetchChatList = async (userId) => {
    try {
      console.log('Fetching chat list for userId:', userId);
      const response = await axios.get(`http://192.168.8.116:3000/api/chats/${userId}`);
      console.log('Chat list API response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      const chatData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed chat data:', chatData);
      
      if (chatData.length > 0) {
        console.log('First chat item:', chatData[0]);
        console.log('First chat project_id:', chatData[0].project_id);
        console.log('First chat project_name:', chatData[0].project_name);
      }
      
      setChatList(chatData);
    } catch (error) {
      console.error('Error fetching chat list:', error);
      setChatList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user) {
      fetchChatList(user.id);
    }
  };

  const openChat = (project) => {
    console.log('Opening chat for project:', project);
    console.log('Navigation params:', {
      projectId: project.project_id,
      projectName: project.project_name
    });
    navigation.navigate('ChatScreen', {
      projectId: project.project_id,
      projectName: project.project_name
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderText}>Chats</Text>
          <Icon style={styles.chatIcon} name="chat" size={35} color="#FFB300" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderText}>Chats</Text>
        <Icon style={styles.chatIcon} name="chat" size={35} color="#FFB300" />
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            if (user) {
              console.log('Manual refresh triggered for user:', user.id);
              fetchChatList(user.id);
            }
          }}
        >
          <Icon name="refresh" size={20} color="#FFB300" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.chatContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
      >
        {chatList.length > 0 ? (
          chatList.map((project, index) => (
            <ChatItem
              key={project.project_id}
              project={project}
              onPress={() => openChat(project)}
            />
          ))
        ) : (
          <View style={styles.noChatContainer}>
            <Icon name="chat-outline" size={80} color="#C7ADCE" />
            <Text style={styles.noChatText}>No project chats available</Text>
            <Text style={styles.noChatSubText}>
              Join a project to start chatting with team members
            </Text>
            <Text style={styles.debugText}>
              Debug: User ID: {user?.id}, Chats found: {chatList.length}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  chatContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    marginTop: 20,
    alignSelf: 'center'
  },
  chatHeaderText: {
    fontSize: 30,
    color: '#FFFFFF',
    marginTop: 30,
    marginLeft: 10,
    marginBottom: 30,
  },
  chatIcon: {
    marginTop: 32,
    marginLeft: 5,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 15,
  },
  chatImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#C7ADCE',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatDescription: {
    fontSize: 14,
    color: '#C7ADCE',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#F6BD0F',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noChatText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 20,
    fontWeight: '600',
  },
  noChatSubText: {
    fontSize: 14,
    color: '#C7ADCE',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  debugText: {
    fontSize: 12,
    color: '#FFB300',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  debugButton: {
    padding: 8,
    marginLeft: 10,
  },
});