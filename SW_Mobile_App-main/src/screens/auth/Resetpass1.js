import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

// Function for Email field component
function Emailfield() {
    const navigation = useNavigation();
    
    return (
        // Email input field
        <View style={{ marginTop: 10 }}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter Your Email'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                />
            </View>
            <SendVerificationButton />
        </View>
    );
}

function SendVerificationButton() {
    const navigation = useNavigation();

    function gotoResetpass2(){
        navigation.navigate('Resetpass2')
    }

    return (
        // TouchableOpacity containing the button to send verification code
        <TouchableOpacity onPress={gotoResetpass2}>
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
                Enter your email starting with john******.com to continue
            </Text>
            <Emailfield />
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
});

export default Resetpass1;
