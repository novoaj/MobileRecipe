import React from "react";
import RecipeApp from "../components/screens/RecipeApp";
import { RootSiblingParent } from "react-native-root-siblings";
import Toast from "react-native-root-toast";

// Mint Green - #98FB98
// Soft White - #FFFFFF
// Tomato Red - #FF6347
// Lemon Yellow - #FFFACD
// Basil Green - #228B22
// https://stackoverflow.com/questions/77963691/how-can-i-add-redux-toolkit-to-expo-sdk-50-project

export default function Index() {
  return (
    <RootSiblingParent>
      
      <RecipeApp />
      <Toast/>
    </RootSiblingParent>
  )
  
}
