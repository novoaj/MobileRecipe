import React, { useState, useEffect, useCallback }from "react";
import { Text, Button, View, SafeAreaView, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import * as SecureStorage from 'expo-secure-store';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
    savedRecipes: any;
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
    const user = useSelector((state : RootState) => state.user);
    const dispatch = useDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [apiRecipes, setApiRecipes] = useState<UserRecipe[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const ITEMS_PER_PAGE = 5;

    const backend = process.env.REACT_APP_API_URL as string;

     // is access token expired
     const isTokenExpired = (token: string | null): boolean => {
        console.log("isTokenExpired method: ", token);
        if (!token) return true;
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        console.log(decodedToken.exp, currentTime);
        console.log("Is token expired?", decodedToken.exp < currentTime);  // Condition evaluation
        return decodedToken.exp < currentTime;
    };
    const refreshTokens = async(refreshToken : string) => {
        if (!refreshToken) {
            console.error("Refresh token is missing");
            return;
        }
        console.log("refreshing Token: ", refreshToken);
        axios.post(`${backend}/token/refresh/`, {
            refresh: refreshToken,
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
    const clearTokens = async () => {
        try {
            await SecureStorage.deleteItemAsync('accessToken');
            await SecureStorage.deleteItemAsync('refreshToken');
        } catch (error) {
            console.error('Failed to clear token:', error);
        }
    }

    // retrieves this user's recipes from our server
    const getAPIRecipes = async() => {
        // const token = await refreshAccessToken();
        let accessToken = await SecureStorage.getItemAsync('accessToken');
        let refreshToken = await SecureStorage.getItemAsync('refreshToken');

        if (!accessToken || !refreshToken) {
            console.error("Access or refresh token is missing, can't get recipes");
            return;
        }else if (isTokenExpired(accessToken)){
            await refreshTokens(refreshToken ?? '');
            accessToken = await SecureStorage.getItemAsync('accessToken');
        }

        if (!accessToken) return;
        axios.get(`${backend}/api/user-recipes/`, {
            headers:{
                "Authorization": `Bearer ${accessToken}`,
            },  
        })
        .then((response) => {
            // console.log(response.data);
            setApiRecipes(response.data.map((item: ListItem) => item.recipe));
            setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
        })
        .catch((error) => {
            console.error('Failed to get recipes:', error);
        });
    }
    const initialize = async() => {
        await getAPIRecipes();
        setLoading(false);
    }
    useEffect(()=> {
        initialize();
    }, []);

    // runs when screen is navigated to
    useFocusEffect(
        useCallback(() => {
            getAPIRecipes();
        }, [])
    );

    const deleteUserRecipe = async(recipeId: string) => {
        let accessToken = await SecureStorage.getItemAsync('accessToken');
        let refreshToken = await SecureStorage.getItemAsync('refreshToken');
        
        // accesToken must be nonnull and not expired
        if (!accessToken || !refreshToken) {
            console.error("Access or refresh token is missing, can't get recipes");
            return;
        }else if (isTokenExpired(accessToken)){
            await refreshTokens(refreshToken ?? '');
            accessToken = await SecureStorage.getItemAsync('accessToken');
            if (!accessToken){
                console.error("Access token is not set after refresh, can't delete");
                return;
            }
        }
        
        // delete from database using api endpoint
        console.log("removing from db... ", recipeId);
        await axios.delete(`${backend}/api/user-recipes/delete/${recipeId}/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        })
        .then((response) => {
            console.log(response.status);
        })
        .catch((error) => {
            console.error('Failed to delete recipe:', error);
        });

        // remove from local state
        console.log("removing from List... ", recipeId);
        const updatedApiRecipes = apiRecipes.filter(recipe => recipe.api_id !== recipeId);
        setApiRecipes(updatedApiRecipes);
        const newTotalPages = Math.ceil(updatedApiRecipes.length / ITEMS_PER_PAGE);
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

    const handleSeeMore = (recipeId : string, recipeName : string) => {
        console.log(recipeId);
        navigation.push('Recipe', {
            params: {recipeId: recipeId, recipeName: recipeName}
        });
    }

    const handleLogout = async() => {
        // accessToken must be nonnull and not expired
        let accessToken = await SecureStorage.getItemAsync('accessToken');
        let refreshToken = await SecureStorage.getItemAsync('refreshToken');

        if (!accessToken || !refreshToken) {
            console.error("Access or refresh token is missing, can't get recipes");
            return;
        }else if (isTokenExpired(accessToken)){
            await refreshTokens(refreshToken ?? '');
            accessToken = await SecureStorage.getItemAsync('accessToken');
            if (!accessToken){
                console.error("Access token is missing after refresh, can't logout");
                return;
            }
        }
        // logout from server
        axios.post(`${backend}/api/logout/`, {
            refresh: refreshToken,  // Include refreshToken in the request body
        }, {
            headers:{
                "Authorization": `Bearer ${accessToken}`,
            },  
        })
        .then((response) => {
            console.log(response.status)
        })
        .catch((error) => {
            console.log('Failed to logout:', error);
        });

        // cleanup secure storage and redux state
        clearTokens();
        dispatch({ type: 'LOGOUT_USER'})
    }
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
                                marginVertical: 10,
                                justifyContent: 'center',
                                paddingLeft: 8
                            }}>
                                <Text>{user.username}</Text>
                            </View>
                        </View>
                    </View>
                    {apiRecipes.length === 0 ? 
                    <Text style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: COLORS.black,
                        marginVertical: 20
                    }}>No recipes saved</Text> :
                    <View style={{
                        marginHorizontal: 18,
                        borderColor: COLORS.lightgray,
                        borderWidth: 2,
                        borderRadius: 12,
                        marginBottom: 10,
                    }}>
                        {apiRecipes.slice((currentPage - 1) * ITEMS_PER_PAGE, ((currentPage - 1) * ITEMS_PER_PAGE) + ITEMS_PER_PAGE).map((recipe, index) => (
                            <View key={index} style={styles.recipeView}>
                                <UserRecipe thumbnail={recipe.thumbnail} recipeId = {recipe.api_id} label={recipe.title} deleteRecipe={deleteUserRecipe} seeMore={handleSeeMore}></UserRecipe>
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
                    }
                    
                    <Pressable
                        style={styles.button}
                        onPress={handleLogout}> 
                        <Text style={styles.buttonText}>
                            Logout
                        </Text>
                    </Pressable>
            </ScrollView>
      </SafeAreaView>
    </>);
}