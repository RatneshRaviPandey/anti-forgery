import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList, DetoxStackParamList, BreatheStackParamList, CommunityStackParamList, ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../theme';

// Screen imports
import { DashboardScreen } from '../../screens/home/DashboardScreen';
import { DetoxHomeScreen } from '../../screens/detox/DetoxHomeScreen';
import { DetoxTimerScreen } from '../../screens/detox/DetoxTimerScreen';
import { BreatheHomeScreen } from '../../screens/breathe/BreatheHomeScreen';
import { BreathingSessionScreen } from '../../screens/breathe/BreathingSessionScreen';
import { MeditationListScreen } from '../../screens/breathe/MeditationListScreen';
import { MeditationPlayerScreen } from '../../screens/breathe/MeditationPlayerScreen';
import { CommunityHomeScreen } from '../../screens/community/CommunityHomeScreen';
import { ProfileHomeScreen } from '../../screens/profile/ProfileHomeScreen';
import { AnalyticsScreen } from '../../screens/analytics/AnalyticsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DetoxStack = createNativeStackNavigator<DetoxStackParamList>();
const BreatheStack = createNativeStackNavigator<BreatheStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    </HomeStack.Navigator>
  );
}

function DetoxStackScreen() {
  return (
    <DetoxStack.Navigator screenOptions={{ headerShown: false }}>
      <DetoxStack.Screen name="DetoxHome" component={DetoxHomeScreen} />
      <DetoxStack.Screen name="DetoxTimer" component={DetoxTimerScreen} />
    </DetoxStack.Navigator>
  );
}

function BreatheStackScreen() {
  return (
    <BreatheStack.Navigator screenOptions={{ headerShown: false }}>
      <BreatheStack.Screen name="BreatheHome" component={BreatheHomeScreen} />
      <BreatheStack.Screen name="BreathingSession" component={BreathingSessionScreen} />
      <BreatheStack.Screen name="MeditationList" component={MeditationListScreen} />
      <BreatheStack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
    </BreatheStack.Navigator>
  );
}

function CommunityStackScreen() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityHome" component={CommunityHomeScreen} />
    </CommunityStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <ProfileStack.Screen name="Analytics" component={AnalyticsScreen} />
    </ProfileStack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopColor: colors.neutral[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="DetoxTab"
        component={DetoxStackScreen}
        options={{ tabBarLabel: 'Detox' }}
      />
      <Tab.Screen
        name="BreatheTab"
        component={BreatheStackScreen}
        options={{ tabBarLabel: 'Breathe' }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityStackScreen}
        options={{ tabBarLabel: 'Community' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
