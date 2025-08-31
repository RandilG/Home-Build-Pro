import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';

function Createprofilefield() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'homeowner',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    const validate = () => {
        let isValid = true;
        const newErrors = {
            name: '',
            email: '',
            role: '',
            password: '',
            confirmPassword: ''
        };

        // Name validation
        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        } else if (form.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
            isValid = false;
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        // Role validation
        if (!form.role) {
            newErrors.role = 'Role is required';
            isValid = false;
        } else if (!['homeowner', 'construction_manager', 'architect'].includes(form.role)) {
            newErrors.role = 'Invalid role selected';
            isValid = false;
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number and special character';
            isValid = false;
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        // Clear error when user types
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSignup = async () => {
        if (!validate()) {
            return;
        }

        try {
            const response = await axios.post('http://192.168.8.116:3000/api/signup', {
                name: form.name,
                email: form.email,
                role: form.role,
                password: form.password
            });

            Alert.alert('Success', response.data.message || 'Account created successfully! Please verify your email');
            navigation.navigate('OtpVerification', { email: form.email });
        } catch (error) {
            console.error("Signup Error:", error);
            if (error.response) {
                // The server responded with an error
                Alert.alert('Signup Failed', error.response.data.message || 'Registration failed');
            } else if (error.request) {
                // The request was made but no response was received
                Alert.alert('Network Error', 'Could not connect to server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request
                Alert.alert('Error', 'An unexpected error occurred');
            }
        }
    };

    return (
        <View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter Full Name'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('name', text)}
                    value={form.name}
                />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.name ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter Email Address'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('email', text)}
                    value={form.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.email ? 10 : 30 }]}>
                <View style={styles.pickerContainer}>
                    <TouchableOpacity 
                        style={[styles.roleButton, form.role === 'homeowner' && styles.roleButtonActive]} 
                        onPress={() => handleInputChange('role', 'homeowner')}
                    >
                        <Text style={[styles.roleText, form.role === 'homeowner' && styles.roleTextActive]}>Home Owner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleButton, form.role === 'construction_manager' && styles.roleButtonActive]}
                        onPress={() => handleInputChange('role', 'construction_manager')}
                    >
                        <Text style={[styles.roleText, form.role === 'construction_manager' && styles.roleTextActive]}>Construction Manager</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleButton, form.role === 'architect' && styles.roleButtonActive]}
                        onPress={() => handleInputChange('role', 'architect')}
                    >
                        <Text style={[styles.roleText, form.role === 'architect' && styles.roleTextActive]}>Architect</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.contact_number ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('password', text)}
                    value={form.password}
                    autoCapitalize="none"
                />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.password ? 10 : 30 }]}>
                <TextInput
                    placeholder='Confirm Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    value={form.confirmPassword}
                    autoCapitalize="none"
                />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            <BottomButtons handleSignup={handleSignup} />
        </View>
    );
}

function BottomButtons({ handleSignup }) {
    const navigation = useNavigation();

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignup}>
                <View style={[styles.button, { marginLeft: 20 }]}>
                    <Text style={styles.buttonText}>Create</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const Signup = () => {
    return (
        <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.title}>
                    User Profile
                </Text>
                <Image
                    source={require('../../../assets/img/userprofile.png')}
                    style={styles.profileImage}
                />
                <Createprofilefield />
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        height: 887,
    },
    title: {
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 80,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F6BD0F',
        marginBottom: 30,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        width: 350,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    pickerContainer: {
        width: '100%',
    },
    roleButton: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 45,
        justifyContent: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#F6BD0F',
        borderColor: '#F6BD0F',
    },
    roleText: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
    },
    roleTextActive: {
        color: '#000000',
    },
    input: {
        fontSize: 18,
        opacity: 0.5
    },
    errorText: {
        color: '#FF4040',
        fontSize: 14,
        marginLeft: 25,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 40,
        marginBottom: 56,
    },
    button: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 150,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 10,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 25,
        color: '#000000',
        textAlign: 'center'
    }
});

export default Signup;