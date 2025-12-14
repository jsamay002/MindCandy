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

// Candy Crush-inspired vibrant colors
const COLORS = {
  background: '#FFE4E6',
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
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const FlashcardBattleScreen = ({ navigation }) => {
  const { userProgress, updateProgress } = useUser();
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentCard, setCurrentCard] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [userHP, setUserHP] = useState(100);
  const [aiHP, setAiHP] = useState(100);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [battleLog, setBattleLog] = useState([]);

  // Animation refs
  const cardFlipAnim = useRef(new Animated.Value(0)).current;
  const userHpAnim = useRef(new Animated.Value(1)).current;
  const aiHpAnim = useRef(new Animated.Value(1)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  const damageAnim = useRef(new Animated.Value(0)).current;

  const flashcards = [
    {
      id: 1,
      question: "What is the 5-4-3-2-1 grounding technique?",
      answer: "A grounding technique where you identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
      category: "Anxiety Management",
      difficulty: "Easy"
    },
    {
      id: 2,
      question: "What does CBT stand for?",
      answer: "Cognitive Behavioral Therapy - a type of psychotherapy that focuses on changing negative thought patterns.",
      category: "Therapy",
      difficulty: "Medium"
    },
    {
      id: 3,
      question: "What is the fight-or-flight response?",
      answer: "An automatic physiological reaction to perceived threat that prepares the body to either fight or flee.",
      category: "Psychology",
      difficulty: "Easy"
    },
    {
      id: 4,
      question: "What are the main symptoms of depression?",
      answer: "Persistent sadness, loss of interest, fatigue, sleep changes, appetite changes, concentration problems, feelings of worthlessness, and suicidal thoughts.",
      category: "Depression",
      difficulty: "Medium"
    },
    {
      id: 5,
      question: "What is mindfulness?",
      answer: "The practice of being fully present and aware of the current moment without judgment.",
      category: "Mindfulness",
      difficulty: "Easy"
    },
    {
      id: 6,
      question: "What is the difference between anxiety and panic?",
      answer: "Anxiety is a general feeling of worry or unease, while panic is an intense, sudden episode of fear with physical symptoms.",
      category: "Anxiety",
      difficulty: "Hard"
    },
    {
      id: 7,
      question: "What are the benefits of deep breathing?",
      answer: "Activates the parasympathetic nervous system, reduces stress hormones, lowers blood pressure, and promotes relaxation.",
      category: "Breathing",
      difficulty: "Easy"
    },
    {
      id: 8,
      question: "What is cognitive restructuring?",
      answer: "A CBT technique that involves identifying and challenging negative thought patterns to replace them with more balanced thoughts.",
      category: "CBT",
      difficulty: "Hard"
    }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
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
      const aiDelay = Math.random() * 3000 + 1000; // 1-4 seconds
      setAiThinking(true);
      
      setTimeout(() => {
        setAiThinking(false);
        const aiCorrect = Math.random() < 0.7; // 70% chance AI gets it right
        if (aiCorrect) {
          handleAICorrect();
        } else {
          handleAIIncorrect();
        }
      }, aiDelay);
    }
  }, [currentCard, gameState]);

  const startGame = () => {
    setGameState('playing');
    setUserHP(100);
    setAiHP(100);
    setUserScore(0);
    setAiScore(0);
    setCombo(0);
    setTimeLeft(30);
    setCardIndex(0);
    setBattleLog([]);
    setIsFlipped(false);
    cardFlipAnim.setValue(0);
    nextCard();
  };

  const nextCard = () => {
    if (cardIndex < flashcards.length) {
      setCurrentCard(flashcards[cardIndex]);
      setIsFlipped(false);
      // Reset card flip animation
      cardFlipAnim.setValue(0);
      // Auto-flip after a short delay
      setTimeout(() => {
        flipCard();
      }, 500);
    } else {
      endGame();
    }
  };

  const flipCard = () => {
    if (isFlipped) return; // Prevent multiple flips
    
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
  };

  const handleUserAnswer = (isCorrect) => {
    if (isCorrect) {
      const damage = Math.floor(20 + (combo * 2));
      setAiHP(prev => {
        const newHP = Math.max(0, prev - damage);
        // Check if AI is defeated
        if (newHP <= 0) {
          setTimeout(() => endGame(), 1000);
        }
        return newHP;
      });
      setUserScore(prev => prev + 10 + combo);
      setCombo(prev => prev + 1);
      
      // Animate combo
      Animated.sequence([
        Animated.timing(comboAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(comboAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate AI HP damage
      animateDamage();
      
      addToBattleLog(`You dealt ${damage} damage! (Combo x${combo + 1})`, COLORS.success);
      if (Vibration && Vibration.vibrate) {
        Vibration.vibrate(100);
      }
    } else {
      setCombo(0);
      addToBattleLog('Miss! Combo broken!', COLORS.warning);
    }
    
    setCardIndex(prev => prev + 1);
    setTimeout(() => {
      if (cardIndex + 1 < flashcards.length && gameState === 'playing') {
        nextCard();
      } else if (gameState === 'playing') {
        endGame();
      }
    }, 1000);
  };

  const handleAICorrect = () => {
    const damage = Math.floor(15 + Math.random() * 10);
    setUserHP(prev => {
      const newHP = Math.max(0, prev - damage);
      // Check if user is defeated
      if (newHP <= 0) {
        setTimeout(() => endGame(), 1000);
      }
      return newHP;
    });
    setAiScore(prev => prev + 10);
    
    addToBattleLog(`AI dealt ${damage} damage!`, COLORS.warning);
    
    // Animate user HP damage
    Animated.sequence([
      Animated.timing(userHpAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(userHpAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAIIncorrect = () => {
    addToBattleLog('AI missed!', COLORS.lightBlue);
  };

  const animateDamage = () => {
    Animated.sequence([
      Animated.timing(damageAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(damageAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addToBattleLog = (message, color = COLORS.text) => {
    setBattleLog(prev => [...prev, { message, color, timestamp: Date.now() }]);
  };

  const endGame = async () => {
    setGameState('finished');
    const userWon = userHP > 0 && (aiHP <= 0 || userScore > aiScore);
    const aiWon = aiHP > 0 && userHP <= 0;
    const timeUp = timeLeft <= 0;
    
    if (userWon) {
      addToBattleLog('🎉 VICTORY! You defeated the AI!', COLORS.success);
      // Award XP and coins for winning
      const xpGained = 50 + (combo * 5);
      const coinsGained = 25 + (combo * 2);
      addToBattleLog(`+${xpGained} XP, +${coinsGained} Coins!`, COLORS.accent);
      
      // Save XP to database
      await saveXP(xpGained);
    } else if (aiWon) {
      addToBattleLog('💀 DEFEAT! The AI won this round!', COLORS.warning);
      // Still give some XP for participation
      const xpGained = Math.max(10, Math.floor(userScore / 10));
      addToBattleLog(`+${xpGained} XP for participation`, COLORS.accent);
      
      // Save XP to database
      await saveXP(xpGained);
    } else if (timeUp) {
      addToBattleLog('⏰ Time\'s up! Game over!', COLORS.text);
      // Give XP based on score
      const xpGained = Math.max(5, Math.floor(userScore / 20));
      addToBattleLog(`+${xpGained} XP for your effort`, COLORS.accent);
      
      // Save XP to database
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
    const newStreak = currentStreak + 1;
    
    // Update user progress in database
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
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = cardFlipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
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
      <View style={styles.cardContainer}>
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
          <Text style={styles.cardCategory}>{currentCard.category}</Text>
          <Text style={styles.cardDifficulty}>{currentCard.difficulty}</Text>
          <Text style={styles.cardQuestion}>{currentCard.question}</Text>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={flipCard}
          >
            <Text style={styles.flipButtonText}>Flip Card</Text>
          </TouchableOpacity>
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
          <Text style={styles.cardAnswer}>{currentCard.answer}</Text>
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.correctButton]}
              onPress={() => handleUserAnswer(true)}
            >
              <Text style={styles.answerButtonText}>✓ Correct</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerButton, styles.incorrectButton]}
              onPress={() => handleUserAnswer(false)}
            >
              <Text style={styles.answerButtonText}>✗ Incorrect</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderBattleUI = () => (
    <View style={styles.battleUI}>
      {/* HP Bars */}
      <View style={styles.hpContainer}>
        <Animated.View style={[styles.hpBar, { transform: [{ scale: userHpAnim }] }]}>
          <Text style={styles.hpLabel}>You</Text>
          <View style={styles.hpBarBackground}>
            <View style={[styles.hpBarFill, { width: `${userHP}%`, backgroundColor: COLORS.success }]} />
          </View>
          <Text style={styles.hpText}>{userHP}/100</Text>
        </Animated.View>

        <Animated.View style={[styles.hpBar, { transform: [{ scale: aiHpAnim }] }]}>
          <Text style={styles.hpLabel}>AI</Text>
          <View style={styles.hpBarBackground}>
            <View style={[styles.hpBarFill, { width: `${aiHP}%`, backgroundColor: COLORS.warning }]} />
          </View>
          <Text style={styles.hpText}>{aiHP}/100</Text>
        </Animated.View>
      </View>

      {/* Score and Combo */}
      <View style={styles.scoreContainer}>
        <Animated.View style={[styles.comboContainer, { transform: [{ scale: comboAnim }] }]}>
          <Text style={styles.comboText}>Combo x{combo}</Text>
        </Animated.View>
        <Text style={styles.scoreText}>You: {userScore} | AI: {aiScore}</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: timeLeft <= 10 ? COLORS.warning : COLORS.text }]}>
          {timeLeft}s
        </Text>
      </View>

      {/* AI Status */}
      {aiThinking && (
        <View style={styles.aiThinkingContainer}>
          <Text style={styles.aiThinkingText}>🤔 AI is thinking...</Text>
        </View>
      )}
    </View>
  );

  const renderBattleLog = () => (
    <View style={styles.battleLogContainer}>
      <Text style={styles.battleLogTitle}>Battle Log</Text>
      <ScrollView style={styles.battleLog} showsVerticalScrollIndicator={false}>
        {battleLog.map((entry, index) => (
          <Text key={index} style={[styles.battleLogEntry, { color: entry.color }]}>
            {entry.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );

  if (gameState === 'waiting') {
    return (
      <View style={styles.container}>
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingTitle}>⚔️ Flashcard Battle</Text>
          <Text style={styles.waitingDescription}>
            Battle AI opponents with your mental health knowledge!
          </Text>
          <Text style={styles.waitingRules}>
            • Answer flashcards correctly to deal damage
            • Build combos for extra damage
            • Survive for 30 seconds to win
            • AI gets smarter as the battle progresses
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Battle!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'finished') {
    const userWon = userHP > aiHP;
    return (
      <View style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>
            {userWon ? '🎉 Victory!' : '💀 Defeat!'}
          </Text>
          <Text style={styles.finishedScore}>
            Final Score: {userScore} - {aiScore}
          </Text>
          <Text style={styles.finishedCombo}>
            Best Combo: x{combo}
          </Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Game Center</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderBattleUI()}
      {renderCard()}
      {renderBattleLog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  waitingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  waitingDescription: {
    fontSize: 20,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 28,
  },
  waitingRules: {
    fontSize: 18,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  battleUI: {
    padding: 25,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  hpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  hpBar: {
    flex: 1,
    marginHorizontal: 10,
  },
  hpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  hpBarBackground: {
    height: 20,
    backgroundColor: COLORS.lightPurple,
    borderRadius: 10,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  hpText: {
    fontSize: 12,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  comboContainer: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 5,
  },
  comboText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aiThinkingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  aiThinkingText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  card: {
    width: width - 60,
    height: 350,
    borderRadius: 25,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    position: 'absolute',
  },
  cardFront: {
    backgroundColor: COLORS.primary,
  },
  cardBack: {
    backgroundColor: COLORS.secondary,
  },
  cardCategory: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    marginBottom: 5,
  },
  cardDifficulty: {
    fontSize: 12,
    color: COLORS.white + 'CC',
    marginBottom: 20,
  },
  cardQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 28,
  },
  cardAnswer: {
    fontSize: 18,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 26,
  },
  flipButton: {
    backgroundColor: COLORS.white + '40',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  flipButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 25,
  },
  answerButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  correctButton: {
    backgroundColor: COLORS.success,
  },
  incorrectButton: {
    backgroundColor: COLORS.warning,
  },
  answerButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  battleLogContainer: {
    height: 180,
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPurple + '50',
  },
  battleLogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  battleLog: {
    flex: 1,
  },
  battleLogEntry: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 20,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  finishedTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  finishedScore: {
    fontSize: 22,
    color: COLORS.text + 'CC',
    marginBottom: 15,
    textAlign: 'center',
  },
  finishedCombo: {
    fontSize: 20,
    color: COLORS.text + 'CC',
    marginBottom: 50,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playAgainButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FlashcardBattleScreen;
