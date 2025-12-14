import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useUser } from './UserContext';

const { width, height } = Dimensions.get('window');

// Professional mental health app color palette
const COLORS = {
  // Primary calming colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#4F46E5', // Indigo
  primaryLight: '#818CF8',
  secondary: '#059669', // Emerald
  accent: '#F59E0B', // Amber
  
  // Mental health supportive colors
  calm: '#E0F2FE', // Light blue
  peace: '#F0FDF4', // Light green
  warmth: '#FEF3C7', // Light yellow
  serenity: '#F3E8FF', // Light purple
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Interactive elements
  buttonPrimary: '#4F46E5',
  buttonSecondary: '#059669',
  buttonDisabled: '#D1D5DB',
  
  // Shadows and borders
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const GameCenterScreen = ({ navigation }) => {
  const { user, userProgress, updateProgress } = useUser();
  
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    totalGames: 0,
    wins: 0,
    achievements: [],
  });

  const [gameModes, setGameModes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadUserData();
    initializeAnimations();
  }, [userProgress]);

  const initializeAnimations = () => {
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
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      if (userProgress && userProgress.flashcardProgress) {
        const { xp, level, streak } = userProgress.flashcardProgress;
        setUserStats(prev => ({
          ...prev,
          level: level || 1,
          xp: xp || 0,
          streak: streak || 0,
          coins: prev.coins + (xp || 0), // Convert XP to coins
        }));
      }
      
      updateGameModes();
      loadAchievements();
      loadLeaderboard();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameModes = () => {
    const currentLevel = userStats.level;
    const modes = [
      {
        id: 'battle',
        title: 'Mind Battle',
        description: 'Test your knowledge against AI',
        difficulty: 'Beginner',
        reward: '50 XP + 10 Coins',
        color: COLORS.primary,
        icon: '🧠',
        unlocked: true,
        minLevel: 1,
        category: 'Knowledge',
      },
      {
        id: 'timeattack',
        title: 'Speed Challenge',
        description: 'Quick thinking under pressure',
        difficulty: 'Intermediate',
        reward: '75 XP + 15 Coins',
        color: COLORS.secondary,
        icon: '⚡',
        unlocked: currentLevel >= 2,
        minLevel: 2,
        category: 'Speed',
      },
      {
        id: 'memory',
        title: 'Memory Master',
        description: 'Train your memory skills',
        difficulty: 'Advanced',
        reward: '100 XP + 20 Coins',
        color: COLORS.accent,
        icon: '🎯',
        unlocked: currentLevel >= 3,
        minLevel: 3,
        category: 'Memory',
      },
      {
        id: 'creative',
        title: 'Creative Expression',
        description: 'Express emotions through art',
        difficulty: 'Intermediate',
        reward: '60 XP + 12 Coins',
        color: '#8B5CF6',
        icon: '🎨',
        unlocked: currentLevel >= 2,
        minLevel: 2,
        category: 'Creativity',
      },
      {
        id: 'puzzle',
        title: 'Logic Puzzles',
        description: 'Solve complex mental puzzles',
        difficulty: 'Expert',
        reward: '120 XP + 25 Coins',
        color: '#EC4899',
        icon: '🧩',
        unlocked: currentLevel >= 4,
        minLevel: 4,
        category: 'Logic',
      },
      {
        id: 'boss',
        title: 'Ultimate Challenge',
        description: 'Face the final boss battle',
        difficulty: 'Master',
        reward: '200 XP + 50 Coins',
        color: '#DC2626',
        icon: '👑',
        unlocked: currentLevel >= 5,
        minLevel: 5,
        category: 'Mastery',
      },
    ];
    setGameModes(modes);
  };

  const loadAchievements = () => {
    const achievements = [
      { 
        id: 'first_win', 
        title: 'First Victory', 
        description: 'Win your first game', 
        icon: '🏆', 
        unlocked: userStats.wins > 0,
        xp: 25,
      },
      { 
        id: 'streak_5', 
        title: 'Hot Streak', 
        description: 'Win 5 games in a row', 
        icon: '🔥', 
        unlocked: userStats.streak >= 5,
        xp: 50,
      },
      { 
        id: 'level_5', 
        title: 'Mental Warrior', 
        description: 'Reach level 5', 
        icon: '⚡', 
        unlocked: userStats.level >= 5,
        xp: 100,
      },
      { 
        id: 'speed_demon', 
        title: 'Speed Demon', 
        description: 'Complete Time Attack in under 30 seconds', 
        icon: '💨', 
        unlocked: false, // This would need to be tracked
        xp: 75,
      },
      { 
        id: 'memory_master', 
        title: 'Memory Master', 
        description: 'Beat Memory Master 10 times', 
        icon: '🧠', 
        unlocked: false, // This would need to be tracked
        xp: 150,
      },
      { 
        id: 'boss_slayer', 
        title: 'Boss Slayer', 
        description: 'Defeat the Ultimate Challenge', 
        icon: '👹', 
        unlocked: false, // This would need to be tracked
        xp: 200,
      },
    ];
    setAchievements(achievements);
  };

  const loadLeaderboard = () => {
    // Simulate leaderboard data - in a real app, this would come from a server
    const mockLeaderboard = [
      { rank: 1, name: user?.name || 'You', xp: userStats.xp, level: userStats.level, avatar: '👑' },
      { rank: 2, name: 'Alex Chen', xp: Math.max(0, userStats.xp - 50), level: Math.max(1, userStats.level - 1), avatar: '🧠' },
      { rank: 3, name: 'Sam Wilson', xp: Math.max(0, userStats.xp - 100), level: Math.max(1, userStats.level - 1), avatar: '⚡' },
      { rank: 4, name: 'Jordan Kim', xp: Math.max(0, userStats.xp - 150), level: Math.max(1, userStats.level - 2), avatar: '🎯' },
      { rank: 5, name: 'Taylor Swift', xp: Math.max(0, userStats.xp - 200), level: Math.max(1, userStats.level - 2), avatar: '🎨' },
    ];
    setLeaderboard(mockLeaderboard);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const startGame = (gameMode) => {
    if (!gameMode.unlocked) {
      Alert.alert(
        'Game Locked 🔒',
        `Reach level ${gameMode.minLevel} to unlock ${gameMode.title}!`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to specific game
    if (navigation && navigation.navigate) {
      switch (gameMode.id) {
        case 'battle':
          navigation.navigate('FlashcardBattle');
          break;
        case 'timeattack':
          navigation.navigate('TimeAttack');
          break;
        case 'memory':
          navigation.navigate('MemoryDuel');
          break;
        case 'creative':
          navigation.navigate('CreativeCanvas');
          break;
        case 'puzzle':
          navigation.navigate('PuzzleRush');
          break;
        case 'boss':
          navigation.navigate('BossBattle');
          break;
        default:
          Alert.alert('Coming Soon!', 'This game mode is under development!');
      }
    }
  };

  const renderGameMode = (gameMode, index) => (
    <Animated.View
      key={gameMode.id}
      style={[
        styles.gameModeCard,
        { 
          backgroundColor: gameMode.unlocked ? gameMode.color : COLORS.buttonDisabled,
          opacity: gameMode.unlocked ? 1 : 0.6,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => startGame(gameMode)}
        disabled={!gameMode.unlocked}
        style={styles.gameModeButton}
      >
        <View style={styles.gameModeHeader}>
          <Text style={styles.gameModeIcon}>{gameMode.icon}</Text>
          <View style={styles.gameModeInfo}>
            <Text style={styles.gameModeTitle}>{gameMode.title}</Text>
            <Text style={styles.gameModeDescription}>{gameMode.description}</Text>
            <Text style={styles.gameModeCategory}>{gameMode.category}</Text>
          </View>
          {!gameMode.unlocked && (
            <View style={styles.lockedContainer}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedText}>Level {gameMode.minLevel}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.gameModeFooter}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{gameMode.difficulty}</Text>
          </View>
          <Text style={styles.rewardText}>{gameMode.reward}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAchievement = (achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        { 
          backgroundColor: achievement.unlocked ? COLORS.success : COLORS.surface,
          borderColor: achievement.unlocked ? COLORS.success : COLORS.border,
        }
      ]}
    >
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
      </View>
      {achievement.unlocked && (
        <Text style={styles.unlockedIcon}>✅</Text>
      )}
    </View>
  );

  const renderLeaderboardItem = (player) => (
    <View key={player.rank} style={styles.leaderboardItem}>
      <View style={styles.leaderboardRank}>
        <Text style={styles.leaderboardRankText}>#{player.rank}</Text>
      </View>
      <Text style={styles.leaderboardAvatar}>{player.avatar}</Text>
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{player.name}</Text>
        <Text style={styles.leaderboardLevel}>Level {player.level}</Text>
      </View>
      <Text style={styles.leaderboardScore}>{player.xp} XP</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with User Stats */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Mental Wellness Center</Text>
        <Text style={styles.subtitle}>Build your mental strength through engaging challenges</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Level {userStats.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.xp}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </Animated.View>

      {/* Game Modes */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>🎮 Mental Training Games</Text>
        <View style={styles.gameModesGrid}>
          {gameModes.map(renderGameMode)}
        </View>
      </Animated.View>

      {/* Daily Challenge */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>⭐ Daily Challenge</Text>
        <View style={styles.dailyChallengeCard}>
          <Text style={styles.dailyChallengeTitle}>Mindfulness Sprint</Text>
          <Text style={styles.dailyChallengeDescription}>
            Complete 5 quick mindfulness exercises in 10 minutes!
          </Text>
          <View style={styles.dailyChallengeReward}>
            <Text style={styles.dailyChallengeRewardText}>Reward: 150 XP + 30 Coins</Text>
          </View>
          <TouchableOpacity style={styles.dailyChallengeButton}>
            <Text style={styles.dailyChallengeButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Achievements */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
        <View style={styles.achievementsList}>
          {achievements.map(renderAchievement)}
        </View>
      </Animated.View>

      {/* Leaderboard */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>🏅 Community Leaderboard</Text>
        <View style={styles.leaderboardCard}>
          {leaderboard.map(renderLeaderboardItem)}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
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
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  gameModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  gameModeCard: {
    width: (width - 55) / 2,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 15,
  },
  gameModeButton: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  gameModeHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  gameModeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gameModeInfo: {
    alignItems: 'center',
  },
  gameModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: 4,
    textAlign: 'center',
  },
  gameModeDescription: {
    fontSize: 12,
    color: COLORS.surface + 'CC',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  gameModeCategory: {
    fontSize: 10,
    color: COLORS.surface + 'AA',
    textAlign: 'center',
    fontWeight: '500',
  },
  lockedContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  lockedIcon: {
    fontSize: 20,
    color: COLORS.surface,
    marginBottom: 2,
  },
  lockedText: {
    fontSize: 10,
    color: COLORS.surface + 'CC',
    fontWeight: '500',
  },
  gameModeFooter: {
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: COLORS.surface + '40',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.surface,
  },
  rewardText: {
    fontSize: 10,
    color: COLORS.surface + 'CC',
    textAlign: 'center',
    fontWeight: '500',
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  achievementXP: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  unlockedIcon: {
    fontSize: 20,
    color: COLORS.success,
  },
  dailyChallengeCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  dailyChallengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  dailyChallengeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  dailyChallengeReward: {
    backgroundColor: COLORS.warmth,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dailyChallengeRewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  dailyChallengeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dailyChallengeButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  leaderboardLevel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
});

export default GameCenterScreen;