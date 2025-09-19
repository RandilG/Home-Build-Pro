import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'http://192.168.8.116:3000/api';

const Stagedetails = ({ route }) => {
    const navigation = useNavigation();
    const { stage, onStageUpdated } = route.params; // Get stage details from navigation

    function goBack() {
        navigation.goBack();
    }

    function handleDelete() {
        Alert.alert(
            "Delete Stage",
            "Are you sure you want to delete this stage?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            // Add API call to delete from backend
                            await axios.delete(`${API_URL}/stages/${stage.id}`);
                            
                            // Call the callback to refresh the stages list
                            if (onStageUpdated) {
                                onStageUpdated();
                            }
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting stage:', error);
                            Alert.alert('Error', 'Failed to delete stage. Please try again.');
                        }
                    } 
                }
            ]
        );
    }

    function handleEdit() {
        navigation.navigate('AddStage', { stage, setUpcommingStages });
    }
    

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack}>
                    <Icon style={styles.backButton} name="chevron-back-circle" size={40} color="#FFB300" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Stage Details</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Favourite')}>
                    <Icon style={styles.bookmarkButton} name="bookmarks" size={30} color="#FFB300" />
                </TouchableOpacity>
            </View>

            {/* Stage Image */}
            <Image
                source={stage.image ? { uri: stage.image } : require('../../../assets/img/festive.jpg')}
                style={styles.eventImage}
            />

            {/* Stage Info */}
            <View style={styles.eventInfoContainer}>
                <Text style={styles.eventName}>{stage.name}</Text>
                <Text style={styles.eventDate}>Start: {stage.start_date}</Text>
                <Text style={styles.eventDate}>End: {stage.end_date}</Text>
            </View>

            {/* Description */}
            <View style={styles.aboutContainer}>
                <Text style={styles.aboutHeader}>About</Text>
                <Text style={styles.aboutDescription}>{stage.description}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleEdit} style={[styles.button, styles.editButton]}>
                    <Text style={styles.buttonText}>Edit Stage</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={[styles.button, styles.deleteButton]}>
                    <Text style={styles.buttonText}>Delete Stage</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#118B50', alignItems: 'center', paddingTop: 30 },
    header: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerText: { fontSize: 25, color: '#FFFFFF' },
    backButton: { marginRight: 10 },
    bookmarkButton: { marginTop: 5 },
    eventImage: { width: 350, height: 200, borderRadius: 20, marginVertical: 10 },
    eventInfoContainer: { marginTop: 10, alignItems: 'center' },
    eventName: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
    eventDate: { fontSize: 18, color: '#C7ADCE' },
    aboutContainer: { marginTop: 30, paddingHorizontal: 20 },
    aboutHeader: { fontSize: 23, color: '#FFFFFF', fontWeight: 'bold' },
    aboutDescription: { fontSize: 18, color: '#C7ADCE', textAlign: 'center' },
    buttonContainer: { flexDirection: 'row', marginTop: 30, gap: 15 },
    button: { padding: 10, borderRadius: 10, width: 140, alignItems: 'center' },
    editButton: { backgroundColor: '#F6BD0F' },
    deleteButton: { backgroundColor: '#FF3B30' },
    buttonText: { fontSize: 18, color: '#000', fontWeight: 'bold' },
});

export default Stagedetails;
