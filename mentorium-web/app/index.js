import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
    return ( <
        View style = { styles.container } >
        <
        View style = { styles.header } >
        <
        Text style = { styles.title } > MENTORIUM < /Text> <
        Text style = { styles.subtitle } > House of Learning < /Text> <
        /View>

        <
        View style = { styles.menuContainer } >
        <
        Link href = "/forum"
        asChild >
        <
        TouchableOpacity style = { styles.menuButton } >
        <
        Text style = { styles.buttonText } > FORUM < /Text> <
        /TouchableOpacity> <
        /Link>

        <
        Link href = "/houses"
        asChild >
        <
        TouchableOpacity style = {
            [styles.menuButton, styles.activeButton] } >
        <
        Text style = {
            [styles.buttonText, styles.activeButtonText] } > HOUSES < /Text> <
        /TouchableOpacity> <
        /Link>

        <
        Link href = "/trials"
        asChild >
        <
        TouchableOpacity style = { styles.menuButton } >
        <
        Text style = { styles.buttonText } > TRIALS < /Text> <
        /TouchableOpacity> <
        /Link>

        <
        Link href = "/seal"
        asChild >
        <
        TouchableOpacity style = { styles.menuButton } >
        <
        Text style = { styles.buttonText } > SEAL < /Text> <
        /TouchableOpacity> <
        /Link> <
        /View>

        <
        View style = { styles.footer } >
        <
        Text style = { styles.footerText } > Select a path of knowledge < /Text> <
        /View> <
        /View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4D6',
        padding: 20,
    },
    header: {
        marginTop: 80,
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10443E',
        fontFamily: 'serif',
        letterSpacing: 3,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#32704E',
        fontFamily: 'serif',
        fontStyle: 'italic',
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    menuButton: {
        backgroundColor: '#D9D1C2',
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#CFC7B8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeButton: {
        backgroundColor: '#10443E',
        borderColor: '#32704E',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#171717',
        textAlign: 'center',
        fontFamily: 'serif',
        letterSpacing: 2,
    },
    activeButtonText: {
        color: '#EDE4D6',
    },
    footer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#171717',
        opacity: 0.7,
        fontStyle: 'italic',
    },
});