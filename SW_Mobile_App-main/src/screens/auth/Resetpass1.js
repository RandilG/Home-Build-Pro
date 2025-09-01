import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// Function for Email field component
function Emailfield({ email, setEmail, onSendVerification }) {
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) {
            setError(''); // Clear error when user types
        }
    };

    const handleSendVerification = () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        onSendVerification();
    };
    
    return (
        <View style={{ marginTop: 10 }}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter Your Email'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <SendVerificationButton onPress={handleSendVerification} />
        </View>
    );
}

function SendVerificationButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>
                    Send Verification Code
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const Resetpass1 = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendVerification = async () => {
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://192.168.8.116:3000/api/reset-password-verification', {
                email: email.trim()
            });

            Alert.alert(
                'Success', 
                'Verification code sent to your email!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Resetpass2', { email: email.trim() })
                    }
                ]
            );

        } catch (error) {
            console.error("Reset Password Error:", error);
            
            if (error.response) {
                // Server responded with an error
                if (error.response.status === 404) {
                    Alert.alert('Error', 'No account found with this email address');
                } else {
                    Alert.alert('Error', error.response.data.message || 'Failed to send verification code');
                }
            } else if (error.request) {
                // Network error
                Alert.alert('Network Error', 'Could not connect to server. Please check your internet connection.');
            } else {
                // Other error
                Alert.alert('Error', 'An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Reset Password Verification
            </Text>
            <Image
                source={require('../../../assets/img/resetpass.png')}
                style={styles.image}
            />
            <Text style={styles.description}>
                Enter your email address to receive a verification code
            </Text>
            <Emailfield 
                email={email} 
                setEmail={setEmail} 
                onSendVerification={handleSendVerification}
            />
            {isLoading && (
                <Text style={styles.loadingText}>Sending verification code...</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    image: {
        width: 250,
        height: 250,
        alignSelf: 'center',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 40,
        width: 300,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    input: {
        opacity: 0.6,
        fontSize: 18,
    },
    errorText: {
        color: '#FF4040',
        fontSize: 14,
        marginLeft: 25,
        marginTop: 5,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 300,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
        marginVertical: 50,
        alignSelf: 'center',
    },
    buttonText: {
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

export default Resetpass1;