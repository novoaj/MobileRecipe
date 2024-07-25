import { View, Text, Image } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Recipe {
    label: string;
    image: string;
    uri: string;
    id: string;
}

interface RecipeViewProps {
    recipe: Recipe;
}

export default function RecipeView({recipe}: RecipeViewProps){
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{uri: recipe.image}} style={{width: 100, height: 100}} />
            <Text>{recipe.label}</Text>
        </View>
    );
}