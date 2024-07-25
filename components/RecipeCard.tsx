import { LinearGradient } from 'expo-linear-gradient';
import React, {useState} from 'react';
import { Animated, StyleSheet, View, Text, ImageBackground, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Recipe {
    label: string;
    image: string;
    uri: string;
    id: string;
    calories: number;
    ingredientLines: string[];
    totalTime: number;
}
interface RecipeCardProps {
    recipe: Recipe;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
}

var {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
        height: height * .8,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        color: 'gray',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1, // Ensure the loader is on top
    },
    card: {
        display: 'flex',
        backgroundColor: '#333333',
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
        color: '#f2f2f2',
        textAlign: 'center',
    },
    hiddenAction: {
        backgroundColor: 'transparent', // Hide any action button content
        flex: 1,
    },
    cardBottom: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#333333',
        padding: 12,
    },
    cardBottomTop: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardBottomText: {
        color: '#f2f2f2',
        textAlign: 'center',
        padding: 12,
    },
    ingredientsList: {
        alignItems: 'flex-start',
        textAlign: 'left',
        padding: 5,
        color: '#f2f2f2',
        marginBottom: 5,
    },
    ingredientTitle: {
        textAlign: 'left',
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
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
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} 
                            style={{height : '100%', width : '100%'}}>
                        </LinearGradient>
                        
                    </ImageBackground>
                    <ScrollView style={styles.cardBottom}>
                        <Text style={styles.label}>{recipe.label}</Text>
                        <View style={styles.cardBottomTop}>
                            <Text style={styles.cardBottomText}>{recipe.calories} Calories</Text>
                            {recipe.totalTime > 0 ? 
                                <Text style={styles.cardBottomText}>Cook Time: {recipe.totalTime} minutes</Text>:
                                <></>}
                        </View>
                            
                            <Text style={[styles.cardBottomText, styles.ingredientTitle]}>Ingredients:</Text>
                            {recipe.ingredientLines.map((ingredient, index) => (
                                <Text style={styles.ingredientsList} key={index}>{ingredient}</Text>
                            ))}
                        </ScrollView>
                </View>
            </Swipeable>
        </>
        );
};