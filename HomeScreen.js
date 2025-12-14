import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useUser } from './UserContext';

// Candy Crush-inspired vibrant colors
const COLORS = {
  background: '#FFE4E6',    // Soft pink gradient start
  backgroundEnd: '#FFF0F5', // Soft pink gradient end
  primary: '#FF69B4',       // Hot pink (Candy Crush style)
  secondary: '#9B59B6',     // Purple
  accent: '#FFD700',        // Gold yellow
  success: '#00FF7F',       // Spring green
  warning: '#FF6347',       // Tomato red
  text: '#2C3E50',          // Dark blue-gray
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

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const { user, userProgress, updateProgress } = useUser();
  
  // State for mood selection
  const [selectedMood, setSelectedMood] = useState(null);
  
  // State for journal entry
  const [journalEntry, setJournalEntry] = useState('');
  
  // State for last journal entry preview
  const [lastEntry, setLastEntry] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Mood options with emojis and vibrant Candy Crush colors
  const moodOptions = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: COLORS.accent, shadowColor: '#FFD700' },
    { id: 'sad', emoji: '😔', label: 'Sad', color: COLORS.lightBlue, shadowColor: '#87CEEB' },
    { id: 'angry', emoji: '😡', label: 'Angry', color: COLORS.warning, shadowColor: '#FF6347' },
  ];

  // Load last journal entry on component mount and start animations
  useEffect(() => {
    loadLastEntry();
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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

  // Function to handle mood selection with animation
  const handleMoodSelection = (moodId) => {
    setSelectedMood(moodId);
    
    // Bounce animation when mood is selected
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to load the last journal entry (placeholder for MongoDB integration)
  const loadLastEntry = async () => {
    try {
      // Get the most recent journal entry from user progress
      if (userProgress.journalEntries.length > 0) {
        const latestEntry = userProgress.journalEntries[0];
        setLastEntry({
          mood: latestEntry.mood,
          journal: latestEntry.content,
          date: new Date(latestEntry.date).toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error('Error loading last entry:', error);
    }
  };

  // Function to save mood and journal entry to MongoDB
  const saveEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Please select a mood', 'Choose how you\'re feeling today before submitting.');
      return;
    }

    if (!journalEntry.trim()) {
      Alert.alert('Please write something', 'Share your thoughts in the journal section.');
      return;
    }

    try {
      // Update progress with both mood and journal entries
      const currentProgress = userProgress || {
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

      await updateProgress({
        ...currentProgress,
        moodEntries: [...(currentProgress.moodEntries || []), {
          mood: selectedMood,
          note: journalEntry.trim(),
          date: new Date().toISOString(),
        }],
        journalEntries: [...(currentProgress.journalEntries || []), {
          content: journalEntry.trim(),
          mood: selectedMood,
          date: new Date().toISOString(),
        }],
      });

      // Update last entry preview
      setLastEntry({
        mood: selectedMood,
        journal: journalEntry.trim(),
        date: new Date().toLocaleDateString(),
      });

      // Reset form
      setSelectedMood(null);
      setJournalEntry('');
      
      Alert.alert('Success!', 'Your mood and journal entry have been saved.');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    }
  };

  // Function to get mood emoji by ID
  const getMoodEmoji = (moodId) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? mood.emoji : '😊';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.title}>🍭 How are you feeling today? 🍭</Text>
          <Text style={styles.subtitle}>Take a moment to check in with yourself ✨</Text>
        </Animated.View>

        {/* Animated Mood Selection */}
        <Animated.View 
          style={[
            styles.moodSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>✨ Select your mood ✨</Text>
          <View style={styles.moodButtonsContainer}>
            {moodOptions.map((mood, index) => (
              <Animated.View
                key={mood.id}
                style={[
                  {
                    transform: [
                      { scale: selectedMood === mood.id ? bounceAnim : 1 }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodButton,
                    { 
                      backgroundColor: mood.color,
                      shadowColor: mood.shadowColor,
                    },
                    selectedMood === mood.id && styles.selectedMoodButton,
                  ]}
                  onPress={() => handleMoodSelection(mood.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.selectedMoodLabel,
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Animated Journal Section */}
        <Animated.View 
          style={[
            styles.journalSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📝 Journal your thoughts 📝</Text>
          <Animated.View style={styles.journalInputContainer}>
            <TextInput
              style={styles.journalInput}
              placeholder="How was your day? What's on your mind? ✨"
              placeholderTextColor={COLORS.text + '80'}
              value={journalEntry}
              onChangeText={setJournalEntry}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Animated.View>
        </Animated.View>

        {/* Animated Submit Button */}
        <Animated.View
          style={[
            styles.submitButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={saveEntry}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>💾 Save My Entry 💾</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Animated Last Entry Preview */}
        {lastEntry && (
          <Animated.View 
            style={[
              styles.lastEntrySection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>📖 Your last entry 📖</Text>
            <View style={styles.lastEntryCard}>
              <View style={styles.lastEntryHeader}>
                <Text style={styles.lastEntryMood}>
                  {getMoodEmoji(lastEntry.mood)} {lastEntry.mood.charAt(0).toUpperCase() + lastEntry.mood.slice(1)}
                </Text>
                <Text style={styles.lastEntryDate}>{lastEntry.date}</Text>
              </View>
              <Text style={styles.lastEntryText}>{lastEntry.journal}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  moodSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  moodButton: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 30,
    minWidth: 120,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  selectedMoodButton: {
    borderWidth: 5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  moodEmoji: {
    fontSize: 50,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedMoodLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  journalSection: {
    marginBottom: 40,
  },
  journalInputContainer: {
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  journalInput: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 4,
    borderColor: COLORS.lavender,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 120,
  },
  submitButtonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  lastEntrySection: {
    marginBottom: 30,
  },
  lastEntryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 25,
    borderWidth: 4,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  lastEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lastEntryMood: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lastEntryDate: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  lastEntryText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});

export default HomeScreen;
