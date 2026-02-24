import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Layout() {
    return ( <
        Stack screenOptions = {
            {
                headerShown: false,
            }
        } >
        <
        Stack.Screen name = "index" / >
        <
        Stack.Screen name = "houses" / >
        <
        Stack.Screen name = "forum" / >
        <
        Stack.Screen name = "trials" / >
        <
        Stack.Screen name = "seal" / >
        <
        /Stack>
    );
}