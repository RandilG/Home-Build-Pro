import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

function Changepassfield(propschangepassfield) {
  const navigation = useNavigation(); // Use useNavigation hook to get navigation object

  return (
    <View>
      <View style={styles.inputField}>
        <TextInput
          placeholder='Enter Old Password'
          placeholderTextColor={'#000000'}
          style={{
            fontSize: 18,
            opacity: 0.5
          }}
        />
      </View>

      <View style={styles.inputField}>
        <TextInput
          placeholder='Enter New Password'
          placeholderTextColor={'#000000'}
          style={{
            fontSize: 18,
            opacity: 0.5
          }}
        />
      </View>

      <View style={styles.inputField}>
        <TextInput
          placeholder='Confirm Password'
          placeholderTextColor={'#000000'}
          style={{
            fontSize: 18,
            opacity: 0.5
          }}
        />
      </View>
      <BottomButtons3 navigation={navigation} />
    </View>
  )
}

function BottomButtons3({ navigation }) {
  function gotoEditAcc(){
    navigation.navigate('Editacc');
  }

  return (
    <View style={{
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 112,
    }}>

      <TouchableOpacity onPress={gotoEditAcc}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>
            Cancel
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={gotoEditAcc}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>
            Save
          </Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const Changepass = () => {
  const navigation = useNavigation(); // Use useNavigation hook to get navigation object

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>

        <Text style={{
          fontSize: 30,
          color: '#FFFFFF',
          marginBottom: 20,
          marginTop: 80,
        }}>
          Change Password
        </Text>
        <Image
          source={require('../../../assets/img/userprofile.png')}
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            borderWidth: 4,
            borderColor: '#F6BD0F',
            marginBottom: 30,
          }}
        />
        <Changepassfield />
      </View>

    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#401971',
    alignItems: 'center',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 35,
    width: 300,
    marginHorizontal: 45,
    justifyContent: 'center',
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 25,
    color: '#000000',
    textAlign: 'center',
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
});

export default Changepass;
