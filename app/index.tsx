import React from "react";
import { Provider } from "react-redux";
import store from "../store";
import MainComponent from "../components/MainComponent";
// Mint Green - #98FB98
// Soft White - #FFFFFF
// Tomato Red - #FF6347
// Lemon Yellow - #FFFACD
// Basil Green - #228B22
// https://stackoverflow.com/questions/77963691/how-can-i-add-redux-toolkit-to-expo-sdk-50-project

export default function Index() {
  return (
    <Provider store={store}>
      <MainComponent />
    </Provider>
  );
}
