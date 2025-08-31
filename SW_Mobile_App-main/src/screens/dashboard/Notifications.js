import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

const Notifications = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Notifications
                </Text>
                <Icon style={styles.icon} name="notifications" size={30} color="#FFB300" />
            </View>
        </View>
    )
}

export default Notifications

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        marginTop: 50,
    },
    headerText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginTop: 50,
        marginLeft: 10,
    },
    icon: {
        marginTop: 56,
        marginLeft: 10,
    },
})
