import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';

function Passwordfield({ passwords, setPasswords, onUpdatePassword }) {
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: ''
    });

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
            return 'Password must include uppercase, lowercase, number and special character';
        }
        return '';
    };

    const handlePasswordChange = (field, value) => {
        setPasswords({ ...passwords, [field]: value });
        
        // Clear errors when user types
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleCreate = () => {
        const newErrors = {
            password: '',
            confirmPassword: ''
        };
        let isValid = true;

        // Validate password
        if (!passwords.password) {
            newErrors.password = 'New password is required';
            isValid = false;
        } else {
            const passwordError = validatePassword(passwords.password);
            if (passwordError) {
                newErrors.password = passwordError;
                isValid = false;
            }
        }

        // Validate confirm password
        if (!passwords.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (passwords.password !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            onUpdatePassword();
        }
    };

    return (
        <View style={{ marginTop: 20 }}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    value={passwords.password}
                    onChangeText={(text) => handlePasswordChange('password', text)}
                    secureTextEntry
                    autoCapitalize="none"
                />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.password ? 10 : 20 }]}>
                <TextInput
                    placeholder='Confirm New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    value={passwords.confirmPassword}
                    onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                    secureTextEntry
                    autoCapitalize="none"
                />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            <CreateButton onPress={handleCreate} />
        </View>
    );
}

function CreateButton({ onPress }) {
    return (
        // TouchableOpacity containing the create button
        <TouchableOpacity onPress={onPress}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>
                    Create
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const Newpass = () => {
    const navigation = useNavigation(); 
    const route = useRoute();
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Get email from navigation params
    const email = route.params?.email || '';

    const handleUpdatePassword = async () => {
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://192.168.8.116:3000/api/reset-password', {
                email: email,
                newPassword: passwords.password
            });

            Alert.alert(
                'Success', 
                'Password updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Updatedpass')
                    }
                ]
            );

        } catch (error) {
            console.error("Update Password Error:", error);
            
            if (error.response) {
                Alert.alert('Error', error.response.data.message || 'Failed to update password');
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
        // ScrollView to handle keyboard and avoid tap events
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'never'}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    Reset Password
                </Text>
                <Image
                    source={require('../../../assets/img/resetpass.png')}
                    style={styles.image}
                />
                <View>
                    <Text style={styles.subTitle}>
                        Create New Password
                    </Text>
                    <Text style={styles.description}>
                        Your New password must be different from the previous password
                    </Text>
                </View>
                <Passwordfield 
                    passwords={passwords}
                    setPasswords={setPasswords}
                    onUpdatePassword={handleUpdatePassword}
                />
                {isLoading && (
                    <Text style={styles.loadingText}>Updating password...</Text>
                )}
            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        justifyContent: 'center',
        height: 887,
    },
    title: {
        fontSize: 22,
        color: '#FFFFFF',
        marginTop: 60,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    image: {
        width: 240,
        height: 250,
        alignSelf: 'center',
    },
    subTitle: {
        fontSize: 22,
        color: '#C7ADCE',
        marginTop: 5,
        marginBottom: 20,
        textAlign: 'center',
        marginHorizontal: 20,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: '#BBBBC4',
        marginTop: 5,
        marginBottom: 20,
        textAlign: 'center',
        marginHorizontal: 20,
        width: 320,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 40,
        width: 300,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
        marginTop: 20,
    },
    input: {
        fontSize: 18,
        opacity: 0.6,
    },
    errorText: {
        color: '#FF4040',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 250,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 40,
        marginBottom: 116,
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

export default Newpass;