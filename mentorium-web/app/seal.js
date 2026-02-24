import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SealScreen() {
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
        Text style = { styles.headerTitle } > SEAL < /Text> <
        View style = {
            { width: 48 } }
        /> <
        /View>

        <
        View style = { styles.content } >
        <
        View style = { styles.profileHeader } >
        <
        View style = { styles.avatar } >
        <
        Text style = { styles.avatarText } > M < /Text> <
        /View> <
        Text style = { styles.userName } > Michael < /Text> <
        Text style = { styles.userHouse } > House of Euler < /Text> <
        /View>

        <
        View style = { styles.statsContainer } >
        <
        View style = { styles.statCard } >
        <
        Text style = { styles.statNumber } > 11 < /Text> <
        Text style = { styles.statLabel } > Doors Opened < /Text> <
        /View> <
        View style = { styles.statCard } >
        <
        Text style = { styles.statNumber } > 84 % < /Text> <
        Text style = { styles.statLabel } > Trial Performance < /Text> <
        /View> <
        View style = { styles.statCard } >
        <
        Text style = { styles.statNumber } > 73 % < /Text> <
        Text style = { styles.statLabel } > Forum Activity < /Text> <
        /View> <
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
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#171717',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#171717',
        fontFamily: 'serif',
        marginBottom: 8,
    },
    userHouse: {
        fontSize: 16,
        color: '#32704E',
        fontFamily: 'serif',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#D9D1C2',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#171717',
        fontFamily: 'serif',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#171717',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});