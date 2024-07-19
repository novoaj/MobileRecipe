import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import Tabs from './Tabs';

interface RootState {
    authenticated: boolean;
}

function AppNavigator() {
    const isAuthenticated = useSelector((state: RootState) => state.authenticated);

    return (
        <NavigationContainer independent={true}>
            {isAuthenticated ? <Tabs /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

export default AppNavigator;