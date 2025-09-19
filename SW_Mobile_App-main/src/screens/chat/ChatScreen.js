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
  
  // Get project ID from different possible route params
  const projectId = route.params?.projectId || route.params?.id || null;
  const projectName = route.params?.projectName || 'Project Chat';
  
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
        
        if (userId && userName && email) {
          setUser({
            id: parseInt(userId),
            name: userName,
            email: email
          });
          console.log('User loaded:', { id: parseInt(userId), name: userName, email });
        } else {
          Alert.alert('Error', 'User information not found. Please login again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        Alert.alert('Error', 'Failed to load user information.');
      }
    };
    
    fetchUserInfo();
  }, []);

  // Check if we have a valid project ID
  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'No project selected. Please select a project first.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    
    console.log('Using project ID:', projectId);
  }, [projectId]);

  // Fetch messages and setup WebSocket
  useEffect(() => {
    if (!user || !projectId) {
      return;
    }

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for projectId:', projectId);
        const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/messages`, { 
          timeout: 15000 
        });
        console.log('Messages API response:', response.data);
        
        if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          console.log('Messages response is not an array, setting empty array');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        
        // Set empty messages array and continue - don't block the chat
        setMessages([]);
        
        if (error.code === 'ECONNABORTED') {
          console.log('Connection timeout - continuing with empty messages');
        } else if (error.response?.status === 404) {
          console.log('Messages endpoint not found - continuing with empty messages');
        } else {
          console.log('Error loading messages - continuing with empty messages');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Setup WebSocket connection
    const connectWebSocket = () => {
      try {
        console.log('Connecting to WebSocket...');
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
            console.log('WebSocket message received:', data);
            
            if (data.type === 'new_message') {
              setMessages(prevMessages => {
                // Avoid duplicates
                const messageExists = prevMessages.some(msg => msg.id === data.message.id);
                if (messageExists) return prevMessages;
                return [...prevMessages, data.message];
              });
            } else if (data.type === 'user_typing') {
              console.log(`User ${data.userId} is ${data.isTyping ? 'typing' : 'not typing'}`);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (user && projectId) {
              connectWebSocket();
            }
          }, 5000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
        try {
          flatListRef.current.scrollToEnd({ animated: true });
        } catch (error) {
          console.log('Error scrolling to end:', error);
        }
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending || !projectId) return;
    
    setSending(true);
    const messageToSend = newMessage.trim();
    const tempId = Date.now(); // Temporary ID for optimistic update
    
    // Optimistic update - add message immediately
    const optimisticMessage = {
      id: tempId,
      content: messageToSend,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      const response = await axios.post(`http://192.168.8.116:3000/api/projects/${projectId}/messages`, {
        content: messageToSend,
        userId: user.id
      }, {
        timeout: 10000
      });
      
      console.log('Send message response:', response.data);
      
      // Remove optimistic message and let WebSocket handle the real message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      if (!response.data.success) {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageToSend); // Restore message on error
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    if (!item || !user) return null;
    
    const isSent = item.userId === user.id;
    
    return (
      <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
        {!isSent && (
          <Text style={styles.messageSender}>{item.userName || 'Unknown User'}</Text>
        )}
        <View style={[
          styles.messageContent, 
          isSent ? styles.sentContent : styles.receivedContent,
          item.isOptimistic && styles.optimisticMessage
        ]}>
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

  if (!projectId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>No project selected</Text>
          <TouchableOpacity 
            style={styles.errorButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            if (projectId) {
              navigation.navigate('ProjectMembers', { projectId });
            }
          }}
        >
          <Icon name="users" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            try {
              flatListRef.current.scrollToEnd({ animated: true });
            } catch (error) {
              console.log('Error scrolling to end:', error);
            }
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#0084ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  optimisticMessage: {
    opacity: 0.7,
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