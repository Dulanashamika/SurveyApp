import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  BackHandler,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../../config';
import SQLite from 'react-native-sqlite-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Keychain from 'react-native-keychain';
import { setLoginEmail } from '../../assets/sql_lite/db_connection';

const SignupForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const selectedRole = route.params?.role || '';
  const surveyTypes = route.params?.surveyTypes || [];
  const researchAreas = route.params?.researchAreas || [];
  const periodicalCategories = route.params?.periodicalCategories || [];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const db = SQLite.openDatabase(
    { name: 'user_db.db', location: 'default' },
    () => console.log('Database opened'),
    (err: any) => console.error('Database error: ', err),
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const saveUserToSQLite = (userEmail: string, userPassword: string, userName: string) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO Users (email, password, pin, isGoogleLogin, emailConfirm, name, area, fingerPrint, userImageUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userEmail, userPassword, null, 0, 0, userName, null, 0, null],
        () => console.log('User saved to SQLite'),
        (error: any) => console.log('Error saving user to SQLite: ' + error.message),
      );
    });
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/registering`, {
        email,
        password,
        confirmPassword,
      });

      if (response.data.status === 'ok') {
        if (response.data.isAccount) {
          Alert.alert('Error', 'An account with this email already exists');
          setLoading(false);
          return;
        }
        saveUserToSQLite(email, password, fullName);
        await axios.post(`${API_URL}/add-username`, { email, name: fullName });
        await axios.post(`${API_URL}/save-signup-details`, {
          email,
          role: selectedRole,
          surveyTypes,
          researchAreas,
          periodicalCategories,
        });

        // Send confirmation email after saving details
        const emailRes = await axios.post(`${API_URL}/send-confirmation-email`, { email });

        setLoading(false);
        if (emailRes.data.status === 'ok') {
          const { confirmationCode } = emailRes.data;
          Alert.alert('Success', 'Registration successful! Verification code sent to your email.');
          navigation.navigate('VerifyEmail', { email, confirmationCode });
        } else {
          Alert.alert('Success', 'Registration successful!');
          navigation.navigate('SignupSuccess', { email });
        }
      } else {
        Alert.alert('Error', response.data.data || 'Registration failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo && userInfo.data && userInfo.data.user) {
        const { email: gEmail, name, photo } = userInfo.data.user;

        // Register/Login with Google on Backend
        const res = await axios.post(`${API_URL}/google-register`, { email: gEmail, name, photo });

        if (res.data.status === 'ok') {
          // New registration - save extra details
          saveUserToSQLite(gEmail!, 'google-auth', name || '');
          await axios.post(`${API_URL}/save-signup-details`, {
            email: gEmail,
            role: selectedRole,
            surveyTypes,
            researchAreas,
            periodicalCategories,
          });

          Alert.alert('Success', 'Account registered successfully');
          navigation.navigate('PrivacyPolicy', { email: gEmail, name });
        } else if (res.data.status === 'google') {
          // Existing Google User
          const { token } = res.data.data;
          await Keychain.setGenericPassword(gEmail!, token);
          await setLoginEmail(gEmail!);

          Alert.alert('Success', 'Logged in successfully');
          navigation.replace('Welcome', { email: gEmail });
        } else if (res.data.status === 'notgoogle') {
          Alert.alert('Error', 'This email is already registered with a password. Please sign in with email/password.');
        }
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
      Alert.alert('Error', 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/image/Nature.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcon name="arrow-back" size={28} color="#4A7856" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Signup</Text>
              <Text style={styles.subtitle}>
                Register to contribute to environmental research data collection
              </Text>
              <Text style={styles.roleTag}>Role: {selectedRole}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name:</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                outlineColor="rgba(74, 120, 86, 0.3)"
                activeOutlineColor="#4A7856"
                style={styles.input}
                editable={!loading}
                theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
              />
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
                editable={!loading}
                theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password:</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={securePassword}
                outlineColor="rgba(74, 120, 86, 0.3)"
                activeOutlineColor="#4A7856"
                style={styles.input}
                editable={!loading}
                right={
                  <TextInput.Icon
                    icon={securePassword ? 'eye-off' : 'eye'}
                    onPress={() => setSecurePassword(!securePassword)}
                    color="#4A7856"
                  />
                }
                theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password:</Text>
              <TextInput
                mode="outlined"
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirmPassword}
                outlineColor="rgba(74, 120, 86, 0.3)"
                activeOutlineColor="#4A7856"
                style={styles.input}
                editable={!loading}
                right={
                  <TextInput.Icon
                    icon={secureConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                    color="#4A7856"
                  />
                }
                theme={{ colors: { primary: '#4A7856', background: 'rgba(255, 255, 255, 0.95)' } }}
              />
            </View>

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <MaterialIcon name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.horizontalLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.horizontalLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/image/google.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.replace('SigninForm')}
                activeOpacity={0.7}
              >
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 10,
  },
  backButtonText: { fontSize: 16, color: '#4A7856', marginLeft: 5, fontWeight: '600' },
  scrollContainer: { flex: 1, marginTop: Platform.OS === 'ios' ? 60 : 50 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20 },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 25,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A7856', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  roleTag: {
    fontSize: 12, color: '#4A7856', fontWeight: '600',
    backgroundColor: 'rgba(74, 120, 86, 0.1)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start',
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#333', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.95)', fontSize: 13 },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
  checkbox: {
    width: 18, height: 18, borderWidth: 2, borderColor: '#4A7856',
    borderRadius: 4, marginRight: 10, marginTop: 2, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4A7856' },
  termsText: { fontSize: 12, color: '#333', flex: 1, lineHeight: 16 },
  termsLink: { color: '#4A7856', fontWeight: '600', textDecorationLine: 'underline' },
  signupButton: {
    backgroundColor: '#4A7856', paddingVertical: 14, borderRadius: 25,
    alignItems: 'center', marginTop: 10, marginBottom: 15,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 5 },
    }),
  },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.5 },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  signInText: { fontSize: 12, color: '#666' },
  signInLink: { fontSize: 12, color: '#4A7856', fontWeight: '700', textDecorationLine: 'underline' },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(74, 120, 86, 0.2)',
  },
  orText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(74, 120, 86, 0.3)',
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default SignupForm;
