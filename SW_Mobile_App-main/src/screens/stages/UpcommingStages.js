import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/Fontisto'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';

const UpcommingStages = () => {
    const navigation = useNavigation();
    const [upcommingStages, setUpcommingStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const API_URL = 'http://192.168.8.116:3000/api'; // Update with your server IP
    
    // Fetch stages when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchStages();
        }, [])
    );
    
    const fetchStages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/stages`);
            setUpcommingStages(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stages:', err);
            setError('Unable to load stages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    function gotoSelectTickets(stage) {
        navigation.navigate('Stagedetails', { stage });
    }

    function gotoAddStage() {
        navigation.navigate('AddStage', { onStageAdded: fetchStages });
    }
    
    function handleStagePress(stage) {
        navigation.navigate('Stagedetails', { stage, onStageUpdated: fetchStages });
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Upcoming Stages</Text>
                <Icon style={styles.icon} name="fire" size={30} color="#FFB300" />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FFB300" style={styles.loader} />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchStages} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    {upcommingStages.length === 0 ? (
                        <View style={styles.noStagesContainer}>
                            <Text style={styles.noStagesText}>No upcoming stages found</Text>
                        </View>
                    ) : (
                        upcommingStages.map((stage, index) => (
                            <TouchableOpacity key={index} onPress={() => handleStagePress(stage)}>
                                <View style={styles.containerbox}>
                                    <Image
                                        source={stage.image_path 
                                            ? { uri: `${API_URL}${stage.image_path}` } 
                                            : require('../../../assets/img/festive.jpg')}
                                        style={styles.image}
                                    />
                                    <View style={styles.stageDetails}>
                                        <Text style={styles.stageDetailText1}>{stage.name}</Text>
                                        <Text style={styles.stageDetailText2}>{stage.start_date}</Text>
                                        <View style={styles.moreContainer}>
                                            <Text style={styles.stageDetailText3}>More</Text>
                                            <Icon name="angle-right" size={15} color="#000000" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </KeyboardAwareScrollView>
            )}

            {/* Add Stage Button */}
            <TouchableOpacity style={styles.addButton} onPress={gotoAddStage}>
                <Text style={styles.addButtonText}>+ Add Stage</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#118B50', alignItems: 'center' },
    headerContainer: { flexDirection: 'row' },
    headerText: { fontSize: 30, color: '#FFFFFF', marginLeft: 10, marginTop: 50, marginBottom: 10 },
    icon: { marginTop: 53, marginLeft: 10 },
    containerbox: { backgroundColor: '#E3F0AF', flexDirection: 'row', width: 340, height: 180, borderRadius: 20, marginTop: 20 },
    image: { width: 150, height: 160, borderRadius: 20, marginVertical: 10, marginHorizontal: 10 },
    stageDetails: { marginLeft: 10, marginTop: 20 },
    stageDetailText1: { fontSize: 20, color: '#000000', fontWeight: 'bold' },
    stageDetailText2: { fontSize: 15, color: '#000000', marginTop: 20 },
    stageDetailText3: { fontSize: 15, color: '#000000', fontWeight: 'bold', marginTop: 20 },
    moreContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    addButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10, marginVertical: 20 },
    addButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    loader: { flex: 1, justifyContent: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#FFB300', fontSize: 16, marginBottom: 20 },
    retryButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10 },
    retryButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
    noStagesContainer: { width: 340, padding: 20, backgroundColor: '#E3F0AF', borderRadius: 20, marginTop: 20, alignItems: 'center' },
    noStagesText: { fontSize: 16, color: '#555' }
});

export default UpcommingStages;