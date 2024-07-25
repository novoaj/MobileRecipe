import { LinearGradient } from 'expo-linear-gradient';
import React, {useState} from 'react';
import { Animated, StyleSheet, View, Text, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Recipe {
    label: string;
    image: string;
    uri: string;
    id: string;
}
interface RecipeCardProps {
    recipe: Recipe;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
}

var {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1, // Ensure the loader is on top
    },
    card: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: 30,
        overflow: 'hidden',
        margin: 10,
        elevation: 3,
        shadowColor: 'black',
        shadowRadius: 15,
        shadowOpacity: 0.2,
        height: height*.8,
        width: width*.9,
    },
    background: {
        height: height*.8,
        opacity: 0.2,
    },
    image: {
        width: '100%',
        height: height*.6,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 12,
        textAlign: 'center',
    },
    hiddenAction: {
        backgroundColor: 'transparent', // Hide any action button content
        flex: 1,
    },
});

export default function RecipeCard({recipe, onSwipeLeft, onSwipeRight}: RecipeCardProps){
    const [loading, setLoading] = useState(true);

    const handleImageLoad = () => {
        setLoading(false);
    };
    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const opacity = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        const translateX = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [-100, 0],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.hiddenAction, { opacity, transform: [{ translateX }] }]}>
                <></>
            </Animated.View>
        );
    };
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const opacity = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
    
        const translateX = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });
    
        return (
            <Animated.View style={[styles.hiddenAction, { opacity, transform: [{ translateX }] }]}>
                <></>
            </Animated.View>
        );
    };
    const handleSwipeableOpen = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            onSwipeLeft();
        } else if (direction === 'left') {
            onSwipeRight();
        }
    };
    return (
        <>
            <Swipeable 
                onSwipeableOpen={handleSwipeableOpen}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}>
                <View style={styles.card}>
                    {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />} 
                    <ImageBackground 
                        source={{uri: recipe.image}} 
                        style={styles.image}
                        onLoad={handleImageLoad}
                        onLoadEnd={() => setLoading(false)}>
                        <LinearGradient 
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} 
                            style={{height : '100%', width : '100%'}}>
                        </LinearGradient>
                        <Text style={styles.label}>{recipe.label}</Text>
                    </ImageBackground>
                </View>
            </Swipeable>
            
            
        </>
        
        );
};