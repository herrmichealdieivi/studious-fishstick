import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForumScreen() {
    const router = useRouter();

    return ( <
        View style = { styles.container } >
        <
        View style = { styles.header } >
        <
        TouchableOpacity onPress = {
            () => router.push('/') }
        style = { styles.backButton } >
        <
        Text style = { styles.backText } > Back < /Text> <
        /TouchableOpacity> <
        Text style = { styles.headerTitle } > FORUM < /Text> <
        View style = {
            { width: 48 } }
        /> <
        /View>

        <
        View style = { styles.content } >
        <
        Text style = { styles.title } > The Forum < /Text> <
        Text style = { styles.subtitle } > Welcome to the central gathering place < /Text>

        <
        View style = { styles.card } >
        <
        Text style = { styles.cardTitle } > Recent Discussions < /Text> <
        Text style = { styles.cardContent } >
        This is where scholars gather to share knowledge, debate ideas, and advance understanding. <
        /Text> <
        /View> <
        /View> <
        /View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4D6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: 'rgba(237, 228, 214, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(23, 23, 23, 0.1)',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
        color: '#32704E',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10443E',
        letterSpacing: 3,
        fontFamily: 'serif',
    },
    content: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10443E',
        fontFamily: 'serif',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#32704E',
        fontFamily: 'serif',
        fontStyle: 'italic',
        marginBottom: 40,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#D9D1C2',
        padding: 24,
        borderRadius: 12,
        width: '100%',
        maxWidth: 350,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#171717',
        fontFamily: 'serif',
        marginBottom: 12,
    },
    cardContent: {
        fontSize: 16,
        color: '#171717',
        lineHeight: 24,
        textAlign: 'center',
    },
});