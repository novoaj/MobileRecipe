import { View, Text, Image, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {COLORS} from '../constants/Colors';
import Toast from "react-native-root-toast";

interface Recipe {
    label: string;
    image: string;
    calories: number;
    ingredientLines: string[];
    totalTime: number;
}

export default function RecipeView(props: any){
    const recipeId = props.route.params.params.recipeId
    const recipeName =  props.route.params.params.recipeName
    const [recipeData, setRecipeData] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    const url = process.env.REACT_APP_EDAMAM_API_URL as string;
    const app_id = process.env.REACT_APP_API_APP_ID as string;
    const app_key = process.env.REACT_APP_API_APP_KEY as string;
    const fields = ['image', 'ingredientLines', 'calories', 'totalTime'];
    // const details = props.route.details
    // const recipeId = details.recipeId
    useEffect(() => {
        const queryParams = new URLSearchParams({
            type: 'public',
            app_id: app_id,
            app_key: app_key,
        });
        fields.forEach(field => queryParams.append('field', field));

        let requestUrl = `${url}/${recipeId}?${queryParams}`;
        axios.get(requestUrl, {
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en'
            }
        })
        .then((response) => {
            let recipe = response.data.recipe
            setRecipeData({
                image : recipe.image,
                label : recipeName,
                calories : Math.floor(recipe.calories),
                ingredientLines : recipe.ingredientLines,
                totalTime : recipe.totalTime
            })
            setLoading(false);
        })
        .catch((error) => {
            Toast.show("Error getting recipe data", {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor: "red"
            });
        });

    }, [recipeId])
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
            {!loading && recipeData ? 
                <ScrollView>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginVertical: 20,
                        marginHorizontal: 30,
                    }}>
                        <Image source={{uri: recipeData?.image}} style={{width: 300, height: 300, borderRadius: 30}} />
                        <Text style = {{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: COLORS.black,
                            textAlign: 'center',
                        }}>
                            {recipeData?.label}
                        </Text>
                    </View>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginHorizontal: 30,
                        marginVertical: 14
                    }}>
                        <Text>
                            Calories: {recipeData?.calories}
                        </Text>
                        <Text>
                            Total Time: {recipeData?.totalTime} minutes
                        </Text>
                    </View>
                    <View style = {{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        marginHorizontal: 30,
                        marginVertical: 8,
                        padding: 10
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: COLORS.black,
                            textAlign: 'center',
                            marginBottom: 16
                        }}>
                            Ingredients:
                        </Text>
                        {recipeData?.ingredientLines.map((ingredient, index) => (
                            <Text style={{
                                textAlign: 'left',
                            }} key={index}>{ingredient}</Text>
                        ))}
                    </View>
                </ScrollView>: 
                <View>
                    <ActivityIndicator size="large" color={COLORS.lightgray} />
                </View>}
        </SafeAreaView>
    );
}