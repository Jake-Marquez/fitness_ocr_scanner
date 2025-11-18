import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddItemScreen } from './src/screens/AddItemScreen';
import { ItemDetailsScreen } from './src/screens/ItemDetailsScreen';
import { EditItemScreen } from './src/screens/EditItemScreen';
import { DaySummaryScreen } from './src/screens/DaySummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6200ee',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'NutritionOCR' }}
            />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{ title: 'Scan Label' }}
            />
            <Stack.Screen
              name="ItemDetails"
              component={ItemDetailsScreen}
              options={{ title: 'Item Details' }}
            />
            <Stack.Screen
              name="EditItem"
              component={EditItemScreen}
              options={{ title: 'Edit Item' }}
            />
            <Stack.Screen
              name="DaySummary"
              component={DaySummaryScreen}
              options={{ title: 'Day Summary' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
