// App.tsx
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { darkTheme } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import { TaskProvider } from './src/context/TaskContext';
import { configureNotifications } from './src/services/notificationService';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    configureNotifications(); // Configura las notificaciones al iniciar la app
  }, []);

  return (
    <TaskProvider>
      <PaperProvider theme={darkTheme}>
        <NavigationContainer theme={darkTheme}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </TaskProvider>
  );
};

export default App;