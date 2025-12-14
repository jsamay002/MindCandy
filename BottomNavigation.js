import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

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

const { width } = Dimensions.get('window');

const BottomNavigation = ({ currentScreen, onNavigate }) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const navigationItems = [
    {
      id: 'Home',
      title: 'Home',
      icon: '🏠',
      color: COLORS.primary,
      screen: 'Home',
    },
    {
      id: 'PeerCircles',
      title: 'Circles',
      icon: '👥',
      color: COLORS.secondary,
      screen: 'PeerCircles',
    },
    {
      id: 'Assistant',
      title: 'AI Chat',
      icon: '🤖',
      color: COLORS.accent,
      screen: 'Assistant',
    },
    {
      id: 'GameCenter',
      title: 'Games',
      icon: '🎮',
      color: COLORS.lightBlue,
      screen: 'GameCenter',
    },
    {
      id: 'Resources',
      title: 'Resources',
      icon: '📚',
      color: COLORS.success,
      screen: 'Resources',
    },
    {
      id: 'Flashcards',
      title: 'Cards',
      icon: '🃏',
      color: COLORS.warning,
      screen: 'Flashcards',
    },
    {
      id: 'Profile',
      title: 'Profile',
      icon: '👤',
      color: COLORS.coral,
      screen: 'Profile',
    },
  ];

  const handlePress = (screen) => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onNavigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {navigationItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.navItem,
                { transform: [{ scale: isActive ? scaleAnim : 1 }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.navButton,
                  {
                    backgroundColor: isActive ? item.color : COLORS.white,
                    shadowColor: isActive ? item.color : '#000',
                  },
                ]}
                onPress={() => handlePress(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.navIcon,
                  { color: isActive ? COLORS.white : item.color }
                ]}>
                  {item.icon}
                </Text>
                <Text style={[
                  styles.navTitle,
                  { color: isActive ? COLORS.white : item.color }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.lavender,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingBottom: 25, // Extra padding for safe area
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  navTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default BottomNavigation;




