import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    PanGestureHandler,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PORTALS = [{
        id: 1,
        name: 'EULER',
        title: 'House of Mathematical Foundations',
        description: 'Enter the realm of pure reasoning where eternal truths await discovery',
        emblem: '.circle',
        color: '#10443E'
    },
    {
        id: 2,
        name: 'MENDEL',
        title: 'House of Natural Observation',
        description: 'Study the living world through patient observation and careful experimentation',
        emblem: 'dna',
        color: '#32704E'
    },
    {
        id: 3,
        name: 'CURIE',
        title: 'House of Fundamental Forces',
        description: 'Investigate the invisible forces that govern matter and energy',
        emblem: 'atom',
        color: '#5EAB70'
    },
    {
        id: 4,
        name: 'AUSTEN',
        title: 'House of Human Understanding',
        description: 'Explore the depths of human experience through literature and reflection',
        emblem: 'book',
        color: '#171717'
    }
];

export default function HousesScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const isAnimating = useRef(false);

    const goBack = () => {
        router.push('/');
    };

    const goToPortal = (index) => {
        if (isAnimating.current || index < 0 || index >= PORTALS.length) return;

        isAnimating.current = true;
        const newPosition = -index * SCREEN_WIDTH;

        Animated.spring(translateX, {
            toValue: newPosition,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
        }).start(() => {
            setCurrentIndex(index);
            isAnimating.current = false;
        });
    };

    const nextPortal = () => {
        if (currentIndex < PORTALS.length - 1) {
            goToPortal(currentIndex + 1);
        }
    };

    const previousPortal = () => {
        if (currentIndex > 0) {
            goToPortal(currentIndex - 1);
        }
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            // Start of gesture
        })
        .onUpdate((event) => {
            if (!isAnimating.current) {
                const newX = event.translationX - (currentIndex * SCREEN_WIDTH);
                translateX.setValue(newX);
            }
        })
        .onEnd((event) => {
            if (!isAnimating.current) {
                const velocity = Math.abs(event.velocityX);
                const translation = event.translationX;

                if (velocity > 500 || Math.abs(translation) > SCREEN_WIDTH * 0.3) {
                    if (translation < 0 && currentIndex < PORTALS.length - 1) {
                        nextPortal();
                    } else if (translation > 0 && currentIndex > 0) {
                        previousPortal();
                    } else {
                        // Snap back to current position
                        Animated.spring(translateX, {
                            toValue: -currentIndex * SCREEN_WIDTH,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 12,
                        }).start();
                    }
                } else {
                    // Snap back to current position
                    Animated.spring(translateX, {
                        toValue: -currentIndex * SCREEN_WIDTH,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 12,
                    }).start();
                }
            }
        });

    const renderPortal = (portal, index) => {
        const scale = translateX.interpolate({
            inputRange: [-(index + 1) * SCREEN_WIDTH, -index * SCREEN_WIDTH, -(index - 1) * SCREEN_WIDTH],
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp'
        });

        const opacity = translateX.interpolate({
            inputRange: [-(index + 1) * SCREEN_WIDTH, -index * SCREEN_WIDTH, -(index - 1) * SCREEN_WIDTH],
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp'
        });

        return ( <
            Animated.View key = { portal.id }
            style = {
                [
                    styles.portalContainer,
                    {
                        transform: [{ translateX: translateX }],
                        zIndex: index === currentIndex ? 1 : 0,
                    }
                ]
            } >
            <
            Animated.View style = {
                [styles.portalFrame, { transform: [{ scale }], opacity }] } > { /* Portal Structure */ } <
            View style = { styles.entablature } >
            <
            Text style = { styles.inscription } > { portal.name } < /Text> <
            /View>

            <
            View style = { styles.pilasterLeft }
            /> <
            View style = { styles.capitalLeft }
            />

            <
            View style = { styles.pilasterRight }
            /> <
            View style = { styles.capitalRight }
            />

            <
            View style = {
                [styles.threshold, { backgroundColor: portal.color }] }
            />

            { /* Ground shadow */ } <
            View style = { styles.shadowContact }
            /> <
            /Animated.View>

            <
            View style = { styles.portalMetadata } >
            <
            Text style = { styles.portalTitle } > { portal.title } < /Text> <
            Text style = { styles.portalDescription } > { portal.description } < /Text> <
            /View> <
            /Animated.View>
        );
    };

    return ( <
        View style = { styles.container } >
        <
        StatusBar barStyle = "dark-content"
        backgroundColor = "#EDE4D6" / >

        { /* Header */ } <
        View style = { styles.header } >
        <
        TouchableOpacity onPress = { goBack }
        style = { styles.backButton } >
        <
        Text style = { styles.backText } > Back < /Text> <
        /TouchableOpacity> <
        Text style = { styles.headerTitle } > MENTORIUM < /Text> <
        View style = {
            { width: 48 } }
        /> <
        /View>

        { /* Ground */ } <
        View style = { styles.ground }
        />

        { /* Podium Steps */ } <
        View style = { styles.podium } >
        <
        View style = { styles.step }
        /> <
        View style = { styles.step }
        /> <
        View style = { styles.step }
        /> <
        /View>

        { /* Portal Track */ } <
        GestureDetector gesture = { panGesture } >
        <
        View style = { styles.viewport } > { PORTALS.map((portal, index) => renderPortal(portal, index)) } <
        /View> <
        /GestureDetector>

        { /* Navigation Arrows */ } {
            currentIndex > 0 && ( <
                TouchableOpacity style = {
                    [styles.navArrow, styles.navArrowLeft] }
                onPress = { previousPortal } >
                <
                Text style = { styles.arrowText } > ‹ < /Text> <
                /TouchableOpacity>
            )
        }

        {
            currentIndex < PORTALS.length - 1 && ( <
                TouchableOpacity style = {
                    [styles.navArrow, styles.navArrowRight] }
                onPress = { nextPortal } >
                <
                Text style = { styles.arrowText } > › < /Text> <
                /TouchableOpacity>
            )
        }

        { /* Swipe Hint */ } <
        View style = { styles.swipeHint } >
        <
        Text style = { styles.swipeHintText } > ←SWIPE OR USE ARROWS TO NAVIGATE→ < /Text> <
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: 'rgba(237, 228, 214, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(23, 23, 23, 0.1)',
        zIndex: 100,
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
    viewport: {
        flex: 1,
        flexDirection: 'row',
    },
    portalContainer: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    portalFrame: {
        width: SCREEN_WIDTH * 0.8,
        aspectRatio: 3 / 5,
        position: 'relative',
    },
    entablature: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 65,
        backgroundColor: '#D4CEC0',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inscription: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a2520',
        letterSpacing: 3,
        fontFamily: 'serif',
    },
    pilasterLeft: {
        position: 'absolute',
        left: 0,
        top: 65,
        bottom: 0,
        width: 45,
        backgroundColor: '#CFC7B8',
    },
    pilasterRight: {
        position: 'absolute',
        right: 0,
        top: 65,
        bottom: 0,
        width: 45,
        backgroundColor: '#CFC7B8',
    },
    capitalLeft: {
        position: 'absolute',
        left: -5,
        top: 40,
        width: 55,
        height: 25,
        backgroundColor: '#D9D1C2',
    },
    capitalRight: {
        position: 'absolute',
        right: -5,
        top: 40,
        width: 55,
        height: 25,
        backgroundColor: '#D9D1C2',
    },
    threshold: {
        position: 'absolute',
        top: 65,
        left: 45,
        right: 45,
        bottom: 0,
        backgroundColor: '#0a1a18',
    },
    shadowContact: {
        position: 'absolute',
        bottom: -10,
        left: '10%',
        right: '10%',
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 15,
    },
    portalMetadata: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    portalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#10443E',
        fontFamily: 'serif',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    portalDescription: {
        fontSize: 16,
        color: 'rgba(23, 23, 23, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
    },
    navArrow: {
        position: 'absolute',
        top: '50%',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(237, 228, 214, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(23, 23, 23, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    navArrowLeft: {
        left: 32,
    },
    navArrowRight: {
        right: 32,
    },
    arrowText: {
        fontSize: 24,
        color: '#171717',
        fontWeight: 'bold',
    },
    ground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: '#CFC7B8',
    },
    podium: {
        position: 'absolute',
        bottom: 0,
        left: '7.5%',
        right: '7.5%',
        zIndex: 5,
    },
    step: {
        height: 20,
        backgroundColor: '#D4CEC0',
        marginBottom: 2,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.4)',
    },
    swipeHint: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    swipeHintText: {
        fontSize: 12,
        color: 'rgba(23, 23, 23, 0.35)',
        letterSpacing: 1,
    },
});