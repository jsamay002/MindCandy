import { Platform } from 'react-native';

// Database service for managing user data, verification codes, and progress
class DatabaseService {
  constructor() {
    this.users = new Map();
    this.verificationCodes = new Map();
    this.userProgress = new Map();
    this.loadFromStorage();
  }

  // Load data from localStorage on web or AsyncStorage on mobile
  async loadFromStorage() {
    try {
      if (Platform.OS === 'web') {
        const usersData = localStorage.getItem('mindcandy_users');
        const codesData = localStorage.getItem('mindcandy_verification_codes');
        const progressData = localStorage.getItem('mindcandy_user_progress');

        if (usersData) this.users = new Map(JSON.parse(usersData));
        if (codesData) this.verificationCodes = new Map(JSON.parse(codesData));
        if (progressData) this.userProgress = new Map(JSON.parse(progressData));
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const usersData = await AsyncStorage.getItem('mindcandy_users');
        const codesData = await AsyncStorage.getItem('mindcandy_verification_codes');
        const progressData = await AsyncStorage.getItem('mindcandy_user_progress');

        if (usersData) this.users = new Map(JSON.parse(usersData));
        if (codesData) this.verificationCodes = new Map(JSON.parse(codesData));
        if (progressData) this.userProgress = new Map(JSON.parse(progressData));
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  // Save data to storage
  async saveToStorage() {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('mindcandy_users', JSON.stringify([...this.users]));
        localStorage.setItem('mindcandy_verification_codes', JSON.stringify([...this.verificationCodes]));
        localStorage.setItem('mindcandy_user_progress', JSON.stringify([...this.userProgress]));
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('mindcandy_users', JSON.stringify([...this.users]));
        await AsyncStorage.setItem('mindcandy_verification_codes', JSON.stringify([...this.verificationCodes]));
        await AsyncStorage.setItem('mindcandy_user_progress', JSON.stringify([...this.userProgress]));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification email (simulated)
  async sendVerificationEmail(email, code) {
    // In a real app, this would send an actual email
    // For now, we'll simulate it and store the code
    this.verificationCodes.set(email, {
      code,
      timestamp: Date.now(),
      verified: false
    });
    await this.saveToStorage();
    
    // Simulate email delay and return the code
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(code);
      }, 1000);
    });
  }

  // Verify email code
  async verifyEmailCode(email, code) {
    const storedCode = this.verificationCodes.get(email);
    if (!storedCode) return false;
    
    // Check if code is still valid (5 minutes)
    const isExpired = Date.now() - storedCode.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      this.verificationCodes.delete(email);
      await this.saveToStorage();
      return false;
    }
    
    if (storedCode.code === code) {
      storedCode.verified = true;
      await this.saveToStorage();
      return true;
    }
    
    return false;
  }

  // Check if email is verified
  isEmailVerified(email) {
    const storedCode = this.verificationCodes.get(email);
    return storedCode && storedCode.verified;
  }

  // Register new user
  async registerUser(userData) {
    const { email, username, password, name } = userData;
    
    // Check if email already exists
    for (let [key, user] of this.users) {
      if (user.email === email) {
        throw new Error('Email already registered');
      }
      if (user.username === username) {
        throw new Error('Username already taken');
      }
    }
    
    // Check if email is verified
    if (!this.isEmailVerified(email)) {
      throw new Error('Email not verified');
    }
    
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      email,
      username,
      password, // In real app, this would be hashed
      name,
      profilePic: null,
      joinDate: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    this.users.set(userId, newUser);
    
    // Initialize user progress
    this.userProgress.set(userId, {
      moodEntries: [],
      journalEntries: [],
      flashcardProgress: {
        completedCards: [],
        score: { correct: 0, total: 0 },
        streak: 0,
        bestStreak: 0,
        level: 1,
        xp: 0,
      },
      studySessions: [],
      achievements: [],
      settings: {
        notifications: true,
        theme: 'candy',
        hapticFeedback: true,
      }
    });
    
    await this.saveToStorage();
    return newUser;
  }

  // Login user
  async loginUser(loginData) {
    const { username, password } = loginData;
    
    // Find user by username or email
    let user = null;
    for (let [key, u] of this.users) {
      if (u.username === username || u.email === username) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== password) {
      throw new Error('Invalid password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    this.users.set(user.id, user);
    await this.saveToStorage();
    
    return user;
  }

  // Get user by ID
  getUserById(userId) {
    return this.users.get(userId);
  }

  // Get user progress
  getUserProgress(userId) {
    return this.userProgress.get(userId) || {
      moodEntries: [],
      journalEntries: [],
      flashcardProgress: {
        completedCards: [],
        score: { correct: 0, total: 0 },
        streak: 0,
        bestStreak: 0,
        level: 1,
        xp: 0,
      },
      studySessions: [],
      achievements: [],
      settings: {
        notifications: true,
        theme: 'candy',
        hapticFeedback: true,
      }
    };
  }

  // Update user progress
  async updateUserProgress(userId, progressData) {
    const currentProgress = this.getUserProgress(userId);
    
    // Deep merge the progress data, especially for nested objects like flashcardProgress
    const updatedProgress = {
      ...currentProgress,
      ...progressData,
      flashcardProgress: {
        ...currentProgress.flashcardProgress,
        ...progressData.flashcardProgress,
      }
    };
    
    this.userProgress.set(userId, updatedProgress);
    await this.saveToStorage();
    return updatedProgress;
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...profileData };
    this.users.set(userId, updatedUser);
    await this.saveToStorage();
    return updatedUser;
  }

  // Logout user (just update last activity)
  async logoutUser(userId) {
    const user = this.getUserById(userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.users.set(userId, user);
      await this.saveToStorage();
    }
  }

  // Delete verification code after successful registration
  async deleteVerificationCode(email) {
    this.verificationCodes.delete(email);
    await this.saveToStorage();
  }
}

// Export singleton instance
export default new DatabaseService();
