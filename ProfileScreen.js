import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  ScrollView,
  Image,
  TextInput,
  Modal,
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

const ProfileScreen = () => {
  const { user, userProgress, updateProfile, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    username: user?.username || '',
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        username: user.username,
      });
    }
  }, [user]);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      Alert.alert('Success!', 'Profile updated successfully! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const getProfilePicEmoji = () => {
    if (selectedEmoji) return selectedEmoji;
    const emojis = ['🧠', '🌟', '🎯', '💎', '🚀', '🎨', '🎪', '🎭', '🎪', '🎨'];
    const index = user?.id ? parseInt(user.id) % emojis.length : 0;
    return emojis[index];
  };

  const updateProfilePicture = (emoji) => {
    setSelectedEmoji(emoji);
    Alert.alert('Success!', `Profile picture updated to ${emoji}`);
  };

  const getJoinDate = () => {
    if (!user?.joinDate) return 'Unknown';
    const date = new Date(user.joinDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStats = () => {
    if (!userProgress) return { moodEntries: 0, journalEntries: 0, flashcards: 0, streak: 0 };
    
    return {
      moodEntries: userProgress.moodEntries?.length || 0,
      journalEntries: userProgress.journalEntries?.length || 0,
      flashcards: userProgress.flashcardProgress?.completedCards?.length || 0,
      streak: userProgress.flashcardProgress?.streak || 0,
    };
  };

  const stats = getStats();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity 
            style={styles.profilePicContainer}
            onPress={() => Alert.alert('Profile Picture', 'Choose a new profile picture emoji!', [
              { text: '🧠', onPress: () => updateProfilePicture('🧠') },
              { text: '🌟', onPress: () => updateProfilePicture('🌟') },
              { text: '🎯', onPress: () => updateProfilePicture('🎯') },
              { text: '💎', onPress: () => updateProfilePicture('💎') },
              { text: '🚀', onPress: () => updateProfilePicture('🚀') },
              { text: '🎨', onPress: () => updateProfilePicture('🎨') },
              { text: 'Cancel', style: 'cancel' }
            ])}
          >
            <Text style={styles.profilePic}>{getProfilePicEmoji()}</Text>
            <Text style={styles.profilePicHint}>Tap to change</Text>
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
          <Text style={styles.joinDate}>Member since {getJoinDate()}</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.moodEntries}</Text>
              <Text style={styles.statLabel}>Mood Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.journalEntries}</Text>
              <Text style={styles.statLabel}>Journal Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.flashcards}</Text>
              <Text style={styles.statLabel}>Flashcards</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Settings */}
        <Animated.View style={[styles.settingsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>⚙️ Profile Settings</Text>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.name}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, name: value }))}
                  placeholder="Enter your name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editData.username}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, username: value }))}
                  placeholder="Enter username"
                />
              </View>
              
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.settingLabel}>✏️ Edit Profile</Text>
                <Text style={styles.settingArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('Coming Soon!', 'Profile picture upload will be available soon!')}
              >
                <Text style={styles.settingLabel}>🖼️ Change Profile Picture</Text>
                <Text style={styles.settingArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('Coming Soon!', 'Notification settings will be available soon!')}
              >
                <Text style={styles.settingLabel}>🔔 Notifications</Text>
                <Text style={styles.settingArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Alert.alert('Coming Soon!', 'Privacy settings will be available soon!')}
              >
                <Text style={styles.settingLabel}>🔒 Privacy</Text>
                <Text style={styles.settingArrow}>→</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Logout Button */}
        <Animated.View style={[styles.logoutContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? Your progress will be automatically saved.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalLogoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.modalLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profilePic: {
    fontSize: 60,
  },
  profilePicHint: {
    fontSize: 12,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  userUsername: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: COLORS.text + '80',
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text + '80',
    textAlign: 'center',
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingsList: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPink,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingArrow: {
    fontSize: 18,
    color: COLORS.primary,
  },
  editForm: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.lightPink + '30',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightPink + '50',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  logoutContainer: {
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 15,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 400,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text + '80',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.lightPink + '50',
  },
  modalLogoutButton: {
    backgroundColor: COLORS.warning,
  },
  modalCancelText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  modalLogoutText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ProfileScreen;
