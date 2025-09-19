import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Import your sample image from assets
const sampleProjectImage = require('../../../assets/img/festive.jpg'); // Adjust path as needed

const ViewProjects = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    getUserEmail();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchProjects();
    }
  }, [userEmail]);

  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      if (email) {
        setUserEmail(email);
      } else {
        Alert.alert('Error', 'No user email found. Please login again.');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error getting user email:', error);
      Alert.alert('Error', 'Failed to get user information.');
    }
  };

  const fetchProjects = async () => {
    if (!userEmail) return;
    
    try {
      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${userEmail}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard} 
      onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
    >
      <Image 
        source={item.imageUrl ? { uri: item.imageUrl } : sampleProjectImage} 
        style={styles.projectImage}
        resizeMode="cover"
      />
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Projects</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#118B50" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  projectDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default ViewProjects;