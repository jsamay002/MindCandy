import React, { createContext, useContext, useState, useEffect } from 'react';
import DatabaseService from './DatabaseService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);

  // Load user data on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Check if user is stored in session
      const savedUserId = localStorage.getItem('mindcandy_current_user_id');
      
      if (savedUserId) {
        const userData = DatabaseService.getUserById(savedUserId);
        const progressData = DatabaseService.getUserProgress(savedUserId);
        
        if (userData) {
          setUser(userData);
          setUserProgress(progressData);
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (email) => {
    const code = DatabaseService.generateVerificationCode();
    await DatabaseService.sendVerificationEmail(email, code);
    return code; // For demo purposes, return the code
  };

  const verifyEmail = async (email, code) => {
    return await DatabaseService.verifyEmailCode(email, code);
  };

  const register = async (userData) => {
    try {
      const newUser = await DatabaseService.registerUser(userData);
      const progress = DatabaseService.getUserProgress(newUser.id);
      
      setUser(newUser);
      setUserProgress(progress);
      
      // Store current user ID
      localStorage.setItem('mindcandy_current_user_id', newUser.id);
      
      // Clean up verification code
      await DatabaseService.deleteVerificationCode(userData.email);
      
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const login = async (loginData) => {
    try {
      const userData = await DatabaseService.loginUser(loginData);
      const progress = DatabaseService.getUserProgress(userData.id);
      
      setUser(userData);
      setUserProgress(progress);
      
      // Store current user ID
      localStorage.setItem('mindcandy_current_user_id', userData.id);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      await DatabaseService.logoutUser(user.id);
    }
    
    setUser(null);
    setUserProgress(null);
    localStorage.removeItem('mindcandy_current_user_id');
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = await DatabaseService.updateUserProfile(user.id, profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const updateProgress = async (progressData) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProgress = await DatabaseService.updateUserProgress(user.id, progressData);
      setUserProgress(updatedProgress);
      return updatedProgress;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userProgress,
    isLoading,
    sendVerificationCode,
    verifyEmail,
    register,
    login,
    logout,
    updateProfile,
    updateProgress,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};