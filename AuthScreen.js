import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useUser } from './UserContext';

// Candy Crush-inspired vibrant colors
const COLORS = {
  background: '#FFE4E6',
  backgroundEnd: '#FFF0F5',
  primary: '#FF69B4',
  secondary: '#9B59B6',
  accent: '#FFD700',
  success: '#00FF7F',
  warning: '#FF6347',
  text: '#2C3E50',
  white: '#FFFFFF',
  lightPink: '#FFB6C1',
  lightPurple: '#DDA0DD',
  lightYellow: '#FFFF99',
  lightBlue: '#87CEEB',
  lightGreen: '#98FB98',
  orange: '#FF8C00',
  coral: '#FF7F50',
  lavender: '#E6E6FA',
  mint: '#F0FFF0',
};

const AuthScreen = () => {
  const { sendVerificationCode, verifyEmail, register, login } = useUser();
  
  // Auth mode: 'login', 'signup', 'verify'
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [displayedCode, setDisplayedCode] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 300,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleSendVerification = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const code = await sendVerificationCode(formData.email);
      console.log('Generated code:', code); // Debug log
      setDisplayedCode(code); // Store code for display
      setAuthMode('verify');
      
      // Show the verification code in an alert
      Alert.alert(
        '📧 Verification Code Sent!',
        `Your 6-digit verification code is:\n\n${code}\n\nEnter this code below to verify your email: ${formData.email}`,
        [
          {
            text: 'Copy Code',
            onPress: () => {
              // Copy to clipboard if available
              if (navigator.clipboard) {
                navigator.clipboard.writeText(code);
              }
            }
          },
          { text: 'Got It!', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Verification error:', error); // Debug log
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const isValid = await verifyEmail(formData.email, formData.verificationCode);
      if (isValid) {
        setAuthMode('password'); // Go to password setup, not back to signup
        Alert.alert('Email Verified!', 'Your email has been verified. Now set up your password.');
      } else {
        setErrorMessage('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!validateUsername(formData.username)) {
      setErrorMessage('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      Alert.alert('Success!', 'Account created successfully! Welcome to MindCandy! 🎉');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setErrorMessage('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username or Email</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          placeholder="Enter your username or email"
          placeholderTextColor={COLORS.text + '80'}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Enter your password"
          placeholderTextColor={COLORS.text + '80'}
          secureTextEntry
        />
      </View>

      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? '⏳ Logging in...' : '🎯 Login'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setAuthMode('signup')}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>
          Don't have an account? <Text style={styles.toggleButtonTextBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSignupForm = () => (
    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter your full name"
          placeholderTextColor={COLORS.text + '80'}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          placeholder="Choose a username"
          placeholderTextColor={COLORS.text + '80'}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="Enter your email"
          placeholderTextColor={COLORS.text + '80'}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: COLORS.secondary }]}
          onPress={handleSendVerification}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>📧 Send Verification Code</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setAuthMode('login')}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>
          Already have an account? <Text style={styles.toggleButtonTextBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVerificationForm = () => (
    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.verificationInfo}>
        <Text style={styles.verificationTitle}>📧 Verification Code</Text>
        <Text style={styles.verificationDescription}>
          Your 6-digit verification code is:
        </Text>
        <View style={styles.codeDisplay}>
          <Text style={styles.codeText}>{displayedCode}</Text>
        </View>
        <Text style={styles.verificationDescription}>
          Enter this code below to verify your email: {formData.email}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Verification Code</Text>
        <TextInput
          style={styles.input}
          value={formData.verificationCode}
          onChangeText={(value) => handleInputChange('verificationCode', value)}
          placeholder="Enter 6-digit code"
          placeholderTextColor={COLORS.text + '80'}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
        />
        <Text style={styles.verificationHint}>
          💡 The code was shown in the alert above
        </Text>
      </View>

      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: COLORS.success }]}
          onPress={handleVerifyEmail}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>✅ Verify Email</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={[styles.toggleButton, { marginTop: 10 }]}
        onPress={handleSendVerification}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleButtonText, { color: COLORS.primary, fontWeight: '600' }]}>
          🔄 Resend Code
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setAuthMode('signup')}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>← Back to Sign Up</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPasswordForm = () => (
    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Create a password"
          placeholderTextColor={COLORS.text + '80'}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Confirm your password"
          placeholderTextColor={COLORS.text + '80'}
          secureTextEntry
        />
      </View>

      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
          onPress={handleSignup}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setAuthMode('verify')}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>← Back to Verification</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>🧠 MindCandy</Text>
            <Text style={styles.subtitle}>
              {authMode === 'login' && 'Welcome back!'}
              {authMode === 'signup' && 'Join the journey!'}
              {authMode === 'verify' && 'Verify your email!'}
              {authMode === 'password' && 'Set up your password!'}
            </Text>
          </Animated.View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {authMode === 'login' && renderLoginForm()}
          {authMode === 'signup' && renderSignupForm()}
          {authMode === 'verify' && renderVerificationForm()}
          {authMode === 'password' && renderPasswordForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: COLORS.white,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.lightPink,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  toggleButtonTextBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  errorText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  verificationHint: {
    fontSize: 12,
    color: COLORS.text + '80',
    marginTop: 5,
    fontStyle: 'italic',
  },
  verificationInfo: {
    backgroundColor: COLORS.lightBlue + '30',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightBlue,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  verificationDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  codeDisplay: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 4,
  },
});

export default AuthScreen;
