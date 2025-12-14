import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useUser } from './UserContext';

const { width, height } = Dimensions.get('window');

// Candy Crush Color Palette
const COLORS = {
  background: '#FCE8F6',
  primary: '#FF6F61',
  secondary: '#6B5B95',
  accent: '#88B04B',
  text: '#2F2F2F',
  white: '#FFFFFF',
  lightPurple: '#E6E6FA',
  lightBlue: '#B8E6B8',
  lightPink: '#FFB6C1',
  success: '#4CAF50',
  error: '#F44336',
  input: '#F8F9FA',
  border: '#E0E0E0',
};

const LoginScreen = () => {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation refs
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
        tension: 100,
        friction: 8,
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
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    handleBounce();

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Mock user data
      const userData = {
        id: '1',
        name: name || 'User',
        email: email,
        joinDate: new Date().toISOString(),
      };
      
      login(userData);
    }, 1500);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    handleBounce();

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Mock user data
      const userData = {
        id: '1',
        name: name,
        email: email,
        joinDate: new Date().toISOString(),
      };
      
      login(userData);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🧠 MindCandy</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Join the journey!'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.text + '80'}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.text + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.text + '80'}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.text + '80'}
                  secureTextEntry
                />
              </View>
            )}

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? '⏳ Processing...' : (isLogin ? '🎯 Login' : '🚀 Sign Up')}
                </Text>
              </TouchableOpacity>
            </Animated.View>


            {/* Toggle Auth Mode */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Login"
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features Preview */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>✨ What you'll get:</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>📊 Track your mood and progress</Text>
              <Text style={styles.featureItem}>🎮 Gamified learning with flashcards</Text>
              <Text style={styles.featureItem}>🤖 AI mental health assistant</Text>
              <Text style={styles.featureItem}>📍 Find nearby mental health resources</Text>
              <Text style={styles.featureItem}>👥 Connect with peer support circles</Text>
            </View>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: COLORS.secondary,
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
    marginBottom: 30,
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
    backgroundColor: COLORS.input,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.primary + '80',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  toggleButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  features: {
    backgroundColor: COLORS.lightPurple,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
});

export default LoginScreen;
