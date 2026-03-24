// ============================================================
// LoginScreen – Email + Password authentication
// ============================================================
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../types';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {login, clearError} from '../store/slices/authSlice';
import {useTheme} from '../hooks/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const {colors, toggle, isDark} = useTheme();
  const dispatch = useAppDispatch();
  const {isLoading, error} = useAppSelector(s => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [email, password]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setLocalError('');
    dispatch(login({email, password}));
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.bgDark}}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Theme Toggle */}
        <TouchableOpacity 
          onPress={toggle} 
          style={[styles.themeToggle, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
          <Text>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoCircle, {backgroundColor: colors.primary + '30', borderColor: colors.primary}]}>
              <Text style={styles.logoEmoji}>✅</Text>
            </View>
            <Text style={[styles.title, {color: colors.textPrimary}]}>Welcome Back</Text>
            <Text style={[styles.subtitle, {color: colors.textSecondary}]}>Sign in to manage your tasks</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {(localError || error) ? (
              <View style={[styles.errorBox, {backgroundColor: colors.error + '20', borderColor: colors.error + '50'}]}>
                <Text style={[styles.errorText, {color: colors.error}]}>⚠️  {localError || error}</Text>
              </View>
            ) : null}

            <GradientButton label="Sign In" onPress={handleLogin} isLoading={isLoading} style={styles.btn} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchRow}>
              <Text style={[styles.switchText, {color: colors.textSecondary}]}>
                Don't have an account?{' '}
                <Text style={[styles.switchLink, {color: colors.primaryLight}]}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  kav: {flex: 1},
  scroll: {flexGrow: 1, justifyContent: 'center', padding: 28},
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  header: {alignItems: 'center', marginBottom: 40},
  logoCircle: {width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 2},
  logoEmoji: {fontSize: 36},
  title: {fontSize: 28, fontWeight: '800', marginBottom: 6},
  subtitle: {fontSize: 14},
  form: {},
  errorBox: {borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1},
  errorText: {fontSize: 13},
  btn: {marginTop: 8, marginBottom: 20},
  switchRow: {alignItems: 'center'},
  switchText: {fontSize: 14},
  switchLink: {fontWeight: '700'},
});

export default LoginScreen;
