import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { API_URL } from '../../config';
import { setLoginEmail } from '../../assets/sql_lite/db_connection';
import * as Keychain from 'react-native-keychain';

const LoginWelcome = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleSignIn = () => {
    navigation.navigate('SigninForm');
  };

  const handleSignUp = () => {
    navigation.navigate('SignupRoleSelection');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo && userInfo.data && userInfo.data.user) {
        const { email, name, photo } = userInfo.data.user;
        handleGoogleSignUp(email!, name!, photo || '');
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

        await setLoginEmail(gEmail);
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

  return (
    <ImageBackground
      source={require('../../assets/image/Nature.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        {/* Logo Container */}
        {/* <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Icon name="eco" size={48} color="#4A7856" />
          </View>
          <Text style={styles.appName}>DATA FOR BLUE CARBON ECOSYSTEMS</Text>
        </View> */}

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>
            Continue your environmental research journey
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign - In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.horizontalLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.horizontalLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <>
              <Image
                source={require('../../assets/image/google.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4A7856',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.2,
    lineHeight: 18,
    maxWidth: 200,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  signInButton: {
    backgroundColor: '#4A7856',
    borderColor: '#4A7856',
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: '#FFFFFF',
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A7856',
    letterSpacing: 0.6,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    color: '#FFFFFF',
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444444',
  },
});

export default LoginWelcome;
