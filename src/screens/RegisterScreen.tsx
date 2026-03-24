// ============================================================
// RegisterScreen – Create a new user account
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
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../types';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {register, clearError} from '../store/slices/authSlice';
import {useTheme} from '../hooks/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const {colors, toggle, isDark} = useTheme();
  const dispatch = useAppDispatch();
  const {isLoading, error} = useAppSelector(s => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [name, email, password, confirm]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) return setLocalError('All fields are required.');
    if (!isValidEmail(email)) return setLocalError('Enter a valid email address.');
    if (password.length < 6) return setLocalError('Password must be 6+ characters.');
    if (password !== confirm) return setLocalError('Passwords do not match.');
    
    setLocalError('');
    try {
      await dispatch(register({name, email, password})).unwrap();
      Alert.alert('Success!', 'Account created. Please login to continue.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (err) {}
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.bgDark}}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <TouchableOpacity onPress={toggle} style={[styles.themeToggle, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
          <Text>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, {color: colors.textPrimary}]}>Create Account</Text>
            <Text style={[styles.subtitle, {color: colors.textSecondary}]}>Sign up to start your journey</Text>
          </View>

          <View style={styles.form}>
            <CustomInput label="Full Name" value={name} onChangeText={setName} placeholder="Lisa H." />
            <CustomInput label="Email Address" value={email} onChangeText={setEmail} placeholder="lisa@example.com" keyboardType="email-address" />
            <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            <CustomInput label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry />

            {(localError || error) ? (
              <View style={[styles.errorBox, {backgroundColor: colors.error + '20', borderColor: colors.error + '50'}]}>
                <Text style={[styles.errorText, {color: colors.error}]}>⚠️  {localError || error}</Text>
              </View>
            ) : null}

            <GradientButton label="Register" onPress={handleRegister} isLoading={isLoading} style={styles.btn} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
              <Text style={[styles.switchText, {color: colors.textSecondary}]}>
                Already have an account?{' '}
                <Text style={[styles.switchLink, {color: colors.primaryLight}]}>Sign In</Text>
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
  themeToggle: {position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, zIndex: 10},
  header: {alignItems: 'center', marginBottom: 30},
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

export default RegisterScreen;
