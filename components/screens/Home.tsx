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
    thumbnail: apiImage;
    uri: string;
    id: string;
    calories: number;
    ingredientLines: string[];
    totalTime: number;
}
interface apiImage {
    height: number;
    url: string;
    width: number;
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
    const fields = ['label', 'image', 'uri', 'ingredientLines', 'calories', 'totalTime', 'images'];


    // setTokens on component render
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
                const response = await axios.post(`${backend}/token/refresh/`, {
                    refresh: refreshToken,
                });
                console.log(response.data);
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
    // extract unique id from recipeUri
    const getUniqueRecipeId = (recipeUrl: string) => {
        let uniqueRecipeId = recipeUrl.split('/').pop();
        let result = (uniqueRecipeId ?? '').split('?')[0];
        console.log(result);
        return result.split('_')[1];
    }
    // save to db
    const saveUserRecipe = async(recipe: Recipe) => {
        // console.log('Saving recipe:', recipe.image, recipe.thumbnail?.url);
        let imageThumbnail = recipe.thumbnail?.url || recipe.image;
        let recipe_id = getUniqueRecipeId(recipe.uri);

        console.log('Saving recipe:', recipe_id, recipe.label);
        const token = await refreshAccessToken();
        if (!token) return;
        axios.post(`${backend}/api/user-recipes/create/`, { 
            recipe: {
                id: recipe_id,
                label: recipe.label,
                thumbnail: imageThumbnail,
            }
        }, {
            headers:{
                "Authorization": `Bearer ${token}`,
            },  
        })
            .then((response) => {
                console.log(response.data);
                console.log('Recipe saved successfully');
            })
            .catch((error) => {
                console.error('Failed to save recipe:', error);
            });
    }
    
    useEffect(() => {
        const waitForTokens = async() => {
            await setTokens();
          }
        waitForTokens(); // set JWT tokens on component load
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
        queryParams.append('imageSize', 'THUMBNAIL');

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
                thumbnail: hit.recipe.images.THUMBNAIL,
                uri: hit.recipe.uri,
                ingredientLines: hit.recipe.ingredientLines,
                calories: Math.floor(hit.recipe.calories),
                totalTime: hit.recipe.totalTime,
                id: hit._links.self.href // unique id we can store in our db if user saves this recipe
            }));
            setRecipes(formattedRecipes);
            // console.log(recipes[0]);
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
        saveUserRecipe(recipes[curIndex]);
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