import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const ChatItem = ({ name, description, image }) => {
    return (
        <View style={styles.chatItem}>
            <Image source={image} style={styles.chatImage} />
            <View style={styles.chatContent}>
                <Text style={styles.chatName}>{name}</Text>
                <Text style={styles.chatDescription}>{description}</Text>
            </View>
        </View>
    );
}

const Chats = () => {
    return (
        <View style={styles.container}>
            <View style={styles.chatHeader}>
                <Text style={styles.chatHeaderText}>Chats</Text>
                <Icon style={styles.chatIcon} name="chat" size={35} color="#FFB300" />
            </View>
            <ScrollView contentContainerStyle={styles.chatContainer}>
                <ChatItem
                    name="John Doe"
                    description="Hey, how's it going?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />
                <ChatItem
                    name="Jane Smith"
                    description="Hello! Did you see the latest news?"
                    image={require('../../../assets/img/festive.jpg')} // Replace with actual image source
                />

                {/* Add more ChatItem components for each chat */}
            </ScrollView>

            <View style={{
                marginTop: 10,
                marginBottom: 10,

            }}>
            </View>
        </View>
    );
}

export default Chats;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
    },
    chatContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    chatHeader: {
        flexDirection: 'row',
        marginTop: 20,
        alignSelf: 'center'
    },
    chatHeaderText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginTop: 30,
        marginLeft: 10,
        marginBottom: 30,
    },
    chatIcon: {
        marginTop: 32,
        marginLeft: 5,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 2,
        borderBottomStartRadius: 30,
        borderBottomEndRadius: 30,
        borderBottomColor: '#FFFFFF',
    },
    chatImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    chatContent: {
        flex: 1,
    },
    chatName: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    chatDescription: {
        fontSize: 16,
        color: '#FFFFFF',
    },
});
