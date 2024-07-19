import { Provider } from "react-redux";
import store from "../../store";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "../navigation/AppNavigator";
import Tabs from "../navigation/Tabs";

export default function RecipeApp() {
    return (
        <Provider store={store}>
            <AppNavigator />
        </Provider>
      );
}