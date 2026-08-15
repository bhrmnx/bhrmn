import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MagazineScreen from '../screens/MagazineScreen';
import CardDetailScreen from '../screens/CardDetailScreen';

const Stack = createNativeStackNavigator();

/**
 * Cards tap through to a full overlay page — they never expand in place.
 * That is a locked design decision from the prototype.
 */
export default function MagazineStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="feed" component={MagazineScreen} />
      <Stack.Screen
        name="cardDetail"
        component={CardDetailScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
