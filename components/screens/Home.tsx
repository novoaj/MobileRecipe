import { View, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from "react-native";
import * as SecureStorage from 'expo-secure-store';
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from 'react-redux';
import axios from "axios";
import Toast from "react-native-root-toast";
import RecipeCard from "../RecipeCard";
import { jwtDecode } from 'jwt-decode';
import {COLORS} from '../../constants/Colors';


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
    const [loading, setLoading] = React.useState(true);
    const dispatch = useDispatch();

    const url = process.env.REACT_APP_EDAMAM_API_URL as string;
    const backend = process.env.REACT_APP_API_URL as string;
    const app_id = process.env.REACT_APP_API_APP_ID as string;
    const app_key = process.env.REACT_APP_API_APP_KEY as string;
    const fields = ['label', 'image', 'uri', 'ingredientLines', 'calories', 'totalTime', 'images'];


     // is access token expired
    const isTokenExpired = (token: string | null): boolean => {
        if (!token) return true;
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    };
    const refreshTokens = async(refresh : string) => {
        if (!refresh) {
            console.error("Refresh token is missing");
            return;
        }
        axios.post(`${backend}/token/refresh/`, {
            refresh: refresh,
        }, {
            headers: {"Content-Type": "application/json"}
        })
        .then((response) => {
            let newAccessToken = response.data.access;
            SecureStorage.setItem('accessToken', newAccessToken ?? '');
        })
        .catch((error) => {
            console.log("error refreshing tokens: ", error);
        });
    }
    
    // extract unique id from recipeUri
    const getUniqueRecipeId = (recipeUrl: string) => {
        let uniqueRecipeId = recipeUrl.split('/').pop();
        let result = (uniqueRecipeId ?? '').split('?')[0];
        // console.log(result);
        return result.split('_')[1];
    }
    // save to db
    const saveUserRecipe = async(recipe: Recipe) => {
        let imageThumbnail = recipe.thumbnail?.url || recipe.image;
        let recipe_id = getUniqueRecipeId(recipe.uri);

        let accessToken = await SecureStorage.getItemAsync('accessToken');
        let refreshToken = await SecureStorage.getItemAsync('refreshToken');

        if (!accessToken) {
            console.error("Access token is missing, can't save recipe");
            return;
        }else if (isTokenExpired(accessToken)){
            await refreshTokens(refreshToken ?? '');
            accessToken = await SecureStorage.getItemAsync('accessToken');
        }

        console.log('Saving recipe:', recipe_id, recipe.label);
        axios.post(`${backend}/api/user-recipes/create/`, { 
            recipe: {
                id: recipe_id,
                label: recipe.label,
                thumbnail: imageThumbnail,
            }
        }, {
            headers:{
                "Authorization": `Bearer ${accessToken}`,
            },  
        })
        .then((response) => {
            console.log(response.data);
            console.log('Recipe saved successfully');
        })
        .catch((error) => {
            Toast.show("Error Saving Recipe", {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor: "red"
            });
        });

        // save recipe to userState
        console.log("saving recipe to redux state");
        dispatch({ type: 'ADD_RECIPE', recipe: {
            api_id: recipe_id,  
            thumbnail: imageThumbnail,
            title: recipe.label,
        } });
    }
    // retrieve random recipes from recipe API
    const getRecipes = async() => {
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
        })
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => {
        const initialize = async() => {
            await getRecipes();
            setLoading(false);
        }
        initialize();
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
                        <ActivityIndicator size="large" color={COLORS.lightgray} /> 
                    )}
                </View>
            </SafeAreaView>
        </>
        
    );
}