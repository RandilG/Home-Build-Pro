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
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const flatListRef = useRef(null);

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    fetchUserInfo();
  }, []);

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
    
    // Set up real-time message updates (e.g., using WebSocket)
    // Note: You might need a React Native compatible WebSocket library
    const socket = new WebSocket(`ws://your-websocket-server/projects/${projectId}`);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, message]);
    };
    
    return () => {
      socket.close();
    };
  }, [projectId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await axios.post(`/api/projects/${projectId}/messages`, {
        content: newMessage,
        userId: user.id
      });
      
      // Message will be added via WebSocket
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
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
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="paper-plane" size={20} color="#fff" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
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
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
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
    color: '#fff',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  receivedContent: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  sentContent: {
    backgroundColor: '#0084ff',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
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
    color: '#000',
  },
  sentContent: {
    backgroundColor: '#0084ff',
  },
  receivedContent: {
    backgroundColor: '#e5e5ea',
  },
  messageText: {
    fontSize: 16,
  },
  sentContent: {
    backgroundColor: '#0084ff',
  },
  receivedContent: {
    backgroundColor: '#e5e5ea',
  },
  sentContent: {
    backgroundColor: '#0084ff',
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
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
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