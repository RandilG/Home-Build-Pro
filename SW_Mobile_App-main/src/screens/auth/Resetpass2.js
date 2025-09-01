import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import axios from 'axios';

function Verificationcodefield({ otp, setOtp, onVerify }) {
    const [error, setError] = useState('');

    const handleOtpChange = (text) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');
        setOtp(numericText);
        if (error) {
            setError('');
        }
    };

    const handleVerify = () => {
        if (!otp.trim()) {
            setError('Verification code is required');
            return;
        }
        
        if (otp.length !== 6) {
            setError('Verification code must be 6 digits');
            return;
        }

        setError('');
        onVerify();
    };

    return (
        <View style={styles.inputContainer}>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Enter Verification Code'
                    placeholderTextColor={'#000000'}
                    style={styles.textInput}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="numeric"
                    maxLength={6}
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <VerifyButton onPress={handleVerify} />
        </View>
    );
}

function VerifyButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify</Text>
            </View>
        </TouchableOpacity>
    );
}

const Resetpass2 = () => {
    const navigation = useNavigation(); 
    const route = useRoute();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Get email from navigation params
    const email = route.params?.email || '';

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://192.168.8.116:3000/api/verify-otp', {
                email: email,
                otp: otp
            });

            Alert.alert(
                'Success', 
                'OTP verified successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Newpass', { email: email })
                    }
                ]
            );

        } catch (error) {
            console.error("OTP Verification Error:", error);
            
            if (error.response) {
                if (error.response.status === 400) {
                    Alert.alert('Error', 'Invalid or expired verification code');
                } else {
                    Alert.alert('Error', error.response.data.message || 'OTP verification failed');
                }
            } else if (error.request) {
                Alert.alert('Network Error', 'Could not connect to server. Please check your internet connection.');
            } else {
                Alert.alert('Error', 'An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Reset Password Verification
            </Text>

            <Image
                source={require('../../../assets/img/forgotpass2.png')}
                style={styles.image}
            />

            <Text style={styles.description}>
                In order to verify your identity, enter the verification code that was sent to {email}
            </Text>

            <Verificationcodefield 
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
            />
            
            {isLoading && (
                <Text style={styles.loadingText}>Verifying code...</Text>
            )}
        </View>
    )
}

export default Resetpass2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 5,
        fontWeight: 'bold',
        marginTop: 50,
    },
    image: {
        width: 240,
        height: 250,
        alignContent: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#BBBBC4',
        marginTop: 5,
        marginBottom: 20,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    inputContainer: {
        marginTop: 10,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 40,
        width: 300,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    textInput: {
        opacity: 0.6,
        fontSize: 18,
    },
    errorText: {
        color: '#FF4040',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 250,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 40,
        marginBottom: 80,
        alignSelf: 'center',
    },
    verifyButtonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
});