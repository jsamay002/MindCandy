import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

// Candy Crush-inspired vibrant colors
const COLORS = {
  background: '#FFE4E6',
  primary: '#FF69B4',
  secondary: '#9B59B6',
  accent: '#FFD700',
  success: '#00FF7F',
  text: '#2C3E50',
  white: '#FFFFFF',
  lightPink: '#FFB6C1',
  lightPurple: '#DDA0DD',
  lightYellow: '#FFFF99',
  lightBlue: '#87CEEB',
  lightGreen: '#98FB98',
  lavender: '#E6E6FA',
  mint: '#F0FFF0',
  aiBubble: '#E8F4FD',
  userBubble: '#FFE4E6',
  companionBubble: '#F0FFF0',
};

const CircleChatScreen = ({ route, navigation }) => {
  const { circle } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome messages from AI companions
    initializeChat();
  }, []);

  const initializeChat = () => {
    const welcomeMessages = [];
    
    // Add welcome messages from each AI companion
    if (circle.aiCompanions && circle.aiCompanions.length > 0) {
      circle.aiCompanions.forEach((ai, index) => {
        welcomeMessages.push({
          id: `welcome-${index}`,
          text: ai.greeting || `Hello! I'm ${ai.name}, your ${ai.role.toLowerCase()}. I'm here to help!`,
          sender: ai.name,
          senderType: 'ai',
          avatar: ai.avatar,
          role: ai.role,
          timestamp: new Date(),
        });
      });
    } else {
      // Fallback welcome message
      welcomeMessages.push({
        id: '1',
        text: `Welcome to ${circle.name}! I'm here to support you on your mental health journey. How are you feeling today?`,
        sender: 'AI Assistant',
        senderType: 'ai',
        avatar: '🤖',
        timestamp: new Date(),
      });
    }
    
    // Add system welcome message
    welcomeMessages.push({
      id: 'system-welcome',
      text: `This is a safe space for everyone. Remember, it's okay to not be okay sometimes. We're all on this journey together! 🌟`,
      sender: 'System',
      senderType: 'system',
      avatar: '🤗',
      timestamp: new Date(),
    });
    
    setMessages(welcomeMessages);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'You',
      senderType: 'user',
      avatar: '👤',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI companion responses
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText.trim());
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    const companions = circle.aiCompanions;
    const randomCompanion = companions[Math.floor(Math.random() * companions.length)];
    
    // Check for specific keywords and provide more contextual responses
    let responses = [];
    
    // Topic-specific responses based on circle theme
    if (circle.name.toLowerCase().includes('anxiety')) {
      responses = [
        "I understand anxiety can be overwhelming. Try the 5-4-3-2-1 grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
        "Remember, anxiety is temporary. You've gotten through difficult moments before, and you'll get through this one too. 💙",
        "Let's try some deep breathing together. Inhale for 4 counts, hold for 4, exhale for 6. Repeat until you feel calmer.",
        "It's okay to feel anxious. Your feelings are valid, and I'm here to support you through this. 🤗"
      ];
    } else if (circle.name.toLowerCase().includes('depression')) {
      responses = [
        "I hear you, and I want you to know that your feelings matter. Even small steps forward are progress worth celebrating. ☀️",
        "Depression can make everything feel heavy, but you're stronger than you know. Let's focus on one small thing you can do today.",
        "Remember, healing isn't linear. It's okay to have difficult days. I'm here to support you through all of them. 💙",
        "You're not alone in this. Many people understand what you're going through, and there's hope for better days ahead."
      ];
    } else if (circle.name.toLowerCase().includes('mindful')) {
      responses = [
        "Let's take a moment to breathe and be present. Notice how your breath feels as it enters and leaves your body. 🧘‍♀️",
        "Mindfulness is about accepting the present moment without judgment. What are you noticing right now?",
        "Try this: name three things you're grateful for today, no matter how small. Gratitude can shift our perspective. 🌿",
        "The present moment is where peace lives. Let's practice being here, right now, together."
      ];
    } else if (circle.name.toLowerCase().includes('creative')) {
      responses = [
        "Creativity is a powerful way to express what's inside. What medium calls to you today - writing, drawing, music? 🎨",
        "Every creative act is an act of courage. Don't worry about perfection - focus on expression and healing.",
        "Art has the power to transform pain into beauty. What would you like to create today? ✨",
        "Your creativity is unique and valuable. Let's explore what wants to emerge from within you."
      ];
    } else if (circle.name.toLowerCase().includes('fitness')) {
      responses = [
        "Movement is medicine for both body and mind. Even a short walk can boost your mood and energy! 💪",
        "Remember, fitness is about feeling good, not just looking good. What movement feels right for you today?",
        "Physical activity releases endorphins - natural mood boosters! Let's find an activity you enjoy. ⚡",
        "Every step, every stretch, every breath counts. You're taking care of yourself, and that's something to be proud of."
      ];
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      responses = [
        `Hello! I'm ${randomCompanion.name}. Great to meet you! How can I support you today?`,
        `Hi there! I'm ${randomCompanion.name}. I'm here to listen and help. What's on your mind?`,
        `Hey! ${randomCompanion.name} here! Ready to chat and support each other?`,
      ];
    } else if (message.includes('anxiety') || message.includes('worried') || message.includes('nervous')) {
      responses = [
        "I hear you. Anxiety is real and valid. Let's try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Ready to try?",
        "When anxiety hits, breathing is your anchor. Let's do box breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat with me...",
        "Anxiety is just a visitor. Let's acknowledge it without judgment. What's one thing you can do right now to feel more grounded?",
        "I understand you're feeling anxious. That's completely okay. What's one small thing that usually helps you feel calmer?",
      ];
    } else if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
      responses = [
        "I'm here with you. Sadness is a valid emotion. Sometimes we need to sit with it. What do you need most right now - someone to listen, or some gentle encouragement?",
        "I see you're going through a tough time. Remember, even the darkest nights end with sunrise. What's one tiny thing that brought you joy recently?",
        "Your feelings are valid. It's okay to not be okay. What's one thing that usually helps you feel a little better?",
        "Sometimes sadness needs expression. Would you like to try a creative outlet? Even just doodling or writing can help process these feelings.",
      ];
    } else if (message.includes('stress') || message.includes('stressed') || message.includes('overwhelmed')) {
      responses = [
        "Stress is your body's way of saying it needs attention. Let's do some deep breathing: Inhale slowly for 4 counts, hold for 4, exhale for 6. Feel your shoulders relax...",
        "When stress feels overwhelming, come back to this moment. What's one thing you can control right now? Sometimes it's just your next breath.",
        "Stress needs an outlet! Even 5 minutes of movement can help. What's your go-to stress reliever - walking, dancing, or something else?",
        "Stress can feel like a lot. What's one small step you can take to feel more in control right now?",
      ];
    } else if (message.includes('thank') || message.includes('thanks')) {
      responses = [
        "You're so welcome! I'm here whenever you need support. How are you feeling now?",
        "It's my pleasure to help! That's what this circle is all about - supporting each other. What else is on your mind?",
        "I'm glad I could help! Remember, we're all in this together. What would you like to talk about next?",
        "You're very welcome! I'm always here to listen and support. How can I help you further?",
      ];
    } else {
      // Role-based responses
      if (randomCompanion.role.includes('Anxiety') || randomCompanion.role.includes('Crisis')) {
        responses = [
          "I hear you, and I want you to know that what you're feeling is valid. Let's take this one step at a time. What's one small thing that might help you feel more grounded right now?",
          "It sounds like you're going through a lot. Remember, anxiety is your mind trying to protect you, even when it feels overwhelming. Have you tried any breathing exercises?",
          "I'm here with you. Sometimes just talking about what's on your mind can help. What would it feel like to share more about what's bothering you?",
          "You're not alone in this. Many people experience similar feelings. What coping strategies have worked for you in the past, even just a little?",
        ];
      } else if (randomCompanion.role.includes('Motivation') || randomCompanion.role.includes('Support')) {
        responses = [
          "I believe in your strength, even when you might not see it yourself. What's one thing you're proud of about yourself today?",
          "You've taken a big step by sharing this. That takes courage. What would it look like to be kind to yourself about this situation?",
          "I can see how much you care about this. Your feelings matter, and so do you. What would support look like for you right now?",
          "You're showing incredible resilience by being here and talking about this. What's one small thing that could make today a little better?",
        ];
      } else if (randomCompanion.role.includes('Mindfulness') || randomCompanion.role.includes('Meditation')) {
        responses = [
          "Let's take a moment to breathe together. Inhale slowly for 4 counts, hold for 4, exhale for 6. How does that feel?",
          "I sense some tension in your words. What would it feel like to take a few deep breaths and ground yourself in this moment?",
          "Mindfulness isn't about having a perfect mind - it's about being present with what is. What are you noticing in your body right now?",
          "Sometimes the mind races, and that's okay. What's one thing you can see, hear, or feel right now that brings you comfort?",
        ];
      } else if (randomCompanion.role.includes('Creative') || randomCompanion.role.includes('Inspiration')) {
        responses = [
          "I love how you're expressing yourself! Creativity can be such a powerful outlet. What other ways do you like to express your feelings?",
          "Your words paint such a vivid picture. Have you ever tried writing or drawing about these feelings? Sometimes art helps us process things differently.",
          "I'm inspired by your honesty and openness. What would it look like to channel some of these emotions into something creative?",
          "There's something beautiful about how you're sharing your experience. What colors or images come to mind when you think about how you're feeling?",
        ];
      } else if (randomCompanion.role.includes('Fitness') || randomCompanion.role.includes('Energy')) {
        responses = [
          "I can feel the energy in your message! Sometimes moving our bodies can help move our emotions too. What kind of movement feels good to you?",
          "Your body and mind are connected. What would it feel like to do something gentle for your body right now - even just stretching?",
          "I hear the strength in your words. Physical activity can sometimes help us process difficult emotions. What's your favorite way to move?",
          "Energy flows through us in different ways. What would it look like to honor your body's needs right now?",
        ];
      } else {
        // General supportive responses
        responses = [
          "Thank you for sharing that with me. I'm here to listen and support you. What feels most important for you to talk about right now?",
          "I can hear how much this means to you. Your feelings are valid and important. What would help you feel more supported?",
          "I'm glad you're here and sharing this. It takes courage to be vulnerable. What would it feel like to explore this a bit more?",
          "You're not alone in this. I'm here with you. What would support look like for you in this moment?",
        ];
      }
    }

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Date.now().toString(),
      text: randomResponse,
      sender: randomCompanion.name,
      senderType: 'ai',
      avatar: randomCompanion.avatar,
      timestamp: new Date(),
    };
  };

  const renderMessage = ({ item }) => {
    const isUser = item.senderType === 'user';
    const isAI = item.senderType === 'ai';
    const isSystem = item.senderType === 'system';

    return (
      <View style={[
        styles.messageContainer,
        isUser && styles.userMessage,
        isAI && styles.aiMessage,
        isSystem && styles.systemMessage
      ]}>
        <View style={styles.messageHeader}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[
          styles.messageText,
          isUser && styles.userMessageText,
          isAI && styles.aiMessageText,
          isSystem && styles.systemMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.circleName}>{circle.name}</Text>
            <Text style={styles.memberCount}>{circle.memberCount} members</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🤔 AI is thinking...</Text>
          </View>
        )}

        {/* ENHANCED TEXT BOX - FIXED POSITION */}
        <View style={styles.fixedInputContainer}>
          <Text style={styles.inputLabel}>💬 Chat with AI Companions:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.fixedTextInput}
              placeholder="Type your message here..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              maxLength={1000}
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.fixedSendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.fixedSendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lavender,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  memberCount: {
    fontSize: 12,
    color: COLORS.text + 'CC',
  },
  headerSpacer: {
    width: 50,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContainer: {
    paddingVertical: 10,
    paddingBottom: 120, // More space for fixed input
  },
  messageContainer: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: COLORS.userBubble,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: COLORS.companionBubble,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  systemMessage: {
    backgroundColor: COLORS.lightBlue,
    alignSelf: 'center',
    borderRadius: 20,
    maxWidth: '95%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    fontSize: 16,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.text + 'CC',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.text,
  },
  aiMessageText: {
    color: COLORS.text,
  },
  systemMessageText: {
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  fixedInputContainer: {
    position: 'absolute',
    bottom: 50,
    left: 15,
    right: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF69B4',
    borderRadius: 25,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fixedTextInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#FF69B4',
    borderRadius: 22,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  fixedSendButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    justifyContent: 'center',
  },
  fixedSendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CircleChatScreen;
