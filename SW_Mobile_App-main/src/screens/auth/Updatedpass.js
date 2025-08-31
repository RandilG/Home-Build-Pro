import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native'; 

function LoginButton() {
    const navigation = useNavigation(); 

    function gotoLogin() {
        navigation.navigate('Login');
    }

    return (
        // TouchableOpacity containing the login button
        <TouchableOpacity onPress={gotoLogin}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>
                    Login
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const Updatedpass = () => {
    const navigation = useNavigation(); 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Password Changed!
            </Text>
            <Image
                source={require('../../../assets/img/updatedpass.png')}
                style={styles.image}
            />
            <View>
                <Text style={styles.description}>
                    Your password has been updated successfully
                </Text>
            </View>
            <LoginButton navigation={navigation} />
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
    button: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 250,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    image: {
        width: 250,
        height: 260,
        alignContent: 'center',
    },
    description: {
        fontSize: 16,
        color: '#BBBBC4',
        marginTop: 30,
        marginBottom: 10,
        textAlign: 'center',
        marginHorizontal: 40,
    },
});

export default Updatedpass;
