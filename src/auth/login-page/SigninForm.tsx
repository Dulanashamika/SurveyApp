import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  BackHandler,
  Alert,
  Image,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../../config';
import { setLoginEmail } from '../../assets/sql_lite/db_connection';
import ReactNativeBiometrics from 'react-native-biometrics';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Keychain from 'react-native-keychain';

const SigninForm = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFingerPrintAvailable, setFingerPrintAvailable] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    checkBiometricAvailability();
    checkStoredCredentials();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();
      setFingerPrintAvailable(available);
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const checkStoredCredentials = async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        setHasStoredCredentials(true);
      }
    } catch (error) {
      console.error('Keychain error:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.status === 'ok') {
        const { token } = response.data.data;
        // Store email and token securely
        await Keychain.setGenericPassword(email, token);

        setLoginEmail(email);
        Alert.alert('Success', 'Logged in successfully');
        navigation.replace('Welcome', { email });
      } else if (response.data.status === 'google') {
        Alert.alert('Error', 'This account uses Google Sign-In. Please use the Google button.');
      } else if (response.data.status === 'notConfirmed') {
        handleSendVerificationCode();
      } else if (response.data.status === 'notApproved') {
        Alert.alert('Pending', 'Your account is awaiting admin approval.');
        navigation.navigate('GetAdminApprove', { email });
      } else {
        Alert.alert('Error', response.data.data || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      const response = await axios.post(`${API_URL}/send-confirmation-email`, { email });
      const { confirmationCode } = response.data;
      Alert.alert('Email Not Verified', 'Please verify your email first.');
      navigation.navigate('VerifyEmail', { email, confirmationCode });
    } catch (err) {
      console.error('Failed to send confirmation email.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo && userInfo.data && userInfo.data.user) {
        const { email: gEmail, name, photo } = userInfo.data.user;
        handleGoogleSignUp(gEmail!, name!, photo || '');
      } else {
        Alert.alert('Error', 'Google Sign-In returned invalid data');
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
      Alert.alert('Error', 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (gEmail: string, name: string, photo: string) => {
    try {
      const res = await axios.post(`${API_URL}/google-register`, { email: gEmail, name, photo });

      if (res.data.status === 'ok') {
        Alert.alert('Success', 'Account registered successfully');
        navigation.navigate('PrivacyPolicy', { email: gEmail, name });
      } else if (res.data.status === 'google') {
        const { token } = res.data.data;
        await Keychain.setGenericPassword(gEmail, token);

        setLoginEmail(gEmail);
        Alert.alert('Success', 'Logged in successfully');
        navigation.replace('Welcome', { email: gEmail });
      } else if (res.data.status === 'notgoogle') {
        Alert.alert('Error', 'This email is registered with email/password. Please use that method.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google.');
    }
  };

  const handleFingerprintLogin = async () => {
    if (!hasStoredCredentials) {
      Alert.alert('Error', 'Please sign in with your credentials first to enable fingerprint login.');
      return;
    }

    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available && (biometryType === 'TouchID' || biometryType === 'Biometrics')) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Confirm fingerprint to sign in',
        });

        if (success) {
          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            setLoginEmail(credentials.username);
            navigation.replace('Welcome', { email: credentials.username });
          }
        } else {
          Alert.alert('Failed', 'Authentication failed. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Biometric authentication not supported.');
      }
    } catch (error: any) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'Fingerprint authentication failed.');
    }
  };

  const handlePinLogin = () => {
    if (!hasStoredCredentials) {
      Alert.alert('Error', 'Please sign in with your credentials first to use PIN login.');
      return;
    }
    navigation.navigate('AddPin');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgetPasswordPage');
  };

  return (
    <ImageBackground
      source={require('../../assets/image/Nature.jpg')}
      style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialIcon name="arrow-back" size={28} color="#4A7856" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign-in</Text>
            <Text style={styles.subtitle}>
              If you already have an account. Please sign in
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail address:</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              outlineColor="rgba(74, 120, 86, 0.3)"
              activeOutlineColor="#4A7856"
              style={styles.input}
              theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              outlineColor="rgba(74, 120, 86, 0.3)"
              activeOutlineColor="#4A7856"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye-off' : 'eye'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  color="#4A7856"
                />
              }
              theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
            />
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <MaterialIcon name="check" size={16} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Remember</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}>
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.horizontalLine} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.horizontalLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}>
            <Image
              source={require('../../assets/image/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {(isFingerPrintAvailable || hasStoredCredentials) && (
            <View style={styles.quickLoginContainer}>
              {isFingerPrintAvailable && (
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={handleFingerprintLogin}
                  activeOpacity={0.7}>
                  <MaterialIcon name="fingerprint" size={32} color="#4A7856" />
                  <Text style={styles.quickLoginText}>Fingerprint</Text>
                </TouchableOpacity>
              )}
              {hasStoredCredentials && (
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={handlePinLogin}
                  activeOpacity={0.7}>
                  <MaterialIcon name="dialpad" size={32} color="#4A7856" />
                  <Text style={styles.quickLoginText}>PIN</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.replace('SignupRoleSelection')}
              activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.replace('Welcome')}
            activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next</Text>
            <MaterialIcon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 10,
  },
  backButtonText: { fontSize: 14, color: '#FFFFFF', marginLeft: 5, fontWeight: '600' },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 28,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#4A7856', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#666', lineHeight: 19 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.98)', fontSize: 13 },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#4A7856',
    borderRadius: 4,
    marginRight: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4A7856' },
  rememberText: { fontSize: 11, color: '#333', fontWeight: '500' },
  forgotText: { fontSize: 11, color: '#4A7856', fontWeight: '700' },
  loginButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
      android: { elevation: 6 },
    }),
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  horizontalLine: { flex: 1, height: 1, backgroundColor: 'rgba(74, 120, 86, 0.2)' },
  orText: { fontSize: 11, color: '#999', marginHorizontal: 10 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(74, 120, 86, 0.3)',
    marginBottom: 16,
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  googleButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 16,
  },
  quickLoginButton: { alignItems: 'center', gap: 4 },
  quickLoginText: { fontSize: 11, color: '#4A7856', fontWeight: '500' },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { fontSize: 12, color: '#666' },
  signUpLink: { fontSize: 12, color: '#4A7856', fontWeight: '700', textDecorationLine: 'underline' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7856',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    gap: 8,
  },
  nextButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

export default SigninForm;
