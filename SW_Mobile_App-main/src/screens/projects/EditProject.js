import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const EditProject = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const projectId = route.params?.id;
    
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [estimatedEndDate, setEstimatedEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({ startDate: '', endDate: '' });
    const [imageUri, setImageUri] = useState(null);
    const [imageName, setImageName] = useState('');
    const [originalImageUrl, setOriginalImageUrl] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    
    // Calendar modal states
    const [showStartDateModal, setShowStartDateModal] = useState(false);
    const [showEndDateModal, setShowEndDateModal] = useState(false);
    const [currentDateSelection, setCurrentDateSelection] = useState('start');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('user_id');
                if (storedUserId) {
                    setUserId(parseInt(storedUserId));
                } else {
                    Alert.alert('Error', 'You need to be logged in to edit a project');
                    navigation.navigate('Login');
                }
            } catch (error) {
                console.error('Error getting user ID:', error);
            }
        };
        getUserId();
        
        if (projectId) {
            fetchProjectDetails();
        } else {
            Alert.alert('Error', 'No project ID provided');
            navigation.goBack();
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setInitialLoading(true);
            console.log('Fetching project details for ID:', projectId);
            
            const response = await axios.get(`http://192.168.8.116:3000/api/projects/${projectId}`);
            const project = response.data;
            
            console.log('Fetched project:', project);
            
            // Populate form fields
            setProjectName(project.name || '');
            setProjectDescription(project.description || '');
            setStartDate(project.start_date ? project.start_date.split('T')[0] : '');
            setEstimatedEndDate(project.estimated_end_date ? project.estimated_end_date.split('T')[0] : '');
            setOriginalImageUrl(project.image_url);
            
            // Set image URI if exists
            if (project.image_url) {
                const fullImagePath = `${FileSystem.documentDirectory}${project.image_url}`;
                const imageInfo = await FileSystem.getInfoAsync(fullImagePath);
                if (imageInfo.exists) {
                    setImageUri(fullImagePath);
                } else {
                    console.log('Image file not found locally:', fullImagePath);
                }
            }
            
        } catch (error) {
            console.error('Error fetching project details:', error);
            Alert.alert('Error', 'Failed to load project details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    };

    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    const generateCalendarDays = () => {
        const days = [];
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', disabled: true });
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(selectedYear, selectedMonth, i);
            const isDisabled = dateObj < today; // Disable past dates
            
            // If this is for end date selection and we have a start date
            if (currentDateSelection === 'end' && startDate) {
                const startDateObj = new Date(startDate);
                if (dateObj < startDateObj) {
                    days.push({ day: i, disabled: true });
                    continue;
                }
            }
            
            days.push({ day: i, disabled: isDisabled, date: dateObj });
        }
        
        return days;
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const displayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const selectDate = (day) => {
        if (day.disabled || !day.date) return;
        
        const selectedDate = formatDate(day.date);
        
        if (currentDateSelection === 'start') {
            setStartDate(selectedDate);
            setShowStartDateModal(false);
            
            // If end date is earlier than start date, reset end date
            if (estimatedEndDate) {
                const startDateObj = new Date(selectedDate);
                const endDateObj = new Date(estimatedEndDate);
                if (endDateObj < startDateObj) {
                    setEstimatedEndDate('');
                }
            }
        } else {
            setEstimatedEndDate(selectedDate);
            setShowEndDateModal(false);
        }
    };

    const openStartDatePicker = () => {
        setCurrentDateSelection('start');
        setShowStartDateModal(true);
    };

    const openEndDatePicker = () => {
        setCurrentDateSelection('end');
        setShowEndDateModal(true);
    };

    const pickImage = async () => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload an image.');
                return;
            }
            
            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setImageUri(selectedImage.uri);
                setImageChanged(true);
                
                // Extract file name from URI
                const fileName = selectedImage.uri.split('/').pop();
                setImageName(fileName);
                
                // Save image locally
                const projectsDirectory = `${FileSystem.documentDirectory}projects/`;
                
                // Check if directory exists, if not create it
                const dirInfo = await FileSystem.getInfoAsync(projectsDirectory);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(projectsDirectory, { intermediates: true });
                }
                
                // Save the image to the projects directory
                const localUri = `${projectsDirectory}${fileName}`;
                await FileSystem.copyAsync({
                    from: selectedImage.uri,
                    to: localUri
                });
                
                setImageUri(localUri);
                console.log('Image saved locally at:', localUri);
            }
        } catch (error) {
            console.error('Error picking or saving image:', error);
            Alert.alert('Error', 'Failed to pick or save image.');
        }
    };

    const removeImage = () => {
        setImageUri(null);
        setImageName('');
        setImageChanged(true);
    };

    const validateDates = () => {
        let isValid = true;
        const newErrors = { startDate: '', endDate: '' };

        if (startDate && estimatedEndDate) {
            const start = new Date(startDate);
            const end = new Date(estimatedEndDate);
            
            if (end < start) {
                newErrors.endDate = 'End date must be after start date';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!projectName.trim()) {
            Alert.alert('Error', 'Please enter a project name');
            return;
        }

        if (!startDate) {
            Alert.alert('Error', 'Please select a start date');
            return;
        }

        if (!estimatedEndDate) {
            Alert.alert('Error', 'Please select an estimated end date');
            return;
        }

        if (!validateDates()) {
            Alert.alert('Error', 'Please check the date fields');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'User ID not found. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            
            // Prepare image URL for database
            let imageUrl = originalImageUrl; // Keep original if no change
            
            if (imageChanged) {
                if (imageUri && imageName) {
                    imageUrl = `projects/${imageName}`;
                } else {
                    imageUrl = null; // Image was removed
                }
            }
            
            const projectData = {
                name: projectName,
                description: projectDescription,
                startDate,
                estimatedEndDate,
                imageUrl
            };
            
            console.log('Updating project with data:', projectData);
            
            await axios.put(`http://192.168.8.116:3000/api/projects/${projectId}`, projectData);
            
            Alert.alert('Success', 'Project updated successfully!', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        // Navigate back to ProjectDetails or Dashboard
                        navigation.navigate('Dashboard');
                        // Or if you want to go back to ProjectDetails with updated data:
                        // navigation.goBack();
                    }
                }
            ]);
            
        } catch (error) {
            console.error('Error updating project:', error);
            console.error('Error response:', error.response?.data);
            Alert.alert('Error', 'Failed to update project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Custom Calendar Component
    const Calendar = () => {
        const days = generateCalendarDays();
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        return (
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => {
                        if (selectedMonth === 0) {
                            setSelectedMonth(11);
                            setSelectedYear(selectedYear - 1);
                        } else {
                            setSelectedMonth(selectedMonth - 1);
                        }
                    }}>
                        <Text style={styles.calendarNavButton}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarTitle}>{getMonthName(selectedMonth)} {selectedYear}</Text>
                    <TouchableOpacity onPress={() => {
                        if (selectedMonth === 11) {
                            setSelectedMonth(0);
                            setSelectedYear(selectedYear + 1);
                        } else {
                            setSelectedMonth(selectedMonth + 1);
                        }
                    }}>
                        <Text style={styles.calendarNavButton}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.weekDayContainer}>
                    {weekDays.map((day, index) => (
                        <Text key={index} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>
                
                <View style={styles.daysContainer}>
                    {days.map((day, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.dayCell, 
                                day.disabled ? styles.disabledDay : null
                            ]}
                            onPress={() => selectDate(day)}
                            disabled={day.disabled}
                        >
                            <Text style={[
                                styles.dayText, 
                                day.disabled ? styles.disabledDayText : null
                            ]}>
                                {day.day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => {
                        if (currentDateSelection === 'start') {
                            setShowStartDateModal(false);
                        } else {
                            setShowEndDateModal(false);
                        }
                    }}
                >
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#F6BD0F" />
                <Text style={styles.loadingText}>Loading project details...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={30} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Project</Text>
                </View>
                
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Project Name</Text>
                    <TextInput 
                        style={styles.input} 
                        value={projectName} 
                        onChangeText={setProjectName} 
                        placeholder="Enter project name" 
                    />
                    
                    <Text style={styles.label}>Project Image</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Icon name="image-plus" size={24} color="#FFFFFF" />
                        <Text style={styles.uploadButtonText}>
                            {imageUri ? 'Change Image' : 'Upload Image'}
                        </Text>
                    </TouchableOpacity>
                    
                    {imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <TouchableOpacity 
                                style={styles.removeImageButton}
                                onPress={removeImage}
                            >
                                <Icon name="close-circle" size={24} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={openStartDatePicker}
                    >
                        <Text style={styles.datePickerButtonText}>
                            {startDate ? displayDate(startDate) : 'Select Start Date'}
                        </Text>
                        <Icon name="calendar" size={24} color="#118B50" />
                    </TouchableOpacity>
                    {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
                    
                    <Modal
                        visible={showStartDateModal}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Start Date</Text>
                                <Calendar />
                            </View>
                        </View>
                    </Modal>
                    
                    <Text style={styles.label}>Estimated End Date</Text>
                    <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={openEndDatePicker}
                        disabled={!startDate}
                    >
                        <Text style={[
                            styles.datePickerButtonText,
                            !startDate && styles.disabledText
                        ]}>
                            {estimatedEndDate ? displayDate(estimatedEndDate) : 'Select End Date'}
                        </Text>
                        <Icon name="calendar" size={24} color={startDate ? "#118B50" : "#CCCCCC"} />
                    </TouchableOpacity>
                    {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
                    {!startDate && <Text style={styles.hintText}>Please select a start date first</Text>}
                    
                    <Modal
                        visible={showEndDateModal}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select End Date</Text>
                                <Calendar />
                            </View>
                        </View>
                    </Modal>
                    
                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        value={projectDescription} 
                        onChangeText={setProjectDescription} 
                        placeholder="Enter project description" 
                        multiline 
                        numberOfLines={4} 
                    />
                    
                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleSubmit} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Update Project</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
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
        marginTop: 50,
        marginBottom: 30,
    },
    backButton: {
        padding: 5,
    },
    title: {
        flex: 1,
        fontSize: 28,
        color: '#FFFFFF',
        textAlign: 'center',
        marginRight: 35, // To compensate for the back button width
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
        color: '#333333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    uploadButton: {
        backgroundColor: '#118B50',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#F9F9F9',
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333333',
    },
    disabledText: {
        color: '#CCCCCC',
    },
    hintText: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 14,
        marginTop: 5,
    },
    imagePreviewContainer: {
        marginTop: 15,
        position: 'relative',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 5,
    },
    submitButton: {
        backgroundColor: '#F6BD0F',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 30,
        elevation: 3,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    // Calendar styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#118B50',
    },
    calendarContainer: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 10,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    calendarNavButton: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#118B50',
        paddingHorizontal: 10,
    },
    weekDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 10,
    },
    weekDayText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666666',
        width: 40,
        textAlign: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayCell: {
        width: '14.28%', // 7 days per week
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    dayText: {
        fontSize: 16,
        color: '#333333',
    },
    disabledDay: {
        opacity: 0.3,
    },
    disabledDayText: {
        color: '#CCCCCC',
    },
    closeButton: {
        backgroundColor: '#F6BD0F',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProject;