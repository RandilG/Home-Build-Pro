import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

function Editprofilefield() {
    const navigation = useNavigation(); // Use useNavigation hook to get navigation object

    return (
        <View>
            <View>
                <Text style={styles.labelText}>
                    First Name
                </Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='XXXXXXXXXX'
                    placeholderTextColor={'#000000'}
                    style={styles.inputText}
                />
            </View>

            {/* Other input fields */}

            <Changepassbutton />
            <BottomButtons2 />
            
        </View>
    );
}

function Changepassbutton() {
    const navigation = useNavigation(); // Use useNavigation hook to get navigation object

    function gotoChangepass() {
        navigation.navigate('Changepass');
    }

    return (
        <TouchableOpacity onPress={gotoChangepass}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>
                    Change Password
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function BottomButtons2() {
    const navigation = useNavigation(); // Use useNavigation hook to get navigation object

    function gotoDashboard() {
        navigation.navigate('Dashboard');
    }

    function gotoProfile() {
        navigation.navigate('Profile');
    }

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={gotoProfile}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>
                        Cancel
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={gotoDashboard}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>
                        Save
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const Editacc = () => {
    const navigation = useNavigation(); // Use useNavigation hook to get navigation object

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
                <Text style={styles.labelText}>
                    --Name--
                </Text>
                <Editprofilefield />
            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    labelText: {
        fontSize: 18,
        color: '#C7ADCE',
        marginBottom: 5,
        marginLeft: 30,
        marginTop: 10,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        height: 35,
        width: 350,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
        marginBottom: 5,
    },
    inputText: {
        fontSize: 18,
        opacity: 0.5,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
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
        marginBottom: 4,
    },
    buttonText: {
        fontSize: 25,
        color: '#000000',
        textAlign: 'center',
    },
    title: {
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 44,
        marginTop: 30,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F6BD0F',
        marginBottom: 10,
    },
});

export default Editacc;
