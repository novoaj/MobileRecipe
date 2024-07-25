import Home from "../screens/Home";
import Profile from "../screens/Profile";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

// https://reactnavigation.org/docs/auth-flow/
function TabNavigator(props: any){
    interface userState {
        authenticated: boolean;
        user: any; // Replace 'any' with the actual type of your user state
      }
    const isAuthenticated = useSelector((state: userState) => state.authenticated);
    // const user = useSelector((state: userState) => state.user);
    const Tab = createBottomTabNavigator();
    // check here if user is signed in, if not, only show auth screens
    return (
        <Tab.Navigator>
            <Tab.Screen options = {{
                headerShown: false,
                }}
                name="Home" 
                component={Home} />
            <Tab.Screen options = {{
                headerShown: false,
                }}
                name="Profile" 
                component={Profile} />
        </Tab.Navigator>
    )
}

export default TabNavigator;