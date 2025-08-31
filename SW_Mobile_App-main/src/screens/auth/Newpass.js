import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native'; 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

function Passwordfield() {
    const navigation = useNavigation(); 

    return (
        <View style={{ marginTop: 20 }}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 20 }]}>
                <TextInput
                    placeholder='Confirm New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                />
            </View>
            <CreateButton navigation={navigation} />
        </View>
    );
}

function CreateButton({ navigation }) {
    function gotoCreateButton() {
        navigation.navigate('Updatedpass');
    }

    return (
        // TouchableOpacity containing the create button
        <TouchableOpacity onPress={gotoCreateButton}>
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
                <Passwordfield navigation={navigation} />
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
});

export default Newpass;
