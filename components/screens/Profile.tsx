import React, { useState, useEffect, useCallback }from "react";
import { Text, Button, View, SafeAreaView, StyleSheet, Pressable } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import UserRecipe from "../UserRecipe";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header : {
      fontSize : 24,
    },
    recipeList: {
        backgroundColor: "white",
        marginBottom: 10
    },
    recipeView: {
        padding: 5
    },
    button : {
        backgroundColor : "red",
        height : 45,
        borderColor : "gray",
        borderWidth  : 1,
        borderRadius : 8,
        alignItems : "center",
        justifyContent : "center",
        marginBottom: 40,
    },
    buttonText : {
        color : "white"  ,
        fontSize: 18,
        fontWeight : "bold"
    }, 
    buttonView :{
        width :"100%",
        paddingHorizontal : 50
    },
    
});
interface RootState {
    authenticated: boolean;
    user: any; // Replace 'any' with the actual type of your user state
}
interface ListItem {
  recipe: UserRecipe
}
interface UserRecipe {
    api_id: string,  
    thumbnail: string,
    title: string,
    
}
interface APIRecipe {
    label: string;
    image: string;
    calories: number;
    ingredientLines: string[];
    totalTime: number;
}
interface DecodedToken {
  exp: number;
}
export default function Profile(){
    const isAuthenticated = useSelector((state : RootState) => state.authenticated);
    const user = useSelector((state : RootState) => state.user);
    const dispatch = useDispatch();

    const [userRecipes, setUserRecipes] = React.useState<UserRecipe[]>([]);
    const [apiRecipes, setAPIRecipes] = React.useState<APIRecipe[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const url = process.env.REACT_APP_EDAMAM_API_URL as string;
    const backend = process.env.REACT_APP_API_URL as string;
    const app_id = process.env.REACT_APP_API_APP_ID as string;
    const app_key = process.env.REACT_APP_API_APP_KEY as string;
    const fields = ['image', 'uri', 'ingredientLines', 'calories', 'totalTime'];

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

  // retrieves this user's recipes from our API
  const getUserRecipes = async() => {
    // const token = await refreshAccessToken();
    // if (!token) return;
    axios.get(`${backend}/api/user-recipes/`, {
        headers:{
            "Authorization": `Bearer ${accessToken}`,
        },  
    })
    .then((response) => {
        // console.log(response.data);
        setUserRecipes(response.data.map((item: ListItem) => item.recipe));
    })
    .catch((error) => {
        console.error('Failed to get recipes:', error);
    });
  }

  useFocusEffect(
    useCallback(() => {
        const fetchTokensAndRecipes = async () => {
            await setTokens();
            await getUserRecipes();
        };
        fetchTokensAndRecipes();
        // console.log(userRecipes);
    }, [])
);


    return (<>
       <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Profile</Text>
            <Text>{user.name}</Text>
            <View style={styles.recipeList}>
                {userRecipes.map((recipe, index) => (
                    <View key={index} style={styles.recipeView}>
                        <UserRecipe thumbnail={recipe.thumbnail} recipeId = {recipe.api_id} label={recipe.title}></UserRecipe>
                        </View>
                ))}
            </View>
            <Pressable
                style={styles.button}
                onPress={() => dispatch({ type: 'LOGOUT' })}> 
                <Text style={styles.buttonText}>
                    Logout
                </Text>
            </Pressable>
      </SafeAreaView>
    </>);
}