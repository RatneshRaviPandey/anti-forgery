import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { WelcomeScreen } from '../../screens/onboarding/WelcomeScreen';
import { SelectAppsScreen } from '../../screens/onboarding/SelectAppsScreen';
import { SetGoalScreen } from '../../screens/onboarding/SetGoalScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SelectApps" component={SelectAppsScreen} />
      <Stack.Screen name="SetGoal" component={SetGoalScreen} />
    </Stack.Navigator>
  );
}
