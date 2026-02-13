import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  Alert,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../../config';

const VerifyFPEmail = ({ navigation, route }: any) => {
  const [pins, setPins] = useState(['', '', '', '', '', '']);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const timerRef = useRef<any>(null);

  const pinRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  const email = route?.params?.email || null;
  const confirmation = route?.params?.confirmationCode || null;

  useEffect(() => {
    if (confirmation) {
      setConfirmCode(confirmation);
      startCountdown();
    }
    return () => clearInterval(timerRef.current);
  }, [confirmation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(30);
    setIsResendEnabled(false);
    timerRef.current = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePinChange = (text: string, index: number) => {
    const newPins = [...pins];
    newPins[index] = text;
    setPins(newPins);
    if (text.length === 1 && index < 5) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && pins[index] === '' && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleConfirmEmail = () => {
    const enteredCode = pins.join('');
    if (enteredCode.length < 6) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    axios
      .post(`${API_URL}/verify-reset-code`, { email, code: enteredCode })
      .then(res => {
        const { status, message, resetCode: newCode } = res.data;

        if (status === 'ok') {
          Alert.alert('Success', 'Email verified successfully');
          navigation.navigate('ResetPassword', { email });
        } else if (status === 'expired') {
          setConfirmCode(newCode); // Update local code
          setPins(['', '', '', '', '', '']);
          Alert.alert('Code Expired', message);
          startCountdown(); // Restart timer
          pinRefs[0].current?.focus();
        } else {
          Alert.alert('Error', message || 'Invalid verification code');
          setPins(['', '', '', '', '', '']);
          pinRefs[0].current?.focus();
        }
      })
      .catch(error => {
        console.error('Error during code verification:', error);
        Alert.alert('Error', 'Failed to verify code. Please try again.');
      });
  };

  const sendEmailAgain = async () => {
    if (resendAttempts >= 2) {
      Alert.alert('Limit Reached', 'You can try again later.');
      return;
    }
    try {
      startCountdown();
      setPins(['', '', '', '', '', '']);
      const response = await axios.post(`${API_URL}/send-password-reset-email`, { email });
      const { resetCode } = response.data;
      setConfirmCode(resetCode);
      setResendAttempts(prev => prev + 1);
    } catch (err) {
      Alert.alert('Error', 'Failed to resend verification code.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/image/welcome.jpg')}
      style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialIcon name="arrow-back" size={28} color="#4A7856" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.emailCircle}>
              <MaterialIcon name="mark-email-read" size={40} color="#4A7856" />
            </View>
          </View>

          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Please enter the verification code we sent to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.pinContainer}>
            {pins.map((digit, index) => (
              <TextInput
                key={index}
                ref={pinRefs[index]}
                value={digit}
                onChangeText={text => handlePinChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                style={styles.pinInput}
                keyboardType="number-pad"
                maxLength={1}
                mode="outlined"
                outlineColor="rgba(74, 120, 86, 0.3)"
                activeOutlineColor="#4A7856"
                theme={{ colors: { primary: '#4A7856', background: '#fff' } }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmEmail}
            activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendEmailAgain}
            disabled={!isResendEnabled || resendAttempts >= 2}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.resendText,
                { color: isResendEnabled && resendAttempts < 2 ? '#4A7856' : '#999' },
              ]}>
              {resendAttempts >= 2
                ? 'Try again later'
                : isResendEnabled
                  ? 'Re-send code?'
                  : `Re-send available in ${countdown}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', paddingHorizontal: 20 },
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  iconContainer: { marginBottom: 15 },
  emailCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(74, 120, 86, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#4A7856', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  emailHighlight: { fontWeight: '700', color: '#4A7856' },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  pinInput: {
    width: 42,
    height: 50,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
      android: { elevation: 6 },
    }),
  },
  confirmButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  resendText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});

export default VerifyFPEmail;
