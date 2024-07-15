import MainComponent from "../MainComponent";
import Login from "../Login";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
function TabNavigator(props){

    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator>
          <Tab.Screen options = {{
            headerShown: false,
            }}
            name="MainComponent" 
            component={MainComponent} />
          <Tab.Screen options = {{
            headerShown: false,
            }}
            name="Login" 
            component = {Login}/>
        </Tab.Navigator>
    )
}

export default TabNavigator;