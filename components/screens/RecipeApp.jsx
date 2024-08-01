import { Provider } from "react-redux";
import store from "../../store";
import AppNavigator from "../navigation/AppNavigator";

export default function RecipeApp() {
    return (
        <Provider store={store}>
            <AppNavigator />
        </Provider>
      );
}