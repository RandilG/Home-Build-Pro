import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ProjectPhotos = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId, projectName } = route.params || {};
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'Project ID not found');
      navigation.goBack();
      return;
    }
    
    fetchUserInfo();
    fetchPhotos();
  }, [projectId]);

  const fetchUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('username');
      
      if (userId && userName) {
        setUser({
          id: parseInt(userId),
          name: userName
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/photos`);
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload photos.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera permissions to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadPhoto = async () => {
    if (!selectedImage || !photoName.trim()) {
      Alert.alert('Error', 'Please select an image and provide a name');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('photo', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });
      formData.append('projectId', projectId);
      formData.append('userId', user.id);
      formData.append('photoName', photoName.trim());
      formData.append('description', photoDescription.trim());

             const response = await axios.post(
         `http://192.168.8.116:3000/api/projects/${projectId}/photos`,
         formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Photo uploaded successfully');
        setShowUploadModal(false);
        setSelectedImage(null);
        setPhotoName('');
        setPhotoDescription('');
        fetchPhotos(); // Refresh the photos list
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const viewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setShowImageModal(true);
    
    // Track view
    if (user) {
      axios.post('http://192.168.8.116:3000/api/projects/content/view', {
        projectId,
        userId: user.id,
        contentType: 'photo',
        contentId: photo.id
      }).catch(error => console.error('Error tracking view:', error));
    }
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity style={styles.photoItem} onPress={() => viewPhoto(item)}>
      <Image 
        source={{ 
          uri: item.photoUrl.startsWith('http') 
            ? item.photoUrl 
            : `http://192.168.8.116:3000${item.photoUrl}` 
        }} 
        style={styles.photoImage} 
      />
      <View style={styles.photoInfo}>
        <Text style={styles.photoName} numberOfLines={1}>{item.photoName}</Text>
        <Text style={styles.photoUser} numberOfLines={1}>By: {item.userName}</Text>
        <Text style={styles.photoDate}>{new Date(item.uploadedAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#118B50" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#118B50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{projectName || 'Project'} Photos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
            <Icon name="camera" size={24} color="#118B50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
            <Icon name="image-plus" size={24} color="#118B50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.photosGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="image-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubText}>Start by taking or uploading photos</Text>
        </View>
      )}

      {/* Upload Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Photo</Text>
            
            {selectedImage && (
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Photo Name"
              value={photoName}
              onChangeText={setPhotoName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={photoDescription}
              onChangeText={setPhotoDescription}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.uploadButton]} 
                onPress={uploadPhoto}
                disabled={uploading || !photoName.trim()}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image View Modal */}
      <Modal visible={showImageModal} animationType="fade" transparent>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalClose} 
            onPress={() => setShowImageModal(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {selectedPhoto && (
            <>
              <Image 
                source={{ 
                  uri: selectedPhoto.photoUrl.startsWith('http') 
                    ? selectedPhoto.photoUrl 
                    : `http://192.168.8.116:3000${selectedPhoto.photoUrl}` 
                }} 
                style={styles.fullImage} 
                resizeMode="contain"
              />
              <View style={styles.imageInfo}>
                <Text style={styles.fullImageName}>{selectedPhoto.photoName}</Text>
                <Text style={styles.fullImageUser}>By: {selectedPhoto.userName}</Text>
                <Text style={styles.fullImageDate}>
                  {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}
                </Text>
                {selectedPhoto.description && (
                  <Text style={styles.fullImageDescription}>{selectedPhoto.description}</Text>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>
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
    color: '#118B50',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
  photosGrid: {
    padding: 8,
  },
  photoItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  photoImage: {
    width: '100%',
    height: (width - 32) / 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  photoInfo: {
    padding: 8,
  },
  photoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  photoUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  photoDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
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
    marginTop: 20,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#118B50',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  uploadButton: {
    backgroundColor: '#118B50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: width,
    height: width * 0.75,
  },
  imageInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  fullImageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  fullImageUser: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  fullImageDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  fullImageDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});

export default ProjectPhotos;
