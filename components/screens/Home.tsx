import { View, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import RecipeCard from "../RecipeCard";
import { LinearGradient } from "expo-linear-gradient";

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
export default function Home(){
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [curIndex, setCurIndex] = useState<number>(0);

    const url = process.env.REACT_APP_EDAMAM_API_URL as string;
    const app_id = process.env.REACT_APP_API_APP_ID as string;
    const app_key = process.env.REACT_APP_API_APP_KEY as string;
    const fields = ['label', 'image', 'uri', 'ingredientLines', 'calories', 'totalTime'];

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