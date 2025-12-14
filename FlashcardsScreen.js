import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Vibration,
  Platform,
  Easing,
  StatusBar,
} from 'react-native';
import { useUser } from './UserContext';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Candy-colored theme colors (same as other screens)
const COLORS = {
  background: '#FCE8F6',    // Light pink background
  primary: '#FF6F61',       // Coral primary
  secondary: '#6B5B95',     // Purple secondary
  accent: '#88B04B',        // Green accent
  text: '#2F2F2F',          // Dark gray text
  white: '#FFFFFF',
  lightPink: '#FFB6C1',
  lightPurple: '#DDA0DD',
  lightYellow: '#FFFACD',
  lightBlue: '#B0E0E6',
  lightGreen: '#98FB98',
  correct: '#4CAF50',
  incorrect: '#F44336',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  streak: '#FF6B35',
};

const FlashcardsScreen = () => {
  const { userProgress, updateProgress } = useUser();
  
  // State for flashcards data
  const [flashcards, setFlashcards] = useState([]);
  
  // State for current card index
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // State for showing answer
  const [showAnswer, setShowAnswer] = useState(false);
  
  // State for card animations
  const [flipAnimation] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(1));
  const [cardRotation] = useState(new Animated.Value(0));
  const [cardTranslateX] = useState(new Animated.Value(0));
  const [cardTranslateY] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));
  const [streakAnimation] = useState(new Animated.Value(0));
  
  // State for score tracking (now derived from userProgress)
  
  // State for study mode
  const [studyMode, setStudyMode] = useState('normal'); // normal, timed, spaced
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimedMode, setIsTimedMode] = useState(false);
  
  // State for particle effects
  const [particles, setParticles] = useState([]);
  
  // State for haptic feedback
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [cardStack, setCardStack] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Derive progress values from userProgress
  const score = userProgress?.flashcardProgress?.score || { correct: 0, total: 0 };
  const streak = userProgress?.flashcardProgress?.streak || 0;
  const bestStreak = userProgress?.flashcardProgress?.bestStreak || 0;
  const level = userProgress?.flashcardProgress?.level || 1;
  const xp = userProgress?.flashcardProgress?.xp || 0;
  const completedCards = new Set(userProgress?.flashcardProgress?.completedCards || []);

  // Load flashcards on component mount
  useEffect(() => {
    loadFlashcards();
    // Initialize progress animation
    Animated.timing(progressAnimation, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, []);

  // Update progress animation when current card changes
  useEffect(() => {
    const progress = flashcards.length > 0 ? (currentCardIndex / flashcards.length) * 100 : 0;
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [currentCardIndex, flashcards.length]);

  // Haptic feedback function
  const triggerHaptic = (type = 'light') => {
    if (!hapticEnabled || Platform.OS === 'web') return;
    
    switch (type) {
      case 'light':
        Vibration.vibrate(50);
        break;
      case 'medium':
        Vibration.vibrate(100);
        break;
      case 'heavy':
        Vibration.vibrate(200);
        break;
      case 'success':
        Vibration.vibrate([0, 50, 100, 50]);
        break;
      case 'error':
        Vibration.vibrate([0, 100, 50, 100]);
        break;
    }
  };

  // Enhanced swipe gesture handling
  const handleSwipeGesture = (event) => {
    if (isAnimating) return;
    
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
    
    // Determine swipe direction
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 50 && velocityX > 0.5) {
        // Swipe right - previous card
        setSwipeDirection('right');
        previousCard();
      } else if (translationX < -50 && velocityX < -0.5) {
        // Swipe left - next card
        setSwipeDirection('left');
        nextCard();
      }
    } else {
      if (translationY > 50 && velocityY > 0.5) {
        // Swipe down - flip card
        setSwipeDirection('down');
        flipCard();
      }
    }
  };

  // Enhanced card entrance animation
  const animateCardEntrance = () => {
    setIsAnimating(true);
    
    // Reset all animations
    cardScale.setValue(0.8);
    cardRotation.setValue(0);
    cardTranslateX.setValue(0);
    cardTranslateY.setValue(50);
    flipAnimation.setValue(0);
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(cardRotation, {
        toValue: 360,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  // Enhanced card exit animation
  const animateCardExit = (direction = 'right') => {
    setIsAnimating(true);
    
    const exitValue = direction === 'right' ? 300 : -300;
    
    Animated.parallel([
      Animated.timing(cardTranslateX, {
        toValue: exitValue,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(cardScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(cardRotation, {
        toValue: direction === 'right' ? 45 : -45,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start(() => {
      resetCardAnimations();
      animateCardEntrance();
    });
  };

  // Particle effect function
  const createParticles = (type) => {
    const newParticles = [];
    const particleCount = type === 'success' ? 15 : 8;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * screenWidth,
        y: screenHeight / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 1,
        color: type === 'success' ? COLORS.correct : COLORS.incorrect,
      });
    }
    
    setParticles(newParticles);
    
    // Animate particles
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.5, // gravity
          life: particle.life - 0.02,
        })).filter(particle => particle.life > 0)
      );
    };
    
    const interval = setInterval(animateParticles, 50);
    setTimeout(() => clearInterval(interval), 2000);
  };

  // Function to load flashcards from MongoDB or JSON
  const loadFlashcards = async () => {
    try {
      // TODO: Replace with actual MongoDB query or API call
      // For now, using comprehensive mental health flashcards
      const mockFlashcards = [
        {
          id: '1',
          question: 'What is the most effective way to manage anxiety in the moment?',
          answer: 'Deep breathing exercises, grounding techniques (5-4-3-2-1 method), and progressive muscle relaxation are highly effective for immediate anxiety relief.',
          category: 'Anxiety Management',
          difficulty: 'Easy',
        },
        {
          id: '2',
          question: 'What are the three components of the cognitive triangle?',
          answer: 'Thoughts, feelings, and behaviors. These three components influence each other and understanding their connection is key to cognitive behavioral therapy.',
          category: 'CBT Basics',
          difficulty: 'Medium',
        },
        {
          id: '3',
          question: 'What is the difference between sadness and depression?',
          answer: 'Sadness is a normal emotion that comes and goes, while depression is a persistent mood disorder lasting at least 2 weeks with multiple symptoms affecting daily functioning.',
          category: 'Mood Disorders',
          difficulty: 'Easy',
        },
        {
          id: '4',
          question: 'What is the 5-4-3-2-1 grounding technique?',
          answer: 'Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This helps ground you in the present moment.',
          category: 'Coping Skills',
          difficulty: 'Easy',
        },
        {
          id: '5',
          question: 'What are the warning signs of a mental health crisis?',
          answer: 'Extreme mood changes, withdrawal from activities, significant changes in sleep/appetite, thoughts of self-harm, increased substance use, and inability to perform daily tasks.',
          category: 'Crisis Awareness',
          difficulty: 'Medium',
        },
        {
          id: '6',
          question: 'What is mindfulness and how does it help mental health?',
          answer: 'Mindfulness is the practice of being fully present in the moment without judgment. It reduces stress, improves emotional regulation, and enhances overall well-being.',
          category: 'Mindfulness',
          difficulty: 'Easy',
        },
        {
          id: '7',
          question: 'What is the difference between a panic attack and an anxiety attack?',
          answer: 'Panic attacks are sudden, intense episodes of fear with physical symptoms that peak within minutes. Anxiety attacks build gradually and can last longer, often triggered by specific stressors.',
          category: 'Anxiety Disorders',
          difficulty: 'Medium',
        },
        {
          id: '8',
          question: 'What are the benefits of regular exercise for mental health?',
          answer: 'Exercise releases endorphins, reduces stress hormones, improves sleep, boosts self-esteem, and can be as effective as medication for mild to moderate depression.',
          category: 'Lifestyle & Wellness',
          difficulty: 'Easy',
        },
        {
          id: '9',
          question: 'What is cognitive restructuring in CBT?',
          answer: 'Cognitive restructuring is the process of identifying, challenging, and replacing negative thought patterns with more balanced, realistic thoughts.',
          category: 'CBT Techniques',
          difficulty: 'Hard',
        },
        {
          id: '10',
          question: 'What are the stages of grief according to Kübler-Ross?',
          answer: 'Denial, Anger, Bargaining, Depression, and Acceptance. Note that these stages are not linear and people may experience them in different orders or revisit stages.',
          category: 'Grief & Loss',
          difficulty: 'Medium',
        },
        {
          id: '11',
          question: 'What is the difference between stress and burnout?',
          answer: 'Stress is a response to pressure, while burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress, often work-related.',
          category: 'Stress Management',
          difficulty: 'Medium',
        },
        {
          id: '12',
          question: 'What are the three types of boundaries in relationships?',
          answer: 'Physical boundaries (personal space), emotional boundaries (protecting your feelings), and time boundaries (managing your time and energy).',
          category: 'Relationships',
          difficulty: 'Easy',
        },
        {
          id: '13',
          question: 'What is the role of sleep in mental health?',
          answer: 'Sleep is crucial for emotional regulation, memory consolidation, and brain detoxification. Poor sleep can worsen anxiety, depression, and other mental health conditions.',
          category: 'Sleep & Mental Health',
          difficulty: 'Easy',
        },
        {
          id: '14',
          question: 'What is the difference between empathy and sympathy?',
          answer: 'Empathy is understanding and sharing another person\'s feelings, while sympathy is feeling pity or sorrow for someone else\'s misfortune without truly understanding their experience.',
          category: 'Communication',
          difficulty: 'Medium',
        },
        {
          id: '15',
          question: 'What are the signs of healthy self-esteem?',
          answer: 'Confidence in your abilities, ability to accept criticism, not being overly dependent on others\' approval, and having a realistic view of your strengths and weaknesses.',
          category: 'Self-Esteem',
          difficulty: 'Easy',
        },
        {
          id: '16',
          question: 'What is the fight-or-flight response?',
          answer: 'A physiological reaction to perceived threats that prepares the body to either confront or flee from danger. It involves the release of stress hormones and activation of the sympathetic nervous system.',
          category: 'Stress Response',
          difficulty: 'Medium',
        },
        {
          id: '17',
          question: 'What are the benefits of journaling for mental health?',
          answer: 'Journaling helps process emotions, reduces stress, improves self-awareness, enhances problem-solving skills, and can serve as a form of self-therapy.',
          category: 'Self-Care',
          difficulty: 'Easy',
        },
        {
          id: '18',
          question: 'What is the difference between a therapist and a psychiatrist?',
          answer: 'Therapists provide talk therapy and counseling, while psychiatrists are medical doctors who can prescribe medication and provide both therapy and medical treatment.',
          category: 'Professional Help',
          difficulty: 'Easy',
        },
        {
          id: '19',
          question: 'What are the warning signs of an eating disorder?',
          answer: 'Extreme weight changes, preoccupation with food/weight, secretive eating behaviors, excessive exercise, body image distortion, and social withdrawal.',
          category: 'Eating Disorders',
          difficulty: 'Medium',
        },
        {
          id: '20',
          question: 'What is the importance of social connections for mental health?',
          answer: 'Social connections provide emotional support, reduce feelings of isolation, boost self-esteem, and can even improve physical health and longevity.',
          category: 'Social Health',
          difficulty: 'Easy',
        },
        {
          id: '21',
          question: 'What is the difference between a phobia and a fear?',
          answer: 'A fear is a normal response to a real threat, while a phobia is an intense, irrational fear of a specific object or situation that poses little or no actual danger.',
          category: 'Anxiety Disorders',
          difficulty: 'Medium',
        },
        {
          id: '22',
          question: 'What are the benefits of meditation for mental health?',
          answer: 'Meditation reduces stress, improves focus, enhances emotional regulation, increases self-awareness, and can help with anxiety, depression, and PTSD symptoms.',
          category: 'Meditation',
          difficulty: 'Easy',
        },
        {
          id: '23',
          question: 'What is the difference between bipolar I and bipolar II?',
          answer: 'Bipolar I involves manic episodes that may require hospitalization, while Bipolar II involves hypomanic episodes (less severe) and major depressive episodes.',
          category: 'Mood Disorders',
          difficulty: 'Hard',
        },
        {
          id: '24',
          question: 'What are the signs of a healthy relationship?',
          answer: 'Mutual respect, trust, open communication, support for each other\'s goals, healthy boundaries, and the ability to resolve conflicts constructively.',
          category: 'Relationships',
          difficulty: 'Easy',
        },
        {
          id: '25',
          question: 'What is the role of nutrition in mental health?',
          answer: 'Proper nutrition supports brain function, affects neurotransmitter production, influences mood, and can help prevent or manage mental health conditions.',
          category: 'Nutrition & Mental Health',
          difficulty: 'Medium',
        },
        {
          id: '26',
          question: 'What are the stages of change in recovery?',
          answer: 'Precontemplation, Contemplation, Preparation, Action, and Maintenance. People may cycle through these stages multiple times during their recovery journey.',
          category: 'Recovery',
          difficulty: 'Medium',
        },
        {
          id: '27',
          question: 'What is the difference between acute and chronic stress?',
          answer: 'Acute stress is short-term and can be beneficial, while chronic stress is long-term and can lead to serious health problems including mental health issues.',
          category: 'Stress Management',
          difficulty: 'Easy',
        },
        {
          id: '28',
          question: 'What are the benefits of therapy for mental health?',
          answer: 'Therapy provides a safe space to explore feelings, learn coping skills, gain self-awareness, improve relationships, and develop strategies for managing mental health challenges.',
          category: 'Therapy',
          difficulty: 'Easy',
        },
        {
          id: '29',
          question: 'What is the difference between a panic disorder and generalized anxiety disorder?',
          answer: 'Panic disorder involves recurrent panic attacks and fear of future attacks, while GAD involves excessive worry about various aspects of life for at least 6 months.',
          category: 'Anxiety Disorders',
          difficulty: 'Hard',
        },
        {
          id: '30',
          question: 'What are the key principles of self-compassion?',
          answer: 'Self-kindness (being gentle with yourself), common humanity (recognizing suffering is part of the human experience), and mindfulness (being present with your emotions without judgment).',
          category: 'Self-Compassion',
          difficulty: 'Medium',
        },
      ];

      setFlashcards(mockFlashcards);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  // Enhanced 3D flip card animation
  const flipCard = () => {
    if (showAnswer) return;
    
    triggerHaptic('light');
    
    // Scale down slightly before flipping
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(flipAnimation, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setShowAnswer(true);
  };



  // Enhanced next card with animations
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      triggerHaptic('light');
      animateCardExit('right');
      
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        resetCardAnimations();
        setTimeout(animateCardEntrance, 100);
      }, 300);
    } else {
      triggerHaptic('success');
      createParticles('success');
      Alert.alert(
        '🎉 Congratulations!', 
        `You've completed all ${flashcards.length} flashcards!\n\nScore: ${score.correct}/${score.total} correct\nStreak: ${streak}\nLevel: ${level}`,
        [{ text: 'Restart', onPress: restartQuiz }]
      );
    }
  };

  // Enhanced previous card with animations
  const previousCard = () => {
    if (currentCardIndex > 0) {
      triggerHaptic('light');
      animateCardExit('left');
      
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
        setShowAnswer(false);
        resetCardAnimations();
        setTimeout(animateCardEntrance, 100);
      }, 300);
    }
  };

  // Reset card animations
  const resetCardAnimations = () => {
    flipAnimation.setValue(0);
    cardScale.setValue(1);
    cardRotation.setValue(0);
    cardTranslateX.setValue(0);
    cardTranslateY.setValue(0);
  };

  // Function to restart quiz
  const restartQuiz = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0 });
    setCompletedCards(new Set());
    flipAnimation.setValue(0);
    
    // Reset progress in database
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

    updateProgress({
      ...currentProgress,
      flashcardProgress: {
        ...currentProgress.flashcardProgress,
        score: { correct: 0, total: 0 },
        streak: 0,
        completedCards: [],
      }
    });
  };

  // Enhanced correct answer with gamification
  const markCorrect = () => {
    if (!completedCards.has(currentCardIndex)) {
      triggerHaptic('success');
      createParticles('success');
      
      const newStreak = streak + 1;
      const newScore = { 
        correct: score.correct + 1, 
        total: score.total + 1 
      };
      const newXp = xp + (newStreak > 5 ? 20 : 10); // Bonus XP for streaks
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Update progress in context
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

      updateProgress({
        ...currentProgress,
        flashcardProgress: {
          ...currentProgress.flashcardProgress,
          score: newScore,
          streak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          xp: newXp,
          level: newLevel,
          completedCards: [...completedCards, currentCardIndex],
        }
      });
      
      // Animate streak counter
      Animated.sequence([
        Animated.timing(streakAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Show streak celebration
      if (newStreak > 0 && newStreak % 5 === 0) {
        Alert.alert(
          '🔥 Streak!',
          `${newStreak} in a row! Keep it up!`,
          [{ text: 'Awesome!' }]
        );
      }
    }
    nextCard();
  };

  // Enhanced incorrect answer with feedback
  const markIncorrect = () => {
    if (!completedCards.has(currentCardIndex)) {
      triggerHaptic('error');
      createParticles('error');
      
      // Update progress in context
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

      updateProgress({
        ...currentProgress,
        flashcardProgress: {
          ...currentProgress.flashcardProgress,
          score: { 
            correct: score.correct, 
            total: score.total + 1 
          },
          streak: 0, // Reset streak
          completedCards: [...completedCards, currentCardIndex],
        }
      });
      
      // Shake animation for incorrect answer
      Animated.sequence([
        Animated.timing(cardTranslateX, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateX, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateX, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateX, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    nextCard();
  };

  // Get current card
  const currentCard = flashcards[currentCardIndex];

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return COLORS.accent;
      case 'Medium': return COLORS.primary;
      case 'Hard': return COLORS.secondary;
      default: return COLORS.text;
    }
  };

  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Particle Effects */}
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life,
              transform: [
                { scale: particle.life },
                { rotate: `${particle.life * 360}deg` },
              ],
            },
          ]}
        />
      ))}
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Enhanced Header with Level and XP */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {level}</Text>
              <View style={styles.xpBar}>
                <Animated.View 
                  style={[
                    styles.xpProgress,
                    { width: `${(xp % 100)}%` }
                  ]}
                />
              </View>
            </View>
            <View style={styles.streakContainer}>
              <Animated.Text 
                style={[
                  styles.streakText,
                  {
                    transform: [{
                      scale: streakAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    }],
                  },
                ]}
              >
                🔥 {streak}
              </Animated.Text>
            </View>
          </View>
          
          <Text style={styles.title}>Mental Health Flashcards</Text>
          <Text style={styles.subtitle}>Test your knowledge and learn</Text>
        </View>

        {/* Enhanced Progress and Score */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Card {currentCardIndex + 1} of {flashcards.length}
            </Text>
            <Text style={styles.scoreText}>
              Score: {score.correct}/{score.total}
            </Text>
          </View>
          
          {/* Animated Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Enhanced 3D Flashcard with Front/Back */}
        <View style={styles.flashcardContainer}>
          <Animated.View 
            style={[
              styles.flashcard,
              {
                transform: [
                  {
                    scale: cardScale,
                  },
                  {
                    rotate: cardRotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  {
                    translateX: cardTranslateX,
                  },
                  {
                    translateY: cardTranslateY,
                  },
                ],
              },
            ]}
            onTouchEnd={(event) => {
              const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
              
              // Swipe gestures
              if (Math.abs(translationX) > Math.abs(translationY)) {
                if (translationX > 50 && velocityX > 0.5) {
                  previousCard();
                } else if (translationX < -50 && velocityX < -0.5) {
                  nextCard();
                }
              } else if (translationY > 50 && velocityY > 0.5) {
                flipCard();
              }
            }}
          >
            {/* Card Shadow */}
            <View style={styles.cardShadow} />
            
            {/* Front of Card (Question) */}
            <Animated.View 
              style={[
                styles.cardSide,
                styles.cardFront,
                {
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0, 0],
                  }),
                  transform: [{
                    rotateY: flipAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCategory}>{currentCard?.category}</Text>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(currentCard?.difficulty) }
                  ]}>
                    <Text style={styles.difficultyText}>{currentCard?.difficulty}</Text>
                  </View>
                </View>
                
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardText}>
                    {currentCard?.question}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.flipButton} 
                  onPress={flipCard}
                  activeOpacity={0.7}
                >
                  <Animated.View style={{
                    transform: [{
                      scale: flipAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 1],
                      }),
                    }],
                  }}>
                    <Text style={styles.flipButtonText}>💡 Show Answer</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* Back of Card (Answer) */}
            <Animated.View 
              style={[
                styles.cardSide,
                styles.cardBack,
                {
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1],
                  }),
                  transform: [{
                    rotateY: flipAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['180deg', '360deg'],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCategory}>{currentCard?.category}</Text>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(currentCard?.difficulty) }
                  ]}>
                    <Text style={styles.difficultyText}>{currentCard?.difficulty}</Text>
                  </View>
                </View>
                
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardText}>
                    {currentCard?.answer}
                  </Text>
                </View>
                
                <View style={styles.answerIndicator}>
                  <Text style={styles.answerIndicatorText}>Answer Revealed</Text>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Enhanced Navigation and Action Buttons */}
        <View style={styles.controlsContainer}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
              onPress={previousCard}
              disabled={currentCardIndex === 0}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, currentCardIndex === 0 && styles.navButtonTextDisabled]}>
                ⬅️ Previous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, currentCardIndex === flashcards.length - 1 && styles.navButtonDisabled]}
              onPress={nextCard}
              disabled={currentCardIndex === flashcards.length - 1}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, currentCardIndex === flashcards.length - 1 && styles.navButtonTextDisabled]}>
                Next ➡️
              </Text>
            </TouchableOpacity>
          </View>

          {showAnswer && (
            <View style={styles.answerButtons}>
              <TouchableOpacity 
                style={styles.incorrectButton} 
                onPress={() => {
                  triggerHaptic('light');
                  markIncorrect();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.answerButtonText}>❌ Incorrect</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.correctButton}
                onPress={() => {
                  triggerHaptic('light');
                  markCorrect();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.answerButtonText}>✅ Correct</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Study Mode Toggle */}
        <View style={styles.studyModeContainer}>
          <Text style={styles.studyModeTitle}>Study Mode</Text>
          <View style={styles.studyModeButtons}>
            <TouchableOpacity 
              style={[styles.studyModeButton, studyMode === 'normal' && styles.studyModeButtonActive]}
              onPress={() => {
                setStudyMode('normal');
                triggerHaptic('light');
              }}
            >
              <Text style={[styles.studyModeButtonText, studyMode === 'normal' && styles.studyModeButtonTextActive]}>
                Normal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.studyModeButton, studyMode === 'timed' && styles.studyModeButtonActive]}
              onPress={() => {
                setStudyMode('timed');
                triggerHaptic('light');
                Alert.alert('⏰ Timed Mode', 'You have 30 seconds per card! Answer quickly!');
              }}
            >
              <Text style={[styles.studyModeButtonText, studyMode === 'timed' && styles.studyModeButtonTextActive]}>
                Timed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.studyModeButton, studyMode === 'spaced' && styles.studyModeButtonActive]}
              onPress={() => {
                setStudyMode('spaced');
                triggerHaptic('light');
                Alert.alert('🧠 Spaced Repetition', 'Cards you get wrong will appear more frequently!');
              }}
            >
              <Text style={[styles.studyModeButtonText, studyMode === 'spaced' && styles.studyModeButtonTextActive]}>
                Spaced
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Restart Button */}
        <TouchableOpacity 
          style={styles.restartButton}
          onPress={() => {
            triggerHaptic('medium');
            restartQuiz();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.restartButtonText}>🔄 Restart Quiz</Text>
        </TouchableOpacity>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.floatingActionButton}
          onPress={() => {
            triggerHaptic('medium');
            flipCard();
          }}
          activeOpacity={0.8}
        >
          <Animated.View style={{
            transform: [{
              rotate: flipAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            }],
          }}>
            <Text style={styles.floatingActionButtonText}>🔄</Text>
          </Animated.View>
        </TouchableOpacity>
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
  
  // Particle Effects
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  
  // Enhanced Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  levelContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  xpBar: {
    width: '80%',
    height: 8,
    backgroundColor: COLORS.lightPink,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  streakContainer: {
    alignItems: 'flex-end',
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.streak,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text + 'CC',
    textAlign: 'center',
  },
  
  // Enhanced Progress
  progressContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightPink,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  // Enhanced Flashcard Styles
  flashcardContainer: {
    alignItems: 'center',
    marginBottom: 40,
    perspective: 1000,
    height: 400, // Fixed height to prevent overlapping
  },
  flashcard: {
    width: '100%',
    maxWidth: 400,
    height: 400, // Fixed height
    borderRadius: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    transformStyle: 'preserve-3d',
  },
  cardShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    opacity: 0.1,
    transform: [{ translateZ: -1 }],
  },
  cardSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    borderRadius: 24,
    padding: 30,
  },
  cardFront: {
    backgroundColor: COLORS.white,
  },
  cardBack: {
    backgroundColor: COLORS.lightBlue,
  },
  cardContent: {
    alignItems: 'center',
    zIndex: 1,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  cardCategory: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 150,
  },
  cardText: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  flipButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
  },
  flipButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerIndicator: {
    backgroundColor: COLORS.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 10,
  },
  answerIndicatorText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Enhanced Controls
  controlsContainer: {
    marginBottom: 40,
    marginTop: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  navButton: {
    backgroundColor: COLORS.lightPurple,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.lightPurple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.lightPink,
    opacity: 0.5,
  },
  navButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: COLORS.text + '80',
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  correctButton: {
    backgroundColor: COLORS.correct,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 30,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: COLORS.correct,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  incorrectButton: {
    backgroundColor: COLORS.incorrect,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 30,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: COLORS.incorrect,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  answerButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Study Mode Styles
  studyModeContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  studyModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  studyModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  studyModeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.lightPink,
    minWidth: 80,
    alignItems: 'center',
  },
  studyModeButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  studyModeButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  studyModeButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  // Enhanced Restart Button
  restartButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  restartButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Floating Action Button
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  floatingActionButtonText: {
    fontSize: 24,
    color: COLORS.white,
  },
});

export default FlashcardsScreen;



