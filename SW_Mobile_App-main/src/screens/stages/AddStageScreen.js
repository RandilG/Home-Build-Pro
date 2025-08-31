import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const AddStageScreen = ({ route }) => {
    const navigation = useNavigation();
    const { onStageAdded, onStageUpdated, stage } = route.params || {};
    const isEditing = Boolean(stage?.id);
    
    const API_URL = 'http://192.168.8.116:3000/api'; // Update with your server IP
    
    // State for form fields
    const [stageName, setStageName] = useState(stage?.name || '');
    const [description, setDescription] = useState(stage?.description || '');
    const [startDate, setStartDate] = useState(stage?.start_date || '');
    const [endDate, setEndDate] = useState(stage?.end_date || '');
    const [image, setImage] = useState(stage?.image_path ? `${API_URL}${stage.image_path}` : null);
    const [localImageUri, setLocalImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    // Custom calendar modal states
    const [showStartDateModal, setShowStartDateModal] = useState(false);
    const [showEndDateModal, setShowEndDateModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [currentDateSelection, setCurrentDateSelection] = useState('start');
    
    // State for validation errors
    const [errors, setErrors] = useState({
        stageName: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    
    // Request permission for media library and camera
    useEffect(() => {
        (async () => {
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera and media library permissions to use this feature.');
            }
        })();
    }, []);
    
    // Pick image from gallery
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setLocalImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    // Capture photo from camera
    const takePhoto = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setLocalImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };
    
    // Helper functions for calendar
    const getMonthDays = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };
    
    const getMonthName = (month) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    };
    
    const getDayOfWeek = (year, month, day) => {
        return new Date(year, month, day).getDay();
    };
    
    const generateCalendarDays = () => {
        const days = [];
        const totalDays = getMonthDays(selectedYear, selectedMonth);
        const firstDayOfWeek = getDayOfWeek(selectedYear, selectedMonth, 1);
        
        // Add empty cells for previous month days
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ day: '', disabled: true });
        }
        
        // Add days of the current month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(selectedYear, selectedMonth, i);
            const isInPast = currentDate < today;
            
            // For end date, also check if date is before start date
            let isBeforeStartDate = false;
            if (currentDateSelection === 'end' && startDate) {
                const startDateObj = new Date(startDate);
                isBeforeStartDate = currentDate < startDateObj;
            }
            
            days.push({
                day: i,
                disabled: isInPast || isBeforeStartDate
            });
        }
        
        return days;
    };
    
    // Handle date selection
    const selectDate = (day) => {
        if (!day || day.disabled) return;
        
        const selectedDate = new Date(selectedYear, selectedMonth, day.day);
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (currentDateSelection === 'start') {
            setStartDate(formattedDate);
            setShowStartDateModal(false);
            if (errors.startDate) {
                setErrors({...errors, startDate: ''});
            }
            
            // If end date is before new start date, clear end date
            if (endDate && new Date(endDate) < selectedDate) {
                setEndDate('');
            }
        } else {
            setEndDate(formattedDate);
            setShowEndDateModal(false);
            if (errors.endDate) {
                setErrors({...errors, endDate: ''});
            }
        }
    };
    
    // Calendar component
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
    
    // Validate form
    const validateForm = () => {
        let valid = true;
        const newErrors = {
            stageName: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        // Validate stage name
        if (!stageName.trim()) {
            newErrors.stageName = 'Stage name is required';
            valid = false;
        }
        
        // Validate start date
        if (!startDate.trim()) {
            newErrors.startDate = 'Start date is required';
            valid = false;
        }
        
        // Validate end date
        if (!endDate.trim()) {
            newErrors.endDate = 'End date is required';
            valid = false;
        }
        
        // Check if end date is after start date
        if (valid && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                newErrors.endDate = 'End date must be after start date';
                valid = false;
            }
        }
        
        // Validate description
        if (!description.trim()) {
            newErrors.description = 'Description is required';
            valid = false;
        }
        
        setErrors(newErrors);
        return valid;
    };
    
    // Create form data for API request
    const createFormData = async () => {
        const formData = new FormData();
        formData.append('name', stageName);
        formData.append('description', description);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        
        // Add image if a new one was selected
        if (localImageUri) {
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(localImageUri);
            
            if (fileInfo.exists) {
                const fileNameParts = localImageUri.split('/');
                const fileName = fileNameParts[fileNameParts.length - 1];
                
                formData.append('image', {
                    uri: localImageUri,
                    name: fileName,
                    type: 'image/jpeg' // You might need to determine the actual type
                });
            }
        }
        
        return formData;
    };
    
    // Handle Save (create or update stage)
    const handleSaveStage = async () => {
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const formData = await createFormData();
            
            let response;
            if (isEditing) {
                // Update existing stage
                response = await axios.put(
                    `${API_URL}/stages/${stage.id}`, 
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                
                if (onStageUpdated) {
                    onStageUpdated();
                }
                
                Alert.alert('Success', 'Stage updated successfully');
            } else {
                // Create new stage
                response = await axios.post(
                    `${API_URL}/stages`, 
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                
                if (onStageAdded) {
                    onStageAdded();
                }
                
                Alert.alert('Success', 'Stage added successfully');
            }
            
            navigation.goBack();
        } catch (error) {
            console.error('Error saving stage:', error);
            let errorMessage = 'An unexpected error occurred';
            
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerText}>{isEditing ? 'Edit Stage' : 'Add New Stage'}</Text>

            <TextInput
                style={[styles.input, errors.stageName ? styles.inputError : null]}
                placeholder="Stage Name"
                placeholderTextColor="#888"
                value={stageName}
                onChangeText={text => {
                    setStageName(text);
                    if (errors.stageName) {
                        setErrors({...errors, stageName: ''});
                    }
                }}
            />
            {errors.stageName ? <Text style={styles.errorText}>{errors.stageName}</Text> : null}

            {/* Start Date Field */}
            <TouchableOpacity 
                style={[styles.input, errors.startDate ? styles.inputError : null]} 
                onPress={() => {
                    setCurrentDateSelection('start');
                    setShowStartDateModal(true);
                    
                    // Initialize calendar with start date if it exists
                    if (startDate) {
                        const date = new Date(startDate);
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth());
                    } else {
                        // Otherwise initialize with current date
                        const now = new Date();
                        setSelectedYear(now.getFullYear());
                        setSelectedMonth(now.getMonth());
                    }
                }}
            >
                <Text style={startDate ? styles.dateText : styles.placeholderText}>
                    {startDate ? startDate : "Start Date (Select)"}
                </Text>
            </TouchableOpacity>
            {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}

            {/* End Date Field */}
            <TouchableOpacity 
                style={[styles.input, errors.endDate ? styles.inputError : null]} 
                onPress={() => {
                    setCurrentDateSelection('end');
                    setShowEndDateModal(true);
                    
                    // Initialize calendar with end date if it exists
                    if (endDate) {
                        const date = new Date(endDate);
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth());
                    } else if (startDate) {
                        // Otherwise initialize with start date
                        const date = new Date(startDate);
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth());
                    } else {
                        // Otherwise initialize with current date
                        const now = new Date();
                        setSelectedYear(now.getFullYear());
                        setSelectedMonth(now.getMonth());
                    }
                }}
            >
                <Text style={endDate ? styles.dateText : styles.placeholderText}>
                    {endDate ? endDate : "End Date (Select)"}
                </Text>
            </TouchableOpacity>
            {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}

            <TextInput
                style={[styles.input, styles.descriptionInput, errors.description ? styles.inputError : null]}
                placeholder="Description"
                placeholderTextColor="#888"
                multiline
                value={description}
                onChangeText={text => {
                    setDescription(text);
                    if (errors.description) {
                        setErrors({...errors, description: ''});
                    }
                }}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

            {/* Image Picker Buttons */}
            <View style={styles.imagePickerContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.imageButtonText}>Pick from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Text style={styles.imageButtonText}>Take a Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Show Selected Image */}
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <TouchableOpacity 
                style={[styles.addButton, loading ? styles.disabledButton : null]} 
                onPress={handleSaveStage}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <Text style={styles.addButtonText}>{isEditing ? 'Save Changes' : 'Add Stage'}</Text>
                )}
            </TouchableOpacity>

            {/* Calendar Modals */}
            <Modal
                transparent={true}
                visible={showStartDateModal}
                onRequestClose={() => setShowStartDateModal(false)}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Calendar />
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                visible={showEndDateModal}
                onRequestClose={() => setShowEndDateModal(false)}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Calendar />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#118B50', alignItems: 'center', paddingVertical: 30 },
    headerText: { fontSize: 30, color: '#FFFFFF', marginBottom: 20 },
    input: { 
        backgroundColor: '#E3F0AF', 
        width: 300, 
        height: 50, 
        borderRadius: 10, 
        paddingLeft: 15, 
        fontSize: 18, 
        marginBottom: 10,
        justifyContent: 'center'
    },
    inputError: { borderWidth: 1, borderColor: '#FF4040' },
    errorText: { color: '#FF4040', fontSize: 14, marginBottom: 10, alignSelf: 'flex-start', marginLeft: 50 },
    descriptionInput: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
    dateText: { fontSize: 18, color: '#000' },
    placeholderText: { fontSize: 18, color: '#888' },
    imagePickerContainer: { flexDirection: 'row', marginVertical: 20 },
    imageButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10, marginHorizontal: 10 },
    imageButtonText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
    previewImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
    addButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10, width: 200, alignItems: 'center', marginTop: 10 },
    disabledButton: { backgroundColor: '#FFB300', opacity: 0.7 },
    addButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    
    // Calendar styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 10
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    calendarNavButton: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 15
    },
    weekDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    weekDayText: {
        fontSize: 14,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center'
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2
    },
    dayText: {
        fontSize: 16
    },
    disabledDay: {
        opacity: 0.4
    },
    disabledDayText: {
        color: '#999'
    },
    closeButton: {
        backgroundColor: '#FFB300',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20
    },
    closeButtonText: {
        color: '#000',
        fontWeight: 'bold'
    }
});

export default AddStageScreen;