import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProjectReports = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId, projectName } = route.params || {};
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState('other');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    { key: 'progress', label: 'Progress Report' },
    { key: 'financial', label: 'Financial Report' },
    { key: 'technical', label: 'Technical Report' },
    { key: 'safety', label: 'Safety Report' },
    { key: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'Project ID not found');
      navigation.goBack();
      return;
    }
    
    fetchUserInfo();
    fetchReports();
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}/reports`);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'image/*'
        ],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const uploadReport = async () => {
    if (!selectedFile || !reportTitle.trim()) {
      Alert.alert('Error', 'Please select a file and provide a title');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('report', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name
      });
      formData.append('projectId', projectId);
      formData.append('userId', user.id);
      formData.append('reportTitle', reportTitle.trim());
      formData.append('reportDescription', reportDescription.trim());
      formData.append('reportType', reportType);

      const response = await axios.post(
        `http://192.168.8.116:3000/api/projects/${projectId}/reports`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Report uploaded successfully');
        setShowUploadModal(false);
        setSelectedFile(null);
        setReportTitle('');
        setReportDescription('');
        setReportType('other');
        fetchReports(); // Refresh the reports list
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      Alert.alert('Error', 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    
    // Track view
    if (user) {
      axios.post('http://192.168.8.116:3000/api/projects/content/view', {
        projectId,
        userId: user.id,
        contentType: 'report',
        contentId: report.id
      }).catch(error => console.error('Error tracking view:', error));
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'file-pdf-box';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word-box';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-excel-box';
    if (fileType.includes('text')) return 'file-document-outline';
    if (fileType.includes('image')) return 'file-image-box';
    return 'file-document-outline';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity style={styles.reportItem} onPress={() => viewReport(item)}>
      <View style={styles.reportIcon}>
        <Icon name={getFileIcon(item.fileType)} size={40} color="#118B50" />
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle} numberOfLines={2}>{item.reportTitle}</Text>
        <Text style={styles.reportType}>{reportTypes.find(t => t.key === item.reportType)?.label}</Text>
        <Text style={styles.reportUser} numberOfLines={1}>By: {item.userName}</Text>
        <Text style={styles.reportDate}>{new Date(item.uploadedAt).toLocaleDateString()}</Text>
        <Text style={styles.reportSize}>{formatFileSize(item.fileSize)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#118B50" />
          <Text style={styles.loadingText}>Loading reports...</Text>
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
        <Text style={styles.headerTitle}>{projectName || 'Project'} Reports</Text>
        <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
          <Icon name="upload" size={24} color="#118B50" />
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reportsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
                      <Icon name="file-document-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No reports yet</Text>
          <Text style={styles.emptySubText}>Start by uploading project reports</Text>
        </View>
      )}

      {/* Upload Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Report</Text>
            
            {selectedFile && (
              <View style={styles.fileInfo}>
                <Icon name={getFileIcon(selectedFile.mimeType)} size={40} color="#118B50" />
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Report Title *"
              value={reportTitle}
              onChangeText={setReportTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
            />

            <Text style={styles.label}>Report Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    reportType === type.key && styles.typeButtonActive
                  ]}
                  onPress={() => setReportType(type.key)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    reportType === type.key && styles.typeButtonTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.uploadButton]} 
                onPress={uploadReport}
                disabled={uploading || !reportTitle.trim()}
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

      {/* Report View Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedReport && (
              <ScrollView style={styles.reportDetails}>
                <View style={styles.reportHeader}>
                  <Icon name={getFileIcon(selectedReport.fileType)} size={60} color="#118B50" />
                  <Text style={styles.reportTitleLarge}>{selectedReport.reportTitle}</Text>
                  <Text style={styles.reportTypeLarge}>
                    {reportTypes.find(t => t.key === selectedReport.reportType)?.label}
                  </Text>
                </View>
                
                <View style={styles.reportMeta}>
                  <Text style={styles.reportMetaText}>
                    <Text style={styles.metaLabel}>By:</Text> {selectedReport.userName}
                  </Text>
                  <Text style={styles.reportMetaText}>
                    <Text style={styles.metaLabel}>Date:</Text> {new Date(selectedReport.uploadedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.reportMetaText}>
                    <Text style={styles.metaLabel}>Size:</Text> {formatFileSize(selectedReport.fileSize)}
                  </Text>
                  <Text style={styles.reportMetaText}>
                    <Text style={styles.metaLabel}>File:</Text> {selectedReport.reportFileName}
                  </Text>
                </View>
                
                {selectedReport.reportDescription && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{selectedReport.reportDescription}</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    // Handle download/view logic here
                    Alert.alert('Info', 'Download functionality will be implemented based on your requirements');
                  }}
                >
                  <Icon name="download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>Download Report</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
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
  uploadButton: {
    padding: 8,
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
  reportsList: {
    padding: 16,
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 12,
    color: '#118B50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reportUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  reportSize: {
    fontSize: 12,
    color: '#999',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
  },
  fileInfo: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeContainer: {
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonActive: {
    backgroundColor: '#118B50',
    borderColor: '#118B50',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
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
  reportDetails: {
    flex: 1,
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reportTitleLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  reportTypeLarge: {
    fontSize: 14,
    color: '#118B50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reportMeta: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  metaLabel: {
    fontWeight: '600',
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: '#118B50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProjectReports;
