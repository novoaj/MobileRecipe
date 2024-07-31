import React from 'react'
import { Text, View, TextInput, Pressable, SafeAreaView, StyleSheet, Image, Switch, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import Toast from "react-native-root-toast";
import {COLORS} from '../../constants/Colors';

const logo = require('../../assets/images/logo-png.png');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        alignItems: "center",
        backgroundColor: COLORS.white,
    },
    logo : {
        height: 180,
        width: 180,
        marginVertical: 26,
    },
    title: {
        fontSize: 26,
        color: COLORS.black,
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "uppercase",
        paddingVertical: 30,
    },
    inputView : {
        gap: 10,
        width: "100%",
        paddingHorizontal: 20,
        marginBottom: 10
    },
    input: {
        height: 40,
        paddingHorizontal: 10,
        borderColor: COLORS.lightgray,
        borderWidth: 1,
        borderRadius: 8,
    },
    rememberView : {
        width : "100%",
        paddingHorizontal : 50,
        justifyContent: "space-between",
        alignItems : "center",
        flexDirection : "row",
        marginBottom : 8
      },
    switch :{
        flexDirection : "row",
        gap : 1,
        justifyContent : "center",
        alignItems : "center"
        
    },
    rememberText : {
        fontSize: 13
    },
    forgotText : {
        fontSize : 11,
        color : COLORS.red
    },
    button : {
        backgroundColor : COLORS.red,
        height : 45,
        borderColor : COLORS.lightgray,
        borderWidth  : 1,
        borderRadius : 8,
        alignItems : "center",
        justifyContent : "center",
        marginVertical: 18,
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
    footerText : {
        textAlign: "center",
        color : "gray",
      },
    signup : {
        color : COLORS.red,
        fontSize : 13
    }
});
interface RootState {
    authenticated: boolean;
    user: any; // Replace 'any' with the actual type of your user state
  }
export default function Login(){
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [click,setClick] = React.useState(false);

    const isAuthenticated = useSelector((state : RootState) => Boolean(state.authenticated));
    const user = useSelector((state : RootState) => state.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    
    const handleLogin = () => {
        // login logic with Django backend, change in user state on success should cause rerender of AppNavigator
        axios.post(`${process.env.REACT_APP_API_URL}/api/login/`, {
            username: username,
            password: password,
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status === 200) {
                // data.id, data.tokens.access, data.tokens.refresh, data.tokens.username
                const { id, tokens, username } = response.data;
                const { access, refresh } = tokens;

                const setTokens = async(access : string, refresh : string) => {
                    await AsyncStorage.setItem('accessToken', access);
                    await AsyncStorage.setItem('refreshToken', refresh);
                }
                setTokens(access, refresh); // Store the JWT in AsyncStorage
                
                dispatch({ type: 'SET_USER', user: { id, username } });

                Toast.show("Login Successful!", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.TOP,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    backgroundColor: "green"
                });
            }else{
                Toast.show("Login Failed, Please Try Again!", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.TOP,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    backgroundColor: "red"
                });
            }
        })
        .catch(err => {
            Toast.show("Login Failed, Please Try Again!", {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor: "red"
            });
        });
    };
    const handleNavigateSignup = () => {
        navigation.navigate('Signup');
        
    }
    return (
            <SafeAreaView
            style={styles.container}
            >
                <Image source={logo} style={styles.logo} resizeMode="contain"/>
                <Text
                    style={styles.title}>
                    Login
                </Text>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.input}
                        placeholder="USERNAME"
                        onChangeText={setUsername}
                        value={username}
                        autoCorrect={false}
                        autoCapitalize="none"
                        placeholderTextColor={"gray"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="PASSWORD"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                        autoCorrect={false}
                        autoCapitalize="none"
                        placeholderTextColor={"gray"}
                    />
                </View>
                <View style={styles.rememberView}>
                    <View style={styles.switch}>
                        <Switch  value={click} onValueChange={setClick} trackColor={{true : "green" , false : "gray"}} />
                        <Text style={styles.rememberText}>Remember Me</Text>
                    </View>
                    <View>
                        <Pressable onPress={() => Alert.alert("Forgot Password!")}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.buttonView}>
                    <Pressable
                        disabled={!username || !password}
                        style={styles.button}
                        onPress={handleLogin}
                    >
                        <Text style={styles.buttonText}>
                            LOGIN
                        </Text>
                    </Pressable>
                </View>
                <Text style={styles.footerText}>Don't Have Account? 
                    <Text style={styles.signup} onPress={handleNavigateSignup}>  
                        &nbsp;Sign Up
                    </Text>
                </Text>
        </SafeAreaView>
    );
}