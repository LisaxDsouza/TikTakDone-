// ============================================================
// AppNavigator – conditional navigation based on auth state
// Restored session on startup, routes to Auth or Main stack.
// ============================================================
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import VaultScreen from '../screens/VaultScreen';

// Redux
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {restoreSession} from '../store/slices/authSlice';

// Types
import {AuthStackParamList, MainStackParamList} from '../types';
import {COLORS} from '../constants';
import {useTheme} from '../hooks/useTheme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

/** Screens shown to unauthenticated users */
const AuthNavigator = () => (
  <AuthStack.Navigator id="Auth" screenOptions={{headerShown: false}}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

/** Screens shown to authenticated users */
const MainNavigator = () => {
  const {colors} = useTheme();
  return (
    <MainStack.Navigator
      id="Main"
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.bgDark},
      }}>
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Vault" component={VaultScreen} />
      <MainStack.Screen name="AddTask" component={AddTaskScreen} />
      <MainStack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </MainStack.Navigator>
  );
};

/** Root navigator – switches between Auth and Main based on auth state */
const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);

  // Attempt to restore a previously persisted session on app start
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
