import { Text, View, TextInput, Pressable, SafeAreaView, StyleSheet, Image, Button, Switch, Alert } from "react-native";
import React from 'react'
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
    },
});
interface RootState {
    authenticated: boolean;
    user: any; // Replace 'any' with the actual type of your user state
}

export default function Signup(){
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [password2, setPassword2] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [click,setClick] = React.useState(false);

    const isAuthenticated = useSelector((state : RootState) => Boolean(state.authenticated));
    const user = useSelector((state : RootState) => state.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const handleRegister = () => {
        // do passwords match?
        if (password !== password2) {
            Alert.alert("Passwords must match");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Password must be at least 6 characters");
            return;
        }
        // Signup logic with Django backend, change in user state on success should cause rerender of AppNavigator
        axios.post(`${process.env.REACT_APP_API_URL}/api/register/`, {
            username: username,
            email: email,
            password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
        })
        .then(data => {
            if (data.status === 201) {
                dispatch({ type: 'SET_USER', user: {name: username}}); // TODO: deal with refresh and access tokens
                Toast.show("Signup Successful!", {
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

    const handleNavigateLogin = () => {
        navigation.navigate('Login');
    }
    return (<>
        <SafeAreaView
            style={styles.container}
            >
                <Image source={logo} style={styles.logo} resizeMode="contain"/>
                <Text
                    style={styles.title}>
                    Sign Up
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
                        placeholder="EMAIL"
                        onChangeText={setEmail}
                        value={email}
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
                    <TextInput
                        style={styles.input}
                        placeholder="CONFIRM PASSWORD"
                        onChangeText={setPassword2}
                        value={password2}
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
                </View>
                <View style={styles.buttonView}>
                    <Pressable
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={!username || !password || !password2 || !email}
                    >
                        <Text style={styles.buttonText}>
                            SIGN UP
                        </Text>
                    </Pressable>
                </View>
                <Text style={styles.footerText}>Already Have an Account? 
                    <Text style={styles.signup} onPress={handleNavigateLogin}>  
                        &nbsp;Login
                    </Text>
                </Text>
        </SafeAreaView>
    </>)
}