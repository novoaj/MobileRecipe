import React, { useState, useEffect, useCallback }from "react";
import { Text, Button, View, SafeAreaView, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import UserRecipe from "../UserRecipe";
import {COLORS} from '../../constants/Colors';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 22,
        backgroundColor: COLORS.white,
    },
    header : {
        marginHorizontal : 12,
        flexDirection : "row",
        justifyContent: "center",
    },
    headerText : {
      fontSize : 24,
      color: COLORS.black,
      fontWeight: "bold",
    },
    avatarIcon: {
        alignItems: 'center',
    },
    img: {
        width: 200,
        height: 200,
    },
    recipeView: {
        padding: 3
    },
    button : {
        display : "flex",
        backgroundColor : COLORS.red,
        height : 45,
        borderColor : COLORS.lightgray,
        borderWidth  : 1,
        borderRadius : 8,
        alignItems : "center",
        justifyContent : "center",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    buttonText : {
        color : COLORS.white,
        fontSize: 18,
        fontWeight : "bold"
    }, 
    buttonView :{
        width :"100%",
        paddingHorizontal : 50
    },
    paginationButton: {
        marginHorizontal: 5,
        padding: 10,
        backgroundColor: COLORS.lightgray,
        borderRadius: 7
    },
    paginationText: {
        alignSelf: 'center',
        fontSize: 16,
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
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const ITEMS_PER_PAGE = 5;

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
          return {
            accessToken: storedAccessToken ?? '',
            refreshToken: storedRefreshToken ?? ''
          }
      } catch (error) {
          console.error('Failed to get token:', error);
          return {
            accessToken: null,
            refreshToken: null
          }
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
    const refreshAccessToken = async (accessToken: string | null, refreshToken: string | null): Promise<string | null> => {
        if (isTokenExpired(accessToken)) {
            try {
                const response = await axios.post(`${backend}/token/refresh/`, {
                    refresh: refreshToken,
                });
                const newAccessToken = response.data.access;
                await AsyncStorage.setItem('accessToken', newAccessToken);
                return newAccessToken;
            } catch (error) {
                console.error('Failed to refresh token:', error);
                return null;
            }
        }
      return accessToken;
  }

  // retrieves this user's recipes from our API
    const getUserRecipes = async(token: string | null) => {
    // const token = await refreshAccessToken();
        if (!token) return;
        axios.get(`${backend}/api/user-recipes/`, {
            headers:{
                "Authorization": `Bearer ${token}`,
            },  
        })
        .then((response) => {
            // console.log(response.data);
            setUserRecipes(response.data.map((item: ListItem) => item.recipe));
            setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
        })
        .catch((error) => {
            console.error('Failed to get recipes:', error);
        });
    }
    const initialize = async() => {
        const {accessToken, refreshToken} = await setTokens();
        const token =  await refreshAccessToken(accessToken, refreshToken);
        await getUserRecipes(token);
        setLoading(false);
        }
        useFocusEffect(
            useCallback(() => {
                initialize();
            }, [])
        );
    const deleteUserRecipe = async(recipeId: string) => {
        // get jwt tokens, ensure they are valid
        const {accessToken, refreshToken} = await setTokens();
        const token =  await refreshAccessToken(accessToken, refreshToken);

        // delete from database using api endpoint
        console.log("removing from db... ", recipeId);

        const response = await axios.delete(`${backend}/api/user-recipes/delete/${recipeId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
        .then((response) => {
            console.log(response.status);
        })
        .catch((error) => {
            console.error('Failed to delete recipe:', error);
        });

        // delete from state and update pagination
        console.log("removing from List... ", recipeId);
        const updatedUserRecipes = (userRecipes.filter(recipe => recipe.api_id !== recipeId));
        setUserRecipes(updatedUserRecipes);

        const newTotalPages = Math.ceil(updatedUserRecipes.length / ITEMS_PER_PAGE);
        setTotalPages(newTotalPages);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    return (<>
       <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
                <Text>{user.name}</Text>
            </View>

            <ScrollView>
                <View style={styles.avatarIcon}>
                    <Image source={require('../../assets/images/avatarIcon.png')} style={styles.img}/>
                    
                </View>
                <View>
                    <View style={{
                            flexDirection: 'column',
                            marginBottom: 6,
                            paddingHorizontal: 18,
                        }}>
                            <Text style={{ fontWeight: 'bold' }}>Username:</Text>
                            <View style={{
                                height: 44,
                                width: "100%",
                                borderColor: COLORS.lightgray,
                                borderWidth: 2,
                                borderRadius: 5,
                                marginVertical: 5,
                                justifyContent: 'center',
                                paddingLeft: 8
                            }}>
                                <Text>{user.username}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        marginHorizontal: 18,
                        borderColor: COLORS.lightgray,
                        borderWidth: 2,
                        borderRadius: 12,
                        marginBottom: 10,
                    }}>
                        {userRecipes.slice((currentPage - 1) * ITEMS_PER_PAGE, ((currentPage - 1) * ITEMS_PER_PAGE) + ITEMS_PER_PAGE).map((recipe, index) => (
                            <View key={index} style={styles.recipeView}>
                                <UserRecipe thumbnail={recipe.thumbnail} recipeId = {recipe.api_id} label={recipe.title} deleteRecipe={deleteUserRecipe}></UserRecipe>
                                </View>
                        ))}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                            <Pressable
                                style={styles.paginationButton}
                                onPress={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <Text style={styles.paginationText}>&#x3c;</Text>
                            </Pressable>
                            <Text style={styles.paginationText}>{`${currentPage} / ${totalPages}`}</Text>
                            <Pressable
                                style={styles.paginationButton}
                                onPress={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <Text style={styles.paginationText}>&#x3e;</Text>
                            </Pressable>
                        </View>
                    </View>
                    

                    <Pressable
                        style={styles.button}
                        onPress={() => dispatch({ type: 'LOGOUT' })}> 
                        <Text style={styles.buttonText}>
                            Logout
                        </Text>
                    </Pressable>
            </ScrollView>
            
            
            
      </SafeAreaView>
    </>);
}