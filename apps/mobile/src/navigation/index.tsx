import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../utils/constants';
import { useAuthStore } from '../stores/auth-store';
import BottomNavBar from '../components/layout/BottomNavBar';
import type {
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
  TaskStackParamList,
} from './types';

import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import ReportSubmitScreen from '../screens/tasks/ReportSubmitScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SurveyListScreen from '../screens/surveys/SurveyListScreen';
import SurveyDetailScreen from '../screens/surveys/SurveyDetailScreen';
import SurveyConfirmationScreen from '../screens/surveys/SurveyConfirmationScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function TaskStackNavigator() {
  return (
    <TaskStack.Navigator screenOptions={{ headerShown: false }}>
      <TaskStack.Screen name="TaskList" component={HomeScreen} />
      <TaskStack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <TaskStack.Screen name="ReportSubmit" component={ReportSubmitScreen} />
      <TaskStack.Screen name="SurveyList" component={SurveyListScreen} />
      <TaskStack.Screen name="SurveyDetail" component={SurveyDetailScreen} />
      <TaskStack.Screen name="SurveyConfirmation" component={SurveyConfirmationScreen} />
    </TaskStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function MapPlaceholderScreen() {
  return (
    <View style={styles.placeholder}>
      <StatusBar style="auto" />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="TasksTab" component={TaskStackNavigator} />
      <Tab.Screen name="MapTab" component={MapPlaceholderScreen} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <StatusBar style="auto" />
        <AppContent />
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
