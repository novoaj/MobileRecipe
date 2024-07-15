import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

const MainComponent = () => {
  const isAuthenticated = useSelector(state => state.authenticated);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? ( // Check if user is non-null before displaying
      <> 
        <Text>User: {JSON.stringify(user)}</Text>
        <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      </>
      ) : (
        <>
          <Text>No User</Text>
          <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
        </>
      )}
      <Button
        title="Set User"
        onPress={() => dispatch({ type: 'SET_USER', user: { name: 'John Doe' } })}
        />
      <Button
        title="Logout User"
        onPress={() => dispatch({ type: 'LOGOUT_USER' })}
        />
    </View>
  );
};

export default MainComponent;