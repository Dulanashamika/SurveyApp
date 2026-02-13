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
import axios from 'axios';
import { API_URL } from '../../config';
import SQLite from 'react-native-sqlite-storage';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const VerifyEmail = ({ navigation, route }: any) => {
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pin3, setPin3] = useState('');
  const [pin4, setPin4] = useState('');
  const [pin5, setPin5] = useState('');
  const [pin6, setPin6] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const timerRef = useRef<any>(null);
  const [resendAttempts, setResendAttempts] = useState(0);

  const pin1Ref = useRef<any>(null);
  const pin2Ref = useRef<any>(null);
  const pin3Ref = useRef<any>(null);
  const pin4Ref = useRef<any>(null);
  const pin5Ref = useRef<any>(null);
  const pin6Ref = useRef<any>(null);

  const db = SQLite.openDatabase(
    { name: 'user_db.db', location: 'default' },
    () => console.log('Database opened'),
    (err: any) => console.error('Database error: ', err),
  );

  const email = route?.params?.email || null;
  const confirmation = route?.params?.confirmationCode || null;
  const gName = route?.params?.name || null;
  const role = route?.params?.role || null;

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
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cleanFilled = () => {
    setPin1(''); setPin2(''); setPin3(''); setPin4(''); setPin5(''); setPin6('');
  };

  const updateEmailVerificationInSQLite = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'UPDATE Users SET emailConfirm = ? WHERE email = ?',
        [1, email],
        () => {
          console.log('Email Confirmation status updated in SQLite');
          Alert.alert('Success', 'Email verified successfully');
          navigation.navigate('SignupSuccess');
        },
        (error: any) => console.error('Error updating Email Confirmation status:', error.message),
      );
    });
  };

  const handleConfirmEmail = () => {
    if (!pin1 || !pin2 || !pin3 || !pin4 || !pin5 || !pin6) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    const enteredPin = `${pin1}${pin2}${pin3}${pin4}${pin5}${pin6}`;

    axios
      .post(`${API_URL}/email-validation`, { email, code: enteredPin })
      .then(res => {
        setLoading(false);
        const { status, message, confirmationCode: newCode } = res.data;

        if (status === 'ok') {
          updateEmailVerificationInSQLite();
        } else if (status === 'expired') {
          setConfirmCode(newCode); // Update local code with the new one from server
          cleanFilled();
          Alert.alert('Code Expired', message);
          startCountdown(); // Restart timer for the new code
        } else {
          Alert.alert('Error', message || 'Invalid verification code');
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
        Alert.alert('Error', 'Error verifying email. Please try again.');
      });
  };

  const sendEmailAgain = async () => {
    if (resendAttempts >= 2) {
      Alert.alert('Limit Reached', 'You can try again later.');
      return;
    }
    try {
      startCountdown();
      cleanFilled();
      const response = await axios.post(`${API_URL}/send-confirmation-email`, { email });
      const { confirmationCode } = response.data;
      setConfirmCode(confirmationCode);
      setResendAttempts(prev => prev + 1);
    } catch (err) {
      Alert.alert('Error', 'Failed to send confirmation email.');
    }
  };

  const renderPinInput = (
    value: string,
    setValue: (t: string) => void,
    ref: any,
    nextRef: any,
    prevRef: any,
  ) => (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={text => {
        setValue(text);
        if (text.length === 1 && nextRef?.current) nextRef.current.focus();
      }}
      onKeyPress={({ nativeEvent }: any) => {
        if (nativeEvent.key === 'Backspace' && !value && prevRef?.current) {
          prevRef.current.focus();
        }
      }}
      style={styles.pinInput}
      keyboardType="number-pad"
      maxLength={1}
      mode="outlined"
      outlineColor="rgba(74, 120, 86, 0.3)"
      activeOutlineColor="#4A7856"
      theme={{ colors: { primary: '#4A7856', background: '#fff' } }}
    />
  );

  return (
    <ImageBackground
      source={require('../../assets/image/welcome.jpg')}
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

        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Verify your Email</Text>
            <Text style={styles.description}>
              Please enter the verification code we sent to{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.pinContainer}>
              {renderPinInput(pin1, setPin1, pin1Ref, pin2Ref, null)}
              {renderPinInput(pin2, setPin2, pin2Ref, pin3Ref, pin1Ref)}
              {renderPinInput(pin3, setPin3, pin3Ref, pin4Ref, pin2Ref)}
              {renderPinInput(pin4, setPin4, pin4Ref, pin5Ref, pin3Ref)}
              {renderPinInput(pin5, setPin5, pin5Ref, pin6Ref, pin4Ref)}
              {renderPinInput(pin6, setPin6, pin6Ref, null, pin5Ref)}
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleConfirmEmail}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Verifying...' : 'Confirm'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendEmailAgain}
              disabled={!isResendEnabled || resendAttempts >= 2}
            >
              <Text style={[
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' },
  backButton: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20,
    flexDirection: 'row', alignItems: 'center', padding: 10, zIndex: 10,
  },
  backButtonText: { fontSize: 16, color: '#4A7856', marginLeft: 5, fontWeight: '600' },
  centerContainer: { paddingHorizontal: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 20, padding: 28,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  title: { fontSize: 24, fontWeight: '700', color: '#4A7856', marginBottom: 12 },
  description: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  emailText: { fontWeight: '700', color: '#333' },
  pinContainer: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    marginBottom: 25, gap: 8,
  },
  pinInput: {
    flex: 1, fontSize: 18, textAlign: 'center', backgroundColor: '#fff', height: 45,
  },
  confirmButton: {
    backgroundColor: '#4A7856', paddingVertical: 13, borderRadius: 25,
    alignItems: 'center', width: '100%', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
      android: { elevation: 6 },
    }),
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  resendText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});

export default VerifyEmail;
