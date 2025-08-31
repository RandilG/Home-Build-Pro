import React, { useState } from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// Validation using Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,4}$/, 
      'Invalid email'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

const Login = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values) => {
    setIsLoading(true);
    
    
    try {
      console.log('Login Attempt:', values);
      // Replace with your actual API endpoint
      const response = await axios.post('http://192.168.8.116:3000/api/signin', {
        email: values.username,
        password: values.password
      });
      console.log('Login Response:', response.data);
      
      setIsLoading(false);
      
      // Safely store tokens and user information with null checks
      const { accessToken, refreshToken, username, email, user_id } = response.data;
      
      // Only store values that are not null/undefined
      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
      }
      
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      
      if (username) {
        await AsyncStorage.setItem('username', username);
      }
      
      if (email) {
        await AsyncStorage.setItem('email', email);
      }
      
      if (user_id !== null && user_id !== undefined) {
        await AsyncStorage.setItem('user_id', user_id.toString());
      }
      
      // Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
      
    } catch (error) {
      setIsLoading(false);
      
      // Handle different types of errors
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        if (error.response.status === 401) {
          Alert.alert('Login Failed', 'Invalid email or password');
        } else {
          Alert.alert('Login Failed', error.response.data.message || 'Something went wrong');
        }
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        Alert.alert('Error', 'An unexpected error occurred');
      }
      
      console.error('Login Error:', error);
    }
  };

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="never">
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.logo}>{'Home\nBuild'}</Text>
        <Text style={styles.logo2}>{'Pro'}</Text>

        {/* Formik form for handling form inputs and validation */}
        <Formik
          initialValues={{ username: '', password: '' }} // Initial form values
          validationSchema={LoginSchema} // Validation for form inputs
          onSubmit={handleLogin} 
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#000000"
                style={styles.input}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}

              <TextInput
                placeholder="Password"
                placeholderTextColor="#000000"
                secureTextEntry={true}
                style={styles.input}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                autoCapitalize="none"
              />
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <TouchableOpacity 
                onPress={handleSubmit} 
                style={styles.button}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Resetpass1')}>
                <Text style={styles.forgotPassword}>Forget Password</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.noAccount}>Don't have an account?</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <StatusBar style="auto" />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    alignItems: 'center',
    justifyContent: 'center',
    height: 887,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
    marginBottom: 80,
    marginTop: 100,
  },
  logo: {
    fontSize: 60,
    color: '#F6BD0F',
    fontWeight: 'bold',
    lineHeight: 59,
  },
  logo2: {
    fontSize: 30,
    color: '#F6BD0F',
    fontWeight: 'bold',
  },
  form: {
    width: '80%',
    marginTop: 50,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 40,
    marginVertical: 10,
    paddingLeft: 20,
    fontSize: 18,
    color: '#000000',
  },
  button: {
    backgroundColor: '#F6BD0F',
    borderRadius: 20,
    height: 40,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 40,
  },
  buttonText: {
    fontSize: 25,
    color: '#000000',
  },
  forgotPassword: {
    fontSize: 18,
    color: '#C69CD1',
    marginTop: 10,
    textAlign: 'center',
  },
  noAccount: {
    fontSize: 18,
    color: '#C69CD1',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 113,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
});

export default Login;