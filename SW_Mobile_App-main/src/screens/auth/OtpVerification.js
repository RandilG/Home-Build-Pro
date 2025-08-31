import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  // Focus on the first input when component mounts
  useEffect(() => {
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (value, index) => {
    // Validate input is a number
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current one is filled
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    try {
      const response = await axios.post('http://192.168.8.116:3000/api/verify-otp', {
        email,
        otp: otpCode
      });

      Alert.alert('Success', response.data.message);
      navigation.navigate('Login'); // Navigate to login screen on success
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert(
        'Verification Failed', 
        error.response?.data?.message || 'Invalid OTP. Please try again.'
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post('http://192.168.8.116:3000/api/resend-otp', {
        email
      });

      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (error) {
      console.error("Resend OTP Error:", error);
      Alert.alert(
        'Failed to Resend OTP', 
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>
          Email Verification
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.infoText}>
            Enter the code below to verify your email
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleResendOtp}>
            <View style={[styles.button, styles.resendButton]}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVerifyOtp}>
            <View style={[styles.button, { marginLeft: 20 }]}>
              <Text style={styles.buttonText}>Verify</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    marginBottom: 40,
    marginTop: 80,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    color: '#F6BD0F',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 350,
    marginHorizontal: 20,
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 50,
    width: 50,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 60,
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
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F6BD0F',
  },
  buttonText: {
    fontSize: 25,
    color: '#000000',
    textAlign: 'center'
  },
  resendButtonText: {
    fontSize: 20,
    color: '#F6BD0F',
    textAlign: 'center'
  }
});

export default OTPVerification;