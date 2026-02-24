import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

export default function App() {
    return ( <
        >
        <
        Slot / >
        <
        StatusBar style = "auto" / >
        <
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});