import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  SignupScreen,
  SitterProfileScreen,
  BookingScreen,
  BecomeSitterScreen,
} from '../screens';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.white },
          animation: 'slide_from_right',
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Main App */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* Modal Screens */}
        <Stack.Screen
          name="SitterProfile"
          component={SitterProfileScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="BecomeSitter"
          component={BecomeSitterScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

