import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  ScrollView,
} from 'react-native';
import { useUser } from './UserContext';

const { width, height } = Dimensions.get('window');

// Professional mental health app color palette
const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#4F46E5',
  secondary: '#059669',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const TimeAttackScreen = ({ navigation }) => {
  const { userProgress, updateProgress } = useUser();
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentCard, setCurrentCard] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [aiScore, setAiScore] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Animations
  const cardFlipAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;
  const timeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const flashcards = [
    {
      question: "What is the primary symptom of anxiety?",
      answer: "Excessive worry and fear",
      category: "Anxiety",
      difficulty: "Easy",
      explanation: "Anxiety is characterized by persistent, excessive worry that interferes with daily activities."
    },
    {
      question: "What does CBT stand for?",
      answer: "Cognitive Behavioral Therapy",
      category: "Therapy",
      difficulty: "Medium",
      explanation: "CBT is a type of psychotherapy that focuses on changing negative thought patterns."
    },
    {
      question: "What is mindfulness?",
      answer: "Present-moment awareness without judgment",
      category: "Mindfulness",
      difficulty: "Medium",
      explanation: "Mindfulness involves paying attention to the present moment with acceptance and without judgment."
    },
    {
      question: "What is the fight-or-flight response?",
      answer: "Automatic physiological reaction to perceived threat",
      category: "Psychology",
      difficulty: "Hard",
      explanation: "This is an automatic response that prepares the body to either fight or flee from danger."
    },
    {
      question: "What are the 5 stages of grief?",
      answer: "Denial, Anger, Bargaining, Depression, Acceptance",
      category: "Grief",
      difficulty: "Hard",
      explanation: "These stages, proposed by Kübler-Ross, describe the emotional process of dealing with loss."
    },
    {
      question: "What is depression?",
      answer: "Persistent feeling of sadness and loss of interest",
      category: "Depression",
      difficulty: "Easy",
      explanation: "Depression is a mood disorder that causes persistent feelings of sadness and loss of interest."
    },
    {
      question: "What is a panic attack?",
      answer: "Sudden intense fear with physical symptoms",
      category: "Anxiety",
      difficulty: "Medium",
      explanation: "A panic attack is a sudden episode of intense fear that triggers severe physical reactions."
    },
    {
      question: "What is self-care?",
      answer: "Activities that promote physical and mental well-being",
      category: "Wellness",
      difficulty: "Easy",
      explanation: "Self-care involves taking actions to maintain and improve your own health and well-being."
    },
    {
      question: "What is emotional regulation?",
      answer: "Ability to manage and respond to emotions effectively",
      category: "Emotions",
      difficulty: "Hard",
      explanation: "Emotional regulation is the ability to manage and respond to emotional experiences in a healthy way."
    },
    {
      question: "What is the amygdala responsible for?",
      answer: "Processing fear and emotional responses",
      category: "Neuroscience",
      difficulty: "Hard",
      explanation: "The amygdala is a brain region that processes emotions, particularly fear and threat detection."
    },
    {
      question: "What is stress?",
      answer: "Body's response to demands or pressure",
      category: "Stress",
      difficulty: "Easy",
      explanation: "Stress is the body's natural response to any demand or challenge."
    },
    {
      question: "What is resilience?",
      answer: "Ability to bounce back from adversity",
      category: "Resilience",
      difficulty: "Medium",
      explanation: "Resilience is the ability to adapt and recover from difficult life experiences."
    },
    {
      question: "What is meditation?",
      answer: "Practice of focused attention and awareness",
      category: "Mindfulness",
      difficulty: "Easy",
      explanation: "Meditation is a practice where an individual uses techniques to focus attention and awareness."
    },
    {
      question: "What is therapy?",
      answer: "Treatment for mental health conditions",
      category: "Therapy",
      difficulty: "Easy",
      explanation: "Therapy is a form of treatment that helps people with mental health conditions."
    },
    {
      question: "What is burnout?",
      answer: "State of emotional, physical, and mental exhaustion",
      category: "Stress",
      difficulty: "Medium",
      explanation: "Burnout is a state of chronic stress that leads to physical and emotional exhaustion."
    }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && currentCard) {
      // AI thinking time
      const aiDelay = Math.random() * 2000 + 1000; // 1-3 seconds
      setAiThinking(true);
      
      setTimeout(() => {
        setAiThinking(false);
        const aiCorrect = Math.random() < 0.75; // 75% chance AI gets it right
        if (aiCorrect) {
          setAiScore(prev => prev + 10);
          addToBattleLog('🤖 AI answered correctly!', COLORS.warning);
        } else {
          addToBattleLog('🤖 AI missed this one!', COLORS.success);
        }
      }, aiDelay);
    }
  }, [currentCard]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setAiScore(0);
    setCardIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setBattleLog([]);
    nextCard();
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const nextCard = () => {
    if (cardIndex >= flashcards.length) {
      endGame();
      return;
    }
    
    const card = flashcards[cardIndex];
    setCurrentCard(card);
    setIsFlipped(false);
    setShowAnswer(false);
    cardFlipAnim.setValue(0);
    
    // Auto-flip after 4 seconds
    setTimeout(() => {
      if (gameState === 'playing') {
        flipCard();
      }
    }, 4000);
  };

  const flipCard = () => {
    if (isFlipped) return;
    
    Animated.sequence([
      Animated.timing(cardFlipAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardFlipAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setIsFlipped(true);
    setShowAnswer(true);
  };

  const handleAnswer = (correct) => {
    if (gameState !== 'playing') return;
    
    setQuestionsAnswered(prev => prev + 1);
    
    const points = correct ? 10 + (streak * 2) : 0;
    setScore(prev => prev + points);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      addToBattleLog(`✅ Correct! +${points} points (Streak: ${streak + 1})`, COLORS.success);
      
      // Animate score increase
      Animated.sequence([
        Animated.timing(scoreAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animate streak
      Animated.sequence([
        Animated.timing(streakAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      Vibration.vibrate(100);
    } else {
      setStreak(0);
      addToBattleLog('❌ Wrong answer! Streak broken.', COLORS.warning);
      
      // Animate time warning
      Animated.sequence([
        Animated.timing(timeAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(timeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Move to next card after a short delay
    setTimeout(() => {
      setCardIndex(prev => prev + 1);
      nextCard();
    }, 1500);
  };

  const addToBattleLog = (message, color = COLORS.textPrimary) => {
    setBattleLog(prev => [...prev, { message, color, timestamp: Date.now() }]);
  };

  const endGame = async () => {
    setGameState('finished');
    const userWon = score > aiScore;
    const timeUp = timeLeft <= 0;
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    if (userWon) {
      addToBattleLog('🎉 VICTORY! You beat the AI!', COLORS.success);
      const xpGained = 75 + (streak * 5) + Math.floor(accuracy / 10);
      addToBattleLog(`+${xpGained} XP for winning!`, COLORS.accent);
      await saveXP(xpGained);
    } else if (timeUp) {
      addToBattleLog('⏰ Time\'s up! Game over!', COLORS.textPrimary);
      const xpGained = Math.max(10, Math.floor(score / 5) + Math.floor(accuracy / 20));
      addToBattleLog(`+${xpGained} XP for your effort!`, COLORS.accent);
      await saveXP(xpGained);
    } else {
      addToBattleLog('🤖 AI won this round!', COLORS.warning);
      const xpGained = Math.max(5, Math.floor(score / 10) + Math.floor(accuracy / 30));
      addToBattleLog(`+${xpGained} XP for participation!`, COLORS.accent);
      await saveXP(xpGained);
    }
  };

  const saveXP = async (xpAmount) => {
    if (!userProgress || !updateProgress) return;
    
    const currentXP = userProgress.flashcardProgress.xp || 0;
    const currentLevel = userProgress.flashcardProgress.level || 1;
    const currentStreak = userProgress.flashcardProgress.streak || 0;
    
    const newXP = currentXP + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const newStreak = Math.max(currentStreak, streak);
    
    await updateProgress({
      flashcardProgress: {
        ...userProgress.flashcardProgress,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
      }
    });
  };

  const renderCard = () => {
    if (!currentCard) return null;

    const frontInterpolate = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '90deg', '180deg'],
    });

    const backInterpolate = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['180deg', '270deg', '360deg'],
    });

    const frontOpacity = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    });

    const backOpacity = cardFlipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { 
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity
            }
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCategory}>{currentCard.category}</Text>
              <Text style={styles.cardDifficulty}>{currentCard.difficulty}</Text>
            </View>
            <Text style={styles.cardQuestion}>{currentCard.question}</Text>
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={flipCard}
              disabled={isFlipped}
            >
              <Text style={styles.flipButtonText}>
                {isFlipped ? 'Flipped!' : 'Tap to Reveal Answer'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { 
              transform: [{ rotateY: backInterpolate }],
              opacity: backOpacity
            }
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardAnswer}>{currentCard.answer}</Text>
            <Text style={styles.cardExplanation}>{currentCard.explanation}</Text>
            <View style={styles.answerButtons}>
              <TouchableOpacity 
                style={[styles.answerButton, styles.correctButton]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.answerButtonText}>✅ Correct</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.answerButton, styles.incorrectButton]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.answerButtonText}>❌ Wrong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Speed Challenge</Text>
        <Text style={styles.subtitle}>Answer as many questions as possible in 60 seconds!</Text>
        
        {gameState === 'waiting' && (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>🚀 Start Challenge</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Game Stats */}
      {gameState === 'playing' && (
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.statItem, { transform: [{ scale: timeAnim }] }]}>
            <Text style={styles.statValue}>{timeLeft}s</Text>
            <Text style={styles.statLabel}>Time Left</Text>
          </Animated.View>
          <Animated.View style={[styles.statItem, { transform: [{ scale: scoreAnim }] }]}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Your Score</Text>
          </Animated.View>
          <Animated.View style={[styles.statItem, { transform: [{ scale: streakAnim }] }]}>
            <Text style={styles.statValue}>{streak} 🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </Animated.View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{aiScore}</Text>
            <Text style={styles.statLabel}>AI Score</Text>
          </View>
        </Animated.View>
      )}

      {/* Game Card */}
      {gameState === 'playing' && renderCard()}

      {/* AI Status */}
      {gameState === 'playing' && aiThinking && (
        <Animated.View style={[styles.aiThinkingContainer, { opacity: fadeAnim }]}>
          <Text style={styles.aiThinkingText}>🤖 AI is thinking...</Text>
        </Animated.View>
      )}

      {/* Battle Log */}
      {battleLog.length > 0 && (
        <Animated.View style={[styles.battleLogContainer, { opacity: fadeAnim }]}>
          <Text style={styles.battleLogTitle}>📝 Game Log</Text>
          <ScrollView style={styles.battleLog} showsVerticalScrollIndicator={false}>
            {battleLog.map((entry, index) => (
              <Text key={index} style={[styles.battleLogEntry, { color: entry.color }]}>
                {entry.message}
              </Text>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Game Over */}
      {gameState === 'finished' && (
        <Animated.View style={[styles.gameOverContainer, { opacity: fadeAnim }]}>
          <Text style={styles.gameOverTitle}>🎮 Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.aiScore}>AI Score: {aiScore}</Text>
          <Text style={styles.finalStreak}>Best Streak: {streak}</Text>
          <Text style={styles.accuracy}>Accuracy: {Math.round((correctAnswers / questionsAnswered) * 100)}%</Text>
          
          <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
            <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back to Games</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    width: width - 40,
    height: 350,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: COLORS.primary,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBack: {
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface + 'CC',
    backgroundColor: COLORS.surface + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDifficulty: {
    fontSize: 12,
    color: COLORS.surface + 'AA',
    fontWeight: '500',
  },
  cardQuestion: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  cardAnswer: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 26,
  },
  cardExplanation: {
    fontSize: 14,
    color: COLORS.surface + 'CC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  flipButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  flipButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  answerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
  },
  correctButton: {
    backgroundColor: COLORS.success,
  },
  incorrectButton: {
    backgroundColor: COLORS.error,
  },
  answerButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  aiThinkingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  aiThinkingText: {
    fontSize: 16,
    color: COLORS.warning,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  battleLogContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  battleLogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  battleLog: {
    maxHeight: 150,
  },
  battleLogEntry: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
    fontWeight: '500',
  },
  gameOverContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 10,
    fontWeight: '600',
  },
  aiScore: {
    fontSize: 18,
    color: COLORS.warning,
    marginBottom: 10,
    fontWeight: '600',
  },
  finalStreak: {
    fontSize: 16,
    color: COLORS.accent,
    marginBottom: 10,
    fontWeight: '600',
  },
  accuracy: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 30,
    fontWeight: '600',
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playAgainButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimeAttackScreen;