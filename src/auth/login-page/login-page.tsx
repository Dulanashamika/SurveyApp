import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Alert,
  Appearance,
} from 'react-native';
import {
  TextInput,
  Button,
  Icon,
} from 'react-native-paper';

import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { setLoginEmail } from '../../assets/sql_lite/db_connection';
import ReactNativeBiometrics from 'react-native-biometrics';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GOOGLE_WEB_CLIENT_ID: string =
  '532310046514-217fr842olbptie78ubtgi4mkq84ljo8.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

const LoginPage = ({ route }: any) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isFingerPrintEnable, setFingerPrintEnable] = useState(false);

  // Get the email from route parameters
  const userNewEmail = route?.params?.email || null;

  const handleLogin2 = () => {
    navigation.navigate('ForgetPasswordPage');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Initiate Google Sign-In
      const userInfo = await GoogleSignin.signIn();

      // Log the full userInfo object to inspect its structure
      console.log('User Info:', JSON.stringify(userInfo, null, 2));

      // Access user data from the response
      if (userInfo && userInfo.data && userInfo.data.user) {
        const { email, name, photo } = userInfo.data.user;
        console.log('Google Login:', email, name);
        handleSignUp(email, name, photo);
      } else {
        console.error('User object is undefined or invalid');
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
      Alert.alert('Error', 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  //google signing detail registeration
  const handleSignUp = (email: string, name: string, photo: string) => {
    const userData = {
      email,
      name,
      photo,
    };
    axios
      .post(`${API_URL}/google-register`, userData)
      .then(res => {
        setLoading(false);
        console.log('status ', res.data.status);
        if (res.data.status === 'ok') {
          console.log('A');
          Alert.alert('Success', 'Registered in successfully');
          navigation.navigate('PrivacyPolicy', { email, name });
        } else if (res.data.status === 'google') {
          console.log('D');
          setLoginEmail(email);
          Alert.alert('Success', 'Logged in successfully');
          navigation.navigate('Welcome', { email });
        } else if (res.data.status === 'notgoogle') {
          console.log('E');
          Alert.alert('Success', 'User Registered method Error');
        } else {
          console.log('X');
          // Alert.alert('Error', res.data.data);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
        Alert.alert('Error', 'Error registering user. Please try again.');
      });
  };


  const handleLogin = () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    const userData = {
      email: email,
      password: password,
    };

    axios
      .post(`${API_URL}/login`, userData)
      .then(res => {
        setLoading(false);
        console.log('Response:', res.data);
        if (res.data.status === 'ok') {
          setLoginEmail(email);
          Alert.alert('Success', 'Logged in successfully');
          navigation.navigate('Welcome', { email });
        } else if (res.data.status === 'google') {
          Alert.alert('Error', 'The registration method is invalid');
        } else if (res.data.status === 'notConfirmed') {
          handleSendCode();
          Alert.alert('Error', 'Please Confirm Email First!');
        } else if (res.data.status === 'notApproved') {
          handleApproved();
          Alert.alert('Error', 'Wait for Admin Approval!');
        } else {
          Alert.alert('Error', res.data.data);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
        Alert.alert('Failed', 'Please Sign Up First');
      });
  };

  const handleLoginCitizen = () => {
    navigation.navigate('CitizenForm');
  };

  const handleApproved = () => {
    if (!email) {
      Alert.alert('Error', 'Email is required.');
      return;
    }
    console.log('email is: ', email);

    navigation.navigate('GetAdminApprove', { email });
  };

  // Get the email from route parameters
  const handleSendCode = async () => {
    const userData = {
      email: email,
    };
    try {
      const response = await axios.post(
        `${API_URL}/send-confirmation-email`,
        userData,
      );
      const { confirmationCode } = response.data;
      console.log('confirmationCode', confirmationCode);

      // Navigate to the ConfirmEmail screen and pass the code
      navigation.navigate('VerifyEmail', { email, confirmationCode });
    } catch (err) {
      console.error('Failed to send confirmation email.');
    }
  };

  const validateFields = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return false;
    }

    return true;
  };

  const handleDialPadPress = () => {
    if (userEmail || userNewEmail) {
      navigation.navigate('AddPin');
    } else {
      Alert.alert('Failed', 'Please Sign Up First');
    }
  };

  const handleSensorIconPress = () => {
    if (userEmail || userNewEmail) {
      if (isFingerPrintEnable) {
        handleBiometricAuth();
      } else {
        Alert.alert('Failed', 'Please Enable Finger Print First');
      }
    } else {
      Alert.alert('Failed', 'Please Sign Up First');
    }
  };

  const handleSignupPress = () => {
    navigation.navigate('RegisterPage');
  };

  useEffect(() => {
    GoogleSignin.signOut(); // Optional: Sign out to start fresh for testing
  }, []);

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    const checkBiometrics = async () => {
      try {
        const { available, biometryType } =
          await rnBiometrics.isSensorAvailable();
        if (available) {
          if (biometryType === 'TouchID' || biometryType === 'Biometrics') {
            const { success } = await rnBiometrics.simplePrompt({
              promptMessage: 'Confirm fingerprint',
            });

            if (success) {
              navigation.navigate('Welcome', { email });
            } else {
              Alert.alert('Authentication failed', 'Please try again.');
            }
          } else {
            Alert.alert(
              'Biometric authentication not supported on this device.',
            );
          }
        } else {
          Alert.alert('Biometric sensor not available on this device.');
        }
      } catch (error: any) {
        // Log the exact error for debugging purposes
        console.error('Biometric error:', error);
        Alert.alert(
          'Error',
          `An error occurred while trying to authenticate: ${error.message}`,
        );
      }
    };

    checkBiometrics();
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const isDarkMode = theme === 'dark';

  return (
    <ImageBackground
      source={require('./../../assets/image/imageD.jpg')}
      style={styles.backgroundImage}>
      <View style={styles.title_container}>
        <View
          style={[
            styles.whiteBox,
            {
              backgroundColor: isDarkMode
                ? 'rgba(17, 17, 17, 0.8)'
                : 'rgba(217, 217, 217, 0.7)',
            },
          ]}>
          <Text
            style={[styles.main_text, { color: isDarkMode ? 'white' : 'black' }]}>
            Login
          </Text>
          <Text
            style={[styles.sub_text, { color: isDarkMode ? 'white' : 'black' }]}>
            Enter your email and password to login to this app
          </Text>

          <TextInput
            label="Enter Your Email Address"
            mode="outlined"
            value={email}
            onChangeText={email => setEmail(email)}
            style={[
              styles.text_input,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              },
            ]}
          />
          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={password => setPassword(password)}
            style={[
              styles.text_input,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              },
            ]}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin2}>
            <Text
              style={[
                styles.forgotPasswordText,
                { color: isDarkMode ? 'white' : 'black' },
              ]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={[styles.button_signup, { borderRadius: 8 }]}
            buttonColor="#516E9E"
            textColor="white"
            labelStyle={styles.button_label}>
            Login
          </Button>

          <Button
            mode="contained"
            onPress={handleLoginCitizen}
            style={[styles.button_signup, { borderRadius: 8 }]}
            buttonColor="#516E9E"
            textColor="white"
            labelStyle={styles.button_label}>
            Login As a Citizen
          </Button>

          <View style={styles.orContainer}>
            <View style={styles.horizontalLine} />
            <Text
              style={[
                styles.sub_text_D,
                { color: isDarkMode ? 'white' : 'black' },
              ]}>
              or continue with
            </Text>
            <View style={styles.horizontalLine} />
          </View>

          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            loading={loading}
            style={[styles.button_google, { borderRadius: 8 }]}
            buttonColor="white"
            textColor="black"
            labelStyle={styles.button_label}>
            <View style={styles.googleButtonContent}>
              <Image
                source={require('../../assets/image/google.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          </Button>

          <View style={styles.iconContainer}>
            <View style={styles.finger_icon}>
              <TouchableOpacity onPress={handleSensorIconPress}>
                <Icon source="fingerprint" color="white" size={50} />
              </TouchableOpacity>
            </View>
            <View style={styles.dialpad_icon}>
              <TouchableOpacity onPress={handleDialPadPress}>
                <Icon source="dialpad" color="white" size={50} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottom_container}>
            <Text
              style={[
                styles.sub_text_A,
                { color: isDarkMode ? 'white' : 'black' },
              ]}>
              If you don't have any account?
            </Text>

            <Button
              mode="text"
              onPress={() => handleSignupPress()}
              theme={{ colors: { primary: 'green' } }}>
              <Text
                style={[
                  styles.sub_text_B,
                  { color: isDarkMode ? 'white' : 'black' },
                ]}>
                Signup
              </Text>
            </Button>
          </View>
          <View style={styles.lower_container}>
            <Text style={styles.sub_text_below}>
              By clicking continue, you agree to our{' '}
              <Text style={styles.boldText}>
                Terms of Service and Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '55%',
    height: 142,
    marginLeft: 'auto',
    marginRight: 24,
    marginTop: '60%',
  },
  boldText: {
    fontWeight: 'bold',
  },
  title_container: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    marginTop: '20%',
  },
  main_text: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
  },
  sub_text: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'right',
  },
  sub_text_below: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: 'rgba(217, 217, 217, 0.8)',
    textAlign: 'center',
  },
  text_container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 142,
  },
  whiteBox: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 560,
    backgroundColor: 'rgba(217, 217, 217, 0.7)',
    marginLeft: 14,
    marginRight: 14,
    marginTop: 80,
  },
  forgotPasswordText: {
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 10,
    marginLeft: 240,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10, // Adjusted for a smaller gap
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  text_input: {
    width: '90%',
    marginTop: 10,
  },
  button_signup: {
    width: '90%',
    marginTop: 20,
    fontFamily: 'Inter-regular',
  },
  finger_icon: {
    // justifyContent: 'center',
    // flexDirection: 'row',
    marginRight: 10,
    marginTop: 10,
    // marginLeft:-100
  },
  dialpad_icon: {
    // justifyContent: 'center',
    // flexDirection: 'row',
    marginRight: 90,
    marginTop: 10,
    // marginLeft:-100
  },
  button_google: {
    width: '90%',
    marginTop: 6,
    fontFamily: 'Inter-regular',
  },
  button_label: {
    fontSize: 18,
  },
  sub_text_A: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'right',
  },
  sub_text_B: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sub_text_C: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sub_text_D: {
    fontSize: 16,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'right',
    marginTop: 2,
  },
  bottom_container: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 9,
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 5,
    justifyContent: 'center',
    marginLeft: 100,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 10,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 18,
    color: 'black', // Same color as the button's textColor
  },
  lower_container: {
    flexDirection: 'row',
    marginTop: 180,
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
});

export default LoginPage;
