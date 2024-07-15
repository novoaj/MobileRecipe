import { Provider } from "react-redux";
import store from "../../store";
import { NavigationContainer } from "@react-navigation/native";
import Tabs from "../navigation/TabNavigator";

export default function RecipeApp() {
    return (
        <Provider store={store}>
            <NavigationContainer independent={true}>
            <Tabs />
            </NavigationContainer>
        </Provider>
      );
}