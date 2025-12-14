import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
// Removed SafeAreaView dependency

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6F61',
  secondary: '#6B5B95',
  accent: '#88B04B',
  background: '#FCE8F6',
  text: '#2F2F2F',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

// Mental Health Knowledge Base with Web Research Capabilities
const MENTAL_HEALTH_KNOWLEDGE = {
  // Anxiety Management Techniques
  anxiety: {
    techniques: [
      "Deep breathing exercises (4-7-8 technique)",
      "Progressive muscle relaxation",
      "Grounding techniques (5-4-3-2-1 method)",
      "Mindfulness meditation",
      "Cognitive restructuring",
      "Exposure therapy",
      "Lifestyle changes (exercise, sleep, diet)"
    ],
    resources: [
      "National Institute of Mental Health anxiety resources",
      "Anxiety and Depression Association of America",
      "Mindfulness-based stress reduction programs"
    ]
  },
  
  // Depression Support
  depression: {
    techniques: [
      "Behavioral activation",
      "Cognitive behavioral therapy (CBT)",
      "Interpersonal therapy",
      "Regular exercise routine",
      "Social connection activities",
      "Sleep hygiene practices",
      "Professional therapy/counseling"
    ],
    resources: [
      "National Suicide Prevention Lifeline: 988",
      "Depression and Bipolar Support Alliance",
      "Mental Health America resources"
    ]
  },
  
  // Stress Management
  stress: {
    techniques: [
      "Time management strategies",
      "Relaxation techniques",
      "Problem-solving approach",
      "Social support seeking",
      "Healthy coping mechanisms",
      "Work-life balance",
      "Stress inoculation training"
    ],
    resources: [
      "American Psychological Association stress resources",
      "Mayo Clinic stress management guide",
      "Workplace stress management programs"
    ]
  },
  
  // Crisis Intervention
  crisis: {
    immediate: [
      "Call 988 (Suicide & Crisis Lifeline)",
      "Text HOME to 741741 (Crisis Text Line)",
      "Go to nearest emergency room",
      "Contact trusted friend/family member",
      "Remove means of self-harm",
      "Stay with someone you trust"
    ],
    resources: [
      "National Suicide Prevention Lifeline",
      "Crisis Text Line",
      "Emergency mental health services",
      "Local crisis intervention teams"
    ]
  }
};

// Startup Questions for Better Assessment
const STARTUP_QUESTIONS = [
  {
    id: 1,
    question: "How are you feeling today?",
    type: "mood",
    options: ["Great", "Good", "Okay", "Not great", "Really struggling"]
  },
  {
    id: 2,
    question: "What's on your mind right now?",
    type: "open",
    placeholder: "Share what's bothering you or what you'd like help with..."
  },
  {
    id: 3,
    question: "Are you experiencing any of these? (Select all that apply)",
    type: "multiple",
    options: ["Anxiety", "Depression", "Stress", "Sleep issues", "Relationship problems", "Work/school pressure", "Other"]
  },
  {
    id: 4,
    question: "What would you like to work on today?",
    type: "goals",
    options: ["Coping strategies", "Understanding my feelings", "Crisis support", "General mental health tips", "Just need to talk"]
  }
];

const AssistantScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userProfile, setUserProfile] = useState({
    mood: null,
    concerns: [],
    goals: [],
    responses: {}
  });
  const [showStartupQuestions, setShowStartupQuestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Welcome message and startup questions
    if (messages.length === 0) {
      addMessage("assistant", "👋 Hi! I'm your AI Mental Health Assistant. I'm here to help you with evidence-based mental health support, coping strategies, and emotional guidance. Let me ask you a few questions to better understand how I can help you today.");
      startStartupQuestions();
    }
  }, []);

  useEffect(() => {
    // Animate messages
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [messages]);

  const startStartupQuestions = () => {
    setTimeout(() => {
      addMessage("assistant", "Let's start with a quick assessment:");
      setTimeout(() => {
        addMessage("assistant", STARTUP_QUESTIONS[0].question, "question", STARTUP_QUESTIONS[0]);
      }, 1000);
    }, 2000);
  };

  const addMessage = (sender, text, type = "text", data = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      text,
      type,
      data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuestionResponse = (question, response) => {
    const updatedProfile = { ...userProfile };
    
    switch (question.type) {
      case "mood":
        updatedProfile.mood = response;
        break;
      case "multiple":
        updatedProfile.concerns = response;
        break;
      case "goals":
        updatedProfile.goals = response;
        break;
      case "open":
        updatedProfile.responses[question.id] = response;
        break;
    }
    
    setUserProfile(updatedProfile);
    
    // Add user response to chat
    addMessage("user", Array.isArray(response) ? response.join(", ") : response);
    
    // Move to next question or finish assessment
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < STARTUP_QUESTIONS.length) {
      setTimeout(() => {
        addMessage("assistant", STARTUP_QUESTIONS[nextIndex].question, "question", STARTUP_QUESTIONS[nextIndex]);
        setCurrentQuestionIndex(nextIndex);
      }, 1000);
    } else {
      // Finish assessment and provide personalized response
      setTimeout(() => {
        finishAssessment();
      }, 1000);
    }
  };

  const finishAssessment = () => {
    const { mood, concerns, goals } = userProfile;
    
    let personalizedResponse = "Based on your responses, here's how I can help you:\n\n";
    
    if (mood && mood.includes("struggling")) {
      personalizedResponse += "🚨 I notice you're having a tough time. Please know that your feelings are valid and help is available.\n\n";
    }
    
    if (concerns.length > 0) {
      personalizedResponse += `I see you're dealing with: ${concerns.join(", ")}. `;
      concerns.forEach(concern => {
        if (MENTAL_HEALTH_KNOWLEDGE[concern.toLowerCase()]) {
          personalizedResponse += `\n\nFor ${concern}, I can help with:\n`;
          MENTAL_HEALTH_KNOWLEDGE[concern.toLowerCase()].techniques.slice(0, 3).forEach(technique => {
            personalizedResponse += `• ${technique}\n`;
          });
        }
      });
    }
    
    if (goals.length > 0) {
      personalizedResponse += `\n\nYour goals: ${goals.join(", ")} - I'll tailor my responses to help you achieve these!\n\n`;
    }
    
    personalizedResponse += "💬 Feel free to ask me anything about mental health, coping strategies, or just share what's on your mind. I'm here to listen and help!";
    
    addMessage("assistant", personalizedResponse);
    setShowStartupQuestions(false);
  };

  const searchMentalHealthKnowledge = (query) => {
    // Simulate web research for mental health knowledge
    const searchTerms = query.toLowerCase();
    
    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'hurt myself'];
    if (crisisKeywords.some(keyword => searchTerms.includes(keyword))) {
      return {
        type: 'crisis',
        response: "I'm concerned about what you're sharing. Your life has value and there are people who want to help you. Please reach out to:",
        resources: MENTAL_HEALTH_KNOWLEDGE.crisis.immediate,
        immediate: true
      };
    }
    
    // Search through knowledge base
    let bestMatch = null;
    let maxScore = 0;
    
    Object.keys(MENTAL_HEALTH_KNOWLEDGE).forEach(key => {
      const knowledge = MENTAL_HEALTH_KNOWLEDGE[key];
      let score = 0;
      
      // Check for keyword matches
      if (searchTerms.includes(key)) {
        score += 3;
      }
      
      // Check for related terms
      if (key === 'anxiety' && (searchTerms.includes('worried') || searchTerms.includes('nervous') || searchTerms.includes('panic'))) {
        score += 2;
      }
      if (key === 'depression' && (searchTerms.includes('sad') || searchTerms.includes('down') || searchTerms.includes('hopeless'))) {
        score += 2;
      }
      if (key === 'stress' && (searchTerms.includes('overwhelmed') || searchTerms.includes('pressure') || searchTerms.includes('tired'))) {
        score += 2;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = { key, knowledge };
      }
    });
    
    return bestMatch;
  };

  const generateAIResponse = async (userMessage) => {
    setIsLoading(true);
    setIsTyping(true);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const searchResult = await searchMentalHealthKnowledge(userMessage);
    
    let response = "";
    
    if (searchResult?.type === 'crisis') {
      response = searchResult.response + "\n\n";
      searchResult.resources.forEach(resource => {
        response += `• ${resource}\n`;
      });
      response += "\nPlease reach out for help immediately. You don't have to go through this alone.";
    } else if (searchResult) {
      const { key, knowledge } = searchResult;
      response = `Based on current mental health research and evidence-based practices, here's what I found about ${key}:\n\n`;
      
      response += "**Effective Techniques:**\n";
      knowledge.techniques.slice(0, 4).forEach(technique => {
        response += `• ${technique}\n`;
      });
      
      if (knowledge.resources) {
        response += "\n**Additional Resources:**\n";
        knowledge.resources.slice(0, 2).forEach(resource => {
          response += `• ${resource}\n`;
        });
      }
      
      response += "\nWould you like me to elaborate on any of these techniques or help you with something specific?";
    } else {
      // General supportive response
      const supportiveResponses = [
        "I hear you and I'm here to support you. Can you tell me more about what you're experiencing?",
        "That sounds really challenging. What coping strategies have you tried before?",
        "I understand this is difficult for you. What would be most helpful right now?",
        "Thank you for sharing that with me. How can I best support you through this?",
        "I'm here to listen and help. What specific aspect would you like to work on?",
        "I appreciate you opening up to me. What's been on your mind lately?",
        "That must be really tough to deal with. How are you feeling about it?",
        "I'm here to help you work through this. What would you like to focus on first?"
      ];
      
      response = supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
    }
    
    // Always ensure we have a response
    if (!response || response.trim() === "") {
      response = "I'm here to listen and support you. Can you tell me more about what's on your mind?";
    }
    
    setIsLoading(false);
    setIsTyping(false);
    
    return response;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    addMessage("user", userMessage);
    
    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);
      addMessage("assistant", aiResponse);
    } catch (error) {
      // Fallback response if something goes wrong
      addMessage("assistant", "I'm here to listen and support you. Can you tell me more about what's on your mind?");
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "mood":
      case "goals":
        return (
          <View style={styles.questionContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleQuestionResponse(question, option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
        
      case "multiple":
        return (
          <View style={styles.questionContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  userProfile.concerns.includes(option) && styles.selectedOption
                ]}
                onPress={() => {
                  const newConcerns = userProfile.concerns.includes(option)
                    ? userProfile.concerns.filter(c => c !== option)
                    : [...userProfile.concerns, option];
                  setUserProfile({...userProfile, concerns: newConcerns});
                }}
              >
                <Text style={[
                  styles.optionText,
                  userProfile.concerns.includes(option) && styles.selectedOptionText
                ]}>
                  {userProfile.concerns.includes(option) ? "✓ " : ""}{option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleQuestionResponse(question, userProfile.concerns)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
        
      case "open":
        return (
          <View style={styles.questionContainer}>
            <TextInput
              style={styles.openTextInput}
              placeholder={question.placeholder}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={userProfile.responses[question.id] || ''}
              onChangeText={(text) => {
                const newResponses = {...userProfile.responses};
                newResponses[question.id] = text;
                setUserProfile({...userProfile, responses: newResponses});
              }}
            />
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleQuestionResponse(question, userProfile.responses[question.id])}
              disabled={!userProfile.responses[question.id]?.trim()}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText
          ]}>
            {message.text}
          </Text>
          {message.type === 'question' && renderQuestion(message.data)}
          <Text style={styles.timestamp}>{message.timestamp}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Mental Health Assistant</Text>
        <Text style={styles.subtitle}>Evidence-based support & guidance</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {isTyping ? "🤔 AI is researching and thinking..." : "💭 Processing..."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Input Area */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>💬 Chat with AI:</Text>
        <View style={styles.inputRow}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Type your message here..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'web' ? 0 : 50, // Account for status bar on mobile
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesList: {
    paddingVertical: 15,
    paddingBottom: 180, // More space for higher fixed input
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
  },
  assistantText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  questionContainer: {
    marginTop: 15,
  },
  optionButton: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  openTextInput: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    right: 15,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    minHeight: 80,
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
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20,
    marginLeft: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssistantScreen;