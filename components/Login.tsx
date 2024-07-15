import { Text, View, TextInput, Pressable, SafeAreaView, StyleSheet } from "react-native";
import React from 'react'
// Mint Green - #98FB98
// Soft White - #FFFFFF
// Tomato Red - #FF6347
// Lemon Yellow - #FFFACD
// Basil Green - #228B22
const styles = StyleSheet.create({
  input: {
    padding: 5,
  }
});

export default function Login(){
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    return (
            <SafeAreaView
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
            >
            <View
                style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                width: "90%",
                height: "90%"
                }}
            >
                <Text
                style={{
                    fontSize: 24,
                    marginBottom: 10,
                    textAlign: "center",
                }}>
                Login</Text>
                <Text>Username</Text>
                <TextInput
                style={styles.input}
                value={username}
                placeholder="Enter username here"
                ></TextInput>
                <Text>Password</Text>
                <TextInput
                style={styles.input}
                value={password}
                placeholder="Enter pasword here"
                ></TextInput>
                <Pressable
                style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#228B22",
                    borderWidth: 2,
                    padding: 10,
                    borderRadius: 20,
                    marginTop: 10,
                    marginBottom: 20,
                    alignItems: "center",
                }}
                >
                <Text
                    style={{  
                    color: "#228B22",
                    }}
                >Submit</Text>
                </Pressable>
                <Text>Don't have an account? sign up here</Text>
            </View>
        </SafeAreaView>
    );
}