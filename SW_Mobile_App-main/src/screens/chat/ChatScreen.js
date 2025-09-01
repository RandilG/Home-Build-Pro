import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId, projectName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const wsRef = useRef(null);

  // Debug logging
  console.log('ChatScreen - Route params:', route.params);
  console.log('ChatScreen - ProjectId:', projectId);
  console.log('ChatScreen - ProjectName:', projectName);

  // Fetch user info from AsyncStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const userName = await AsyncStorage.getItem('username');
        const email = await AsyncStorage.getItem('email');
        
        if (userId && userName) {
          setUser({
            id: parseInt(userId),
            name: userName,
            email: email
          });
        } else {
          setLoading(false);
          Alert.alert('Error', 'User information not found. Please login again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load user information.');
      }
    };
    
    fetchUserInfo();
  }, []);

  // Check for required parameters first
  useEffect(() => {
    console.log('Checking projectId:', projectId, 'Type:', typeof projectId);
    
    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      setLoading(false);
      Alert.alert('Error', 'Invalid project. Please select a chat from the list.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    
    // Ensure projectId is a valid number
    if (isNaN(parseInt(projectId))) {
      setLoading(false);
      Alert.alert('Error', 'Invalid project ID. Please select a chat from the list.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
  }, [projectId]);

  // Fetch message history and setup WebSocket
  useEffect(() => {
    if (!user || !projectId) {
      return;
    }

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for projectId:', projectId);
        const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/messages`, { 
          timeout: 10000 
        });
        console.log('Messages API response:', response.data);
        setMessages(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        setLoading(false);
        if (error.code === 'ECONNABORTED') {
          Alert.alert('Error', 'Connection timeout. Please check your network connection.');
        } else if (error.response?.status === 403) {
          Alert.alert('Access Denied', 'You are not a member of this project. Please contact the project owner.');
        } else if (error.response?.status === 404) {
          Alert.alert('Error', 'Project not found. Please check if the project still exists.');
        } else {
          Alert.alert('Error', 'Failed to load chat messages. Please try again.');
        }
      }
    };
    
    fetchMessages();
    
    // Setup WebSocket connection
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`ws://192.168.8.116:3000`);
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          // Join the project room
          ws.send(JSON.stringify({
            type: 'join_project',
            projectId: projectId,
            userId: user.id
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
              setMessages(prevMessages => {
                // Avoid duplicates
                const messageExists = prevMessages.some(msg => msg.id === data.message.id);
                if (messageExists) return prevMessages;
                return [...prevMessages, data.message];
              });
            } else if (data.type === 'user_typing') {
              // Handle typing indicators if needed
              console.log(`User ${data.userId} is ${data.isTyping ? 'typing' : 'not typing'}`);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'leave_project',
          projectId: projectId
        }));
        wsRef.current.close();
      }
    };
  }, [projectId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;
    
    setSending(true);
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      const response = await axios.post(`http://192.168.8.116:3000/api/projects/${projectId}/messages`, {
        content: messageToSend,
        userId: user.id
      });
      
      if (!response.data.success) {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isSent = item.userId === user?.id;
    
    return (
      <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
        {!isSent && (
          <Text style={styles.messageSender}>{item.userName}</Text>
        )}
        <View style={[styles.messageContent, isSent ? styles.sentContent : styles.receivedContent]}>
          <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isSent ? styles.sentTimeText : styles.receivedTimeText]}>
            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084ff" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{projectName || 'Project Chat'}</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('ProjectMembers', { projectId })}
        >
          <Icon name="users" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="comments" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubText}>Start the conversation!</Text>
          </View>
        }
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              opacity: (newMessage.trim() && !sending) ? 1 : 0.5,
              backgroundColor: sending ? '#ccc' : '#0084ff'
            }
          ]} 
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="paper-plane" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  menuButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
    color: '#555',
    marginLeft: 12,
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  sentContent: {
    backgroundColor: '#0084ff',
    borderBottomRightRadius: 4,
  },
  receivedContent: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.7,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  sentTimeText: {
    color: '#fff',
  },
  receivedTimeText: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;