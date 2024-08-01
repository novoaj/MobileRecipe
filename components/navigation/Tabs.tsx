import Home from "../screens/Home";
import Profile from "../screens/Profile";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullRecipeView from '../FullRecipeView';;
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import {COLORS} from '../../constants/Colors';
import { Stack } from "expo-router";

// https://reactnavigation.org/docs/auth-flow/
function RecipeStack() {
    const Stack = createNativeStackNavigator();
    return <Stack.Navigator>
            <Stack.Screen
                options = {{
                    headerShown: false,
                }}
                name="Back" 
                component={Profile} />
            <Stack.Screen 
                name="Recipe" 
                component={FullRecipeView} />
        </Stack.Navigator>
}
function TabNavigator(props: any){
    interface userState {
        authenticated: boolean;
        user: any; // Replace 'any' with the actual type of your user state
      }
    const isAuthenticated = useSelector((state: userState) => state.authenticated);
    const Tab = createBottomTabNavigator();
    
    // check here if user is signed in, if not, only show auth screens
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => { 
                    if (route.name === 'Home') {
                        return <FontAwesomeIcon icon={faHouse} color={color}/>;
                    } else if (route.name === 'Profile') {
                        return <FontAwesomeIcon icon={faUser} color={color}/>;
                    }
                },
                tabBarActiveTintColor: COLORS.red,
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen options = {{
                headerShown: false,
                }}
                name="Home" 
                component={Home} />
            <Tab.Screen options = {{
                headerShown: false,
                }}
                name="Profile" 
                component={RecipeStack} />
        </Tab.Navigator>
    )
}

export default TabNavigator;