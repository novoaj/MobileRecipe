import { View, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";
import axios from "axios";
import RecipeCard from "../RecipeCard";
import { jwtDecode } from 'jwt-decode';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
        justifyContent: 'center', // Adjust as needed
        alignItems: 'center', // Adjust as needed
    },
});
interface Recipe {
    label: string;
    image: string;
    uri: string;
    id: string;
    calories: number;
    ingredientLines: string[];
    totalTime: number;
}

interface DecodedToken {
    exp: number;
}

export default function Home(){
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [curIndex, setCurIndex] = useState<number>(0);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    const url = process.env.REACT_APP_EDAMAM_API_URL as string;
    const backend = process.env.REACT_APP_API_URL as string;
    const app_id = process.env.REACT_APP_API_APP_ID as string;
    const app_key = process.env.REACT_APP_API_APP_KEY as string;
    const fields = ['label', 'image', 'uri', 'ingredientLines', 'calories', 'totalTime'];


    // setTokens on component render
    useEffect(() => {
        const setTokens = async () => {
            try {
                const storedAccessToken = await AsyncStorage.getItem('accessToken');
                const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
                
                // Use nullish coalescing to set default values if tokens are null
                setAccessToken(storedAccessToken ?? '');
                setRefreshToken(storedRefreshToken ?? '');
            } catch (error) {
                console.error('Failed to get token:', error);
            }
        }
        setTokens();
    }, []);
    // is access token expired
    const isTokenExpired = (token: string | null): boolean => {
        if (!token) return true;
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    };
    // refresh if necessary using refreshToken
    const refreshAccessToken = async () => {
        if (isTokenExpired(accessToken)) {
            try {
                const response = await axios.post('/auth/token/refresh/', {
                    refresh: refreshToken,
                });
                console.log("refreshing access token");
                console.log(response);
                const newAccessToken = response.data.access;
                await AsyncStorage.setItem('accessToken', newAccessToken);
                setAccessToken(newAccessToken);
                return newAccessToken;
            } catch (error) {
                console.error('Failed to refresh token:', error);
                return null;
            }
        }
        return accessToken;
    }
    // save to db
    const saveUserRecipe = async(uri: string) => {
        const token = await refreshAccessToken();
        if (!token) return;
        console.log(token);
        console.log("post request: ", `${backend}/auth/user-recipes/create/`);
        axios.post(`${backend}/auth/user-recipes/create/`, { 
            recipe: uri,
        }, {
            headers:{
                "Authorization": `Bearer ${token}`,
            },  
        })
            .then((response) => {
                console.log(response);
                console.log('Recipe saved successfully');
            })
            .catch((error) => {
                console.error('Failed to save recipe:', error);
            });
    }
    
    useEffect(() => {
        // get data from API on component load
        if (!url || !app_id || !app_key) {
            console.error("API URL, APP ID, or API KEY is not provided");
            return;
        }
        // construct query params
        const queryParams = new URLSearchParams({
            type: 'public',
            app_id: app_id,
            app_key: app_key,
            imageSize: "LARGE",
            time: "1+",
            random: "true",
        });
        fields.forEach(field => queryParams.append('field', field));

        axios.get(`${url}?${queryParams}`, {
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en'
            }
        })
        .then((response) => {
            const formattedRecipes = response.data.hits.map((hit: any) => ({
                label: hit.recipe.label,
                image: hit.recipe.image,
                uri: hit.recipe.uri,
                ingredientLines: hit.recipe.ingredientLines,
                calories: Math.floor(hit.recipe.calories),
                totalTime: hit.recipe.totalTime,
                id: hit._links.self.href // unique id we can store in our db if user saves this recipe
            }));
            setRecipes(formattedRecipes);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    // swiping logic
    const handleSwipeLeft = () => {
        console.log('Recipe denied');
        setCurIndex((prevIndex) => (prevIndex + 1) % recipes.length);
    };

    const handleSwipeRight = () => {
        console.log('Recipe added');
        // Save recipe logic here
        console.log("sending recipe to db... ", recipes[curIndex].label, recipes[curIndex].uri);
        saveUserRecipe(recipes[curIndex].uri);
        setCurIndex((prevIndex) => (prevIndex + 1) % recipes.length);
    };
    
    const { width } = Dimensions.get('window');
    // TODO: ensure no duplicates are shown to current user by storing the recipe id in our db
    return (
        <>
            <SafeAreaView style={styles.container}>
                <View>
                    {recipes.length > 0 && curIndex < recipes.length ? (
                        // Pass the current recipe to the RecipeView component
                        <RecipeCard 
                            key={curIndex}
                            recipe={recipes[curIndex]}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}/>
                    ) : (
                        <ActivityIndicator size="large" color="#00ff00" /> 
                    )}
                </View>
            </SafeAreaView>
        </>
        
    );
}