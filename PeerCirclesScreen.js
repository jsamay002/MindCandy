import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import CircleChatScreen from './CircleChatScreen';

// Candy Crush-inspired vibrant colors (same as HomeScreen)
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

const PeerCirclesScreen = ({ navigation }) => {
  // State for peer circles list
  const [circles, setCircles] = useState([]);
  
  // State for create circle modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State for join circle modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // State for new circle form
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  
  // State for join circle form
  const [joinCircleCode, setJoinCircleCode] = useState('');
  
  // State for showing chat screen
  const [showChat, setShowChat] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  
  // State for circle chat inputs
  const [circleInputs, setCircleInputs] = useState({});
  const [circleMessages, setCircleMessages] = useState({});

  // Load peer circles on component mount
  useEffect(() => {
    loadCircles();
  }, []);

  // Function to load peer circles from MongoDB
  const loadCircles = async () => {
    try {
      // TODO: Replace with actual MongoDB query
      // For now, using placeholder data with AI companions
      const mockCircles = [
        {
          id: '1',
          name: 'Mindful Mornings',
          description: 'Start your day with positive energy and mindfulness practices',
          memberCount: 12,
          isJoined: true,
          color: COLORS.lightYellow,
          joinCode: 'MIND123',
          aiCompanions: [
            { name: 'ZenBot', role: 'Mindfulness Guide', avatar: '🧘‍♀️' },
            { name: 'CalmBot', role: 'Meditation Assistant', avatar: '🌅' }
          ],
          recentActivity: 'ZenBot shared a morning meditation tip'
        },
        {
          id: '2',
          name: 'Anxiety Support',
          description: 'A safe space to share experiences and coping strategies',
          memberCount: 8,
          isJoined: false,
          color: COLORS.lightBlue,
          joinCode: 'ANXIETY456',
          aiCompanions: [
            { name: 'SupportBot', role: 'Crisis Counselor', avatar: '🤗' },
            { name: 'BreathBot', role: 'Breathing Coach', avatar: '💨' }
          ],
          recentActivity: 'SupportBot is here to help with panic attacks'
        },
        {
          id: '3',
          name: 'Creative Healing',
          description: 'Express yourself through art, writing, and creative activities',
          memberCount: 15,
          isJoined: true,
          color: COLORS.lightPurple,
          joinCode: 'CREATE789',
          aiCompanions: [
            { name: 'ArtBot', role: 'Creative Mentor', avatar: '🎨' },
            { name: 'WriteBot', role: 'Writing Coach', avatar: '✍️' }
          ],
          recentActivity: 'ArtBot suggested a new painting technique'
        },
        {
          id: '4',
          name: 'Wellness Warriors',
          description: 'Fitness, nutrition, and mental health combined',
          memberCount: 20,
          isJoined: false,
          color: COLORS.lightGreen,
          joinCode: 'WELLNESS101',
          aiCompanions: [
            { name: 'FitBot', role: 'Fitness Coach', avatar: '💪' },
            { name: 'NutriBot', role: 'Nutrition Guide', avatar: '🥗' }
          ],
          recentActivity: 'FitBot shared a 5-minute workout routine'
        },
      ];
      setCircles(mockCircles);
    } catch (error) {
      console.error('Error loading circles:', error);
    }
  };

  // Function to create a new circle
  const createCircle = async () => {
    if (!newCircleName.trim()) {
      Alert.alert('Circle Name Required', 'Please enter a name for your circle.');
      return;
    }

    try {
      // Generate AI companions based on circle theme
      const aiCompanions = generateAICompanions(newCircleName.toLowerCase());
      
      const newCircle = {
        id: Date.now().toString(),
        name: newCircleName.trim(),
        description: newCircleDescription.trim() || 'No description provided',
        memberCount: 1,
        isJoined: true,
        color: COLORS.lightPink,
        joinCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
        aiCompanions: aiCompanions,
        recentActivity: `${aiCompanions[0].name} is ready to help!`
      };

      // TODO: Replace with actual MongoDB save operation
      console.log('Creating new circle:', newCircle);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local state
      setCircles(prevCircles => [newCircle, ...prevCircles]);
      
      // Reset form and close modal
      setNewCircleName('');
      setNewCircleDescription('');
      setShowCreateModal(false);
      
      Alert.alert(
        'Circle Created!', 
        `Your circle "${newCircle.name}" has been created!\n\nJoin Code: ${newCircle.joinCode}\n\nAI Companions: ${aiCompanions.map(ai => ai.name).join(', ')}`
      );
    } catch (error) {
      console.error('Error creating circle:', error);
      Alert.alert('Error', 'Failed to create circle. Please try again.');
    }
  };

  // Function to generate AI companions based on circle theme
  const generateAICompanions = (circleName) => {
    const companionThemes = {
      'anxiety': [
        { 
          name: 'Dr. CalmBot', 
          role: 'Anxiety Specialist', 
          avatar: '🤗',
          personality: 'gentle, understanding, and highly knowledgeable',
          expertise: 'Generalized Anxiety Disorder, Panic Disorder, Social Anxiety, Agoraphobia, Specific Phobias, CBT, DBT, Exposure Therapy, Mindfulness-Based Stress Reduction',
          greeting: "Hi! I'm Dr. CalmBot, your anxiety specialist. I understand anxiety can feel overwhelming - I'm here with evidence-based techniques to help you manage it. Remember, anxiety is treatable and you're stronger than you think! 💙",
          knowledge: {
            disorders: ['GAD', 'Panic Disorder', 'Social Anxiety', 'Agoraphobia', 'Specific Phobias', 'Separation Anxiety'],
            techniques: ['5-4-3-2-1 Grounding', 'Box Breathing', 'Progressive Muscle Relaxation', 'Cognitive Restructuring', 'Exposure Therapy', 'Mindfulness Meditation', 'Diaphragmatic Breathing', 'Thought Challenging'],
            medications: ['SSRIs', 'SNRIs', 'Benzodiazepines', 'Beta-blockers', 'Buspirone'],
            symptoms: ['racing heart', 'sweating', 'trembling', 'shortness of breath', 'chest tightness', 'nausea', 'dizziness', 'hot flashes', 'chills', 'numbness', 'tingling'],
            triggers: ['stress', 'caffeine', 'alcohol', 'lack of sleep', 'social situations', 'work pressure', 'health concerns', 'financial worries']
          }
        },
        { 
          name: 'BreathMaster', 
          role: 'Breathing & Relaxation Expert', 
          avatar: '💨',
          personality: 'calm, methodical, and scientifically precise',
          expertise: 'Respiratory Psychology, Autonomic Nervous System, Polyvagal Theory, Biofeedback, Breathing Pattern Disorders, Stress Physiology',
          greeting: "Hello! I'm BreathMaster, your breathing and relaxation expert. I specialize in the science of breath and how it directly affects your nervous system. Let's work together to regulate your body's stress response! 🌸",
          knowledge: {
            techniques: ['Box Breathing', '4-7-8 Breathing', 'Diaphragmatic Breathing', 'Alternate Nostril Breathing', 'Coherent Breathing', 'Resonant Frequency Breathing', 'Pursed Lip Breathing'],
            physiology: ['Vagus Nerve', 'Parasympathetic Nervous System', 'Heart Rate Variability', 'CO2 Levels', 'Oxygen Saturation', 'Blood Pressure Regulation'],
            conditions: ['Hyperventilation Syndrome', 'Breathing Pattern Disorders', 'Anxiety-Related Breathing Issues', 'Stress-Induced Respiratory Problems']
          }
        },
        { 
          name: 'SafeHaven', 
          role: 'Crisis Intervention Specialist', 
          avatar: '🛡️',
          personality: 'protective, reassuring, and crisis-trained',
          expertise: 'Crisis Intervention, Suicide Prevention, Safety Planning, Trauma-Informed Care, De-escalation Techniques, Emergency Mental Health',
          greeting: "Hey there! I'm SafeHaven, your crisis intervention specialist. I'm here to ensure you feel safe and supported during difficult times. Your safety and wellbeing are my top priority - you're never alone! 🛡️",
          knowledge: {
            crisis: ['Suicidal Ideation', 'Self-Harm', 'Panic Attacks', 'Dissociation', 'Psychotic Episodes', 'Substance-Induced Crises'],
            interventions: ['Safety Planning', 'Crisis De-escalation', 'Grounding Techniques', 'Reality Testing', 'Support System Activation', 'Emergency Protocols'],
            resources: ['Crisis Hotlines', 'Emergency Services', 'Mental Health Emergency Rooms', 'Mobile Crisis Teams', 'Peer Support']
          }
        },
        { 
          name: 'NeuroExpert', 
          role: 'Neuroscience & Anxiety Researcher', 
          avatar: '🧠',
          personality: 'scientific, analytical, and research-focused',
          expertise: 'Neurobiology of Anxiety, Brain Chemistry, Neurotransmitters, Neuroplasticity, Research-Based Treatments, Clinical Studies',
          greeting: "Hi! I'm NeuroExpert, your neuroscience specialist. I understand the brain science behind anxiety and can explain how treatments work at the neurological level. Knowledge is power in managing anxiety! 🧠",
          knowledge: {
            brain: ['Amygdala', 'Prefrontal Cortex', 'Hippocampus', 'Locus Coeruleus', 'Raphe Nuclei', 'Neuroplasticity', 'Neural Pathways'],
            neurotransmitters: ['GABA', 'Serotonin', 'Norepinephrine', 'Dopamine', 'Glutamate', 'Cortisol', 'BDNF'],
            treatments: ['Neurofeedback', 'Transcranial Magnetic Stimulation', 'Cognitive Training', 'Meditation Effects on Brain', 'Exercise and Neurogenesis']
          }
        }
      ],
      'depression': [
        { 
          name: 'Dr. Hope', 
          role: 'Depression & Mood Specialist', 
          avatar: '☀️',
          personality: 'optimistic, evidence-based, and recovery-focused',
          expertise: 'Major Depressive Disorder, Persistent Depressive Disorder, Bipolar Depression, Seasonal Affective Disorder, Treatment-Resistant Depression, CBT, IPT, Behavioral Activation',
          greeting: "Hi! I'm Dr. Hope, your depression specialist. I understand the darkness of depression - I'm here with proven treatments and unwavering support. Recovery is possible, and I'll walk this journey with you! ☀️",
          knowledge: {
            disorders: ['MDD', 'PDD', 'Bipolar Depression', 'SAD', 'Postpartum Depression', 'Atypical Depression', 'Melancholic Depression'],
            treatments: ['CBT', 'IPT', 'Behavioral Activation', 'Mindfulness-Based Cognitive Therapy', 'Problem-Solving Therapy', 'Interpersonal Therapy'],
            medications: ['SSRIs', 'SNRIs', 'Tricyclics', 'MAOIs', 'Atypical Antidepressants', 'Mood Stabilizers', 'Antipsychotics'],
            symptoms: ['persistent sadness', 'loss of interest', 'fatigue', 'sleep changes', 'appetite changes', 'concentration problems', 'guilt', 'worthlessness', 'hopelessness', 'suicidal thoughts'],
            activities: ['Behavioral Activation', 'Graded Task Assignment', 'Pleasant Activity Scheduling', 'Social Skills Training', 'Problem-Solving Steps']
          }
        },
        { 
          name: 'NeuroChem', 
          role: 'Neurochemistry & Depression Expert', 
          avatar: '🧬',
          personality: 'scientific, analytical, and research-driven',
          expertise: 'Neurobiology of Depression, Neurotransmitter Systems, HPA Axis, Neuroplasticity, Pharmacogenomics, Treatment Mechanisms',
          greeting: "Hello! I'm NeuroChem, your neurochemistry expert. I understand the brain chemistry behind depression and can explain how treatments work at the molecular level. Science gives us hope! 🧬",
          knowledge: {
            neurobiology: ['Monoamine Hypothesis', 'Neuroplasticity', 'BDNF', 'HPA Axis', 'Inflammation Theory', 'Circadian Rhythms'],
            neurotransmitters: ['Serotonin', 'Norepinephrine', 'Dopamine', 'GABA', 'Glutamate', 'Cortisol', 'CRH', 'ACTH'],
            brain_regions: ['Prefrontal Cortex', 'Hippocampus', 'Amygdala', 'Anterior Cingulate', 'Basal Ganglia', 'Raphe Nuclei'],
            treatments: ['SSRI Mechanism', 'SNRI Action', 'Tricyclic Effects', 'MAOI Function', 'Ketamine Research', 'TMS Effects']
          }
        },
        { 
          name: 'RecoveryGuide', 
          role: 'Recovery & Wellness Specialist', 
          avatar: '💙',
          personality: 'empathetic, recovery-focused, and holistic',
          expertise: 'Recovery-Oriented Care, Wellness Planning, Relapse Prevention, Self-Management, Peer Support, Holistic Approaches',
          greeting: "Hi! I'm RecoveryGuide, your recovery specialist. I believe in your capacity to heal and thrive. Let's build a personalized recovery plan that honors your unique journey! 💙",
          knowledge: {
            recovery: ['Recovery Principles', 'Wellness Recovery Action Plan', 'Relapse Prevention', 'Early Warning Signs', 'Crisis Planning'],
            wellness: ['Physical Health', 'Sleep Hygiene', 'Nutrition', 'Exercise', 'Social Connection', 'Meaningful Activities', 'Spirituality'],
            skills: ['Coping Strategies', 'Stress Management', 'Communication Skills', 'Boundary Setting', 'Self-Compassion', 'Mindfulness']
          }
        },
        { 
          name: 'LightTherapist', 
          role: 'Light Therapy & SAD Expert', 
          avatar: '✨',
          personality: 'bright, scientific, and seasonal-focused',
          expertise: 'Seasonal Affective Disorder, Light Therapy, Circadian Rhythms, Vitamin D, Melatonin, Phototherapy, Bright Light Treatment',
          greeting: "Hey! I'm LightTherapist, your light therapy specialist. I understand how light affects mood and circadian rhythms. Let's bring more light into your life, both literally and figuratively! ✨",
          knowledge: {
            light_therapy: ['Bright Light Treatment', 'Dawn Simulation', 'Blue Light Therapy', 'Full Spectrum Light', 'Light Box Specifications'],
            circadian: ['Circadian Rhythm Disorders', 'Melatonin Production', 'Sleep-Wake Cycle', 'Seasonal Patterns', 'Chronotherapy'],
            vitamin_d: ['Vitamin D Deficiency', 'Sunlight Exposure', 'Supplementation', 'Mood Effects', 'Immune Function']
          }
        }
      ],
      'mindful': [
        { 
          name: 'ZenBot', 
          role: 'Mindfulness Guide', 
          avatar: '🧘‍♀️',
          personality: 'peaceful and wise',
          expertise: 'meditation, mindfulness practices, and inner peace',
          greeting: "Namaste! I'm here to guide you on your mindfulness journey. Let's find peace together! 🧘‍♀️"
        },
        { 
          name: 'PeaceBot', 
          role: 'Meditation Coach', 
          avatar: '🕊️',
          personality: 'serene and gentle',
          expertise: 'meditation techniques, stress reduction, and spiritual wellness',
          greeting: "Hello! I teach meditation and help you find inner calm. Let's create a peaceful space together! 🕊️"
        },
        { 
          name: 'PresentBot', 
          role: 'Awareness Guide', 
          avatar: '🌿',
          personality: 'grounded and present',
          expertise: 'present moment awareness, mindful living, and conscious breathing',
          greeting: "Hi! I help you stay present and aware. The present moment is where life happens! 🌿"
        }
      ],
      'creative': [
        { 
          name: 'ArtBot', 
          role: 'Creative Mentor', 
          avatar: '🎨',
          personality: 'inspiring and artistic',
          expertise: 'art therapy, creative expression, and artistic techniques',
          greeting: "Hello! I'm here to help you express yourself through art. Every creation tells a story! 🎨"
        },
        { 
          name: 'InspireBot', 
          role: 'Inspiration Guide', 
          avatar: '✨',
          personality: 'creative and imaginative',
          expertise: 'creative inspiration, artistic motivation, and creative problem-solving',
          greeting: "Hey! I spark creativity and help you find inspiration in everyday life. Let's create something beautiful! ✨"
        },
        { 
          name: 'ExpressBot', 
          role: 'Expression Coach', 
          avatar: '📝',
          personality: 'encouraging and expressive',
          expertise: 'writing therapy, creative writing, and emotional expression',
          greeting: "Hi! I help you express your thoughts and feelings through writing. Your words have power! 📝"
        }
      ],
      'fitness': [
        { 
          name: 'FitBot', 
          role: 'Fitness Coach', 
          avatar: '💪',
          personality: 'energetic and motivating',
          expertise: 'exercise routines, fitness motivation, and physical wellness',
          greeting: "Hey! I'm here to help you build strength and confidence through fitness. Let's get moving! 💪"
        },
        { 
          name: 'EnergyBot', 
          role: 'Motivation Coach', 
          avatar: '⚡',
          personality: 'high-energy and enthusiastic',
          expertise: 'workout motivation, energy management, and fitness goals',
          greeting: "Hello! I help you find the energy and motivation to reach your fitness goals! ⚡"
        },
        { 
          name: 'WellnessBot', 
          role: 'Holistic Health Guide', 
          avatar: '🌱',
          personality: 'balanced and holistic',
          expertise: 'mind-body connection, wellness practices, and healthy living',
          greeting: "Hi! I focus on the connection between physical and mental health. Let's nurture both! 🌱"
        }
      ],
      'stress': [
        { 
          name: 'RelaxBot', 
          role: 'Stress Relief Coach', 
          avatar: '🧘',
          personality: 'calm and soothing',
          expertise: 'stress management, relaxation techniques, and tension relief',
          greeting: "Hello! I specialize in helping you manage stress and find relaxation. Let's unwind together! 🧘"
        },
        { 
          name: 'BalanceBot', 
          role: 'Work-Life Balance Guide', 
          avatar: '⚖️',
          personality: 'balanced and practical',
          expertise: 'time management, work-life balance, and stress prevention',
          greeting: "Hi! I help you find balance in life and prevent burnout. Let's create harmony! ⚖️"
        }
      ],
      'default': [
        { 
          name: 'SupportBot', 
          role: 'General Support', 
          avatar: '🤖',
          personality: 'helpful and adaptable',
          expertise: 'general mental health support, active listening, and emotional guidance',
          greeting: "Hello! I'm here to support you in whatever you're going through. How can I help today? 🤖"
        },
        { 
          name: 'HelpBot', 
          role: 'Assistant', 
          avatar: '🆘',
          personality: 'reliable and caring',
          expertise: 'general assistance, resource guidance, and emotional support',
          greeting: "Hi! I'm here to help you navigate challenges and find resources. You're not alone! 🆘"
        },
        { 
          name: 'CareBot', 
          role: 'Wellness Companion', 
          avatar: '💚',
          personality: 'nurturing and supportive',
          expertise: 'general wellness, self-care, and emotional wellbeing',
          greeting: "Hey! I care about your wellbeing and want to help you thrive. Let's take care of you! 💚"
        }
      ]
    };

    // Find matching theme or use default
    for (const [theme, companions] of Object.entries(companionThemes)) {
      if (circleName.toLowerCase().includes(theme)) {
        return companions;
      }
    }
    return companionThemes.default;
  };

  // Function to join a circle
  const joinCircle = async () => {
    if (!joinCircleCode.trim()) {
      Alert.alert('Join Code Required', 'Please enter a circle join code.');
      return;
    }

    try {
      // TODO: Replace with actual MongoDB join operation
      console.log('Joining circle with code:', joinCircleCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find circle by code (mock implementation)
      const circleToJoin = circles.find(circle => 
        circle.joinCode === joinCircleCode.toUpperCase()
      );
      
      if (circleToJoin) {
        // Update circle to show as joined
        setCircles(prevCircles => 
          prevCircles.map(circle => 
            circle.id === circleToJoin.id 
              ? { ...circle, isJoined: true, memberCount: circle.memberCount + 1 }
              : circle
          )
        );
        
        setJoinCircleCode('');
        setShowJoinModal(false);
        
        // Navigate to chat
        setSelectedCircle(circleToJoin);
        setShowChat(true);
      } else {
        Alert.alert('Invalid Code', 'The join code you entered is not valid.');
      }
    } catch (error) {
      console.error('Error joining circle:', error);
      Alert.alert('Error', 'Failed to join circle. Please try again.');
    }
  };

  // Function to enter chat for a joined circle
  const enterChat = (circle) => {
    setSelectedCircle(circle);
    setShowChat(true);
  };

  // Function to leave a circle
  const leaveCircle = async (circleId) => {
    try {
      // TODO: Replace with actual MongoDB leave operation
      console.log('Leaving circle:', circleId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update circle to show as not joined
      setCircles(prevCircles => 
        prevCircles.map(circle => 
          circle.id === circleId 
            ? { ...circle, isJoined: false, memberCount: Math.max(0, circle.memberCount - 1) }
            : circle
        )
      );
      
      Alert.alert('Left Circle', 'You have left the circle.');
    } catch (error) {
      console.error('Error leaving circle:', error);
      Alert.alert('Error', 'Failed to leave circle. Please try again.');
    }
  };

  // Function to send message in circle chat
  const sendCircleMessage = async (circleId, message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'You',
      timestamp: new Date().toLocaleTimeString(),
      isUser: true
    };

    // Add user message
    setCircleMessages(prev => ({
      ...prev,
      [circleId]: [...(prev[circleId] || []), userMessage]
    }));

    // Clear input
    setCircleInputs(prev => ({
      ...prev,
      [circleId]: ''
    }));

    // Generate AI responses from companions
    const circle = circles.find(c => c.id === circleId);
    if (circle && circle.aiCompanions) {
      // Each AI companion responds
      circle.aiCompanions.forEach((ai, index) => {
        setTimeout(() => {
          const aiResponse = generateAIResponse(message, ai, circle);
          const aiMessage = {
            id: `${Date.now()}-${index}`,
            text: aiResponse,
            sender: ai.name,
            timestamp: new Date().toLocaleTimeString(),
            isUser: false,
            avatar: ai.avatar,
            role: ai.role
          };

          setCircleMessages(prev => ({
            ...prev,
            [circleId]: [...(prev[circleId] || []), aiMessage]
          }));
        }, (index + 1) * 1000); // Stagger responses
      });
    }
  };

  // MASSIVE MISSPELLING TOLERANCE SYSTEM
  const normalizeText = (text) => {
    const misspellings = {
      // Anxiety terms
      'anxity': 'anxiety', 'anxiet': 'anxiety', 'anxieti': 'anxiety', 'anxietty': 'anxiety',
      'panik': 'panic', 'panick': 'panic', 'panikc': 'panic', 'pani': 'panic',
      'woried': 'worried', 'woried': 'worried', 'worryed': 'worried', 'worri': 'worried',
      'nervus': 'nervous', 'nervos': 'nervous', 'nervus': 'nervous', 'nerv': 'nervous',
      'stres': 'stress', 'stresed': 'stressed', 'stresing': 'stressing', 'stresful': 'stressful',
      'breath': 'breathe', 'breathing': 'breathing', 'breathless': 'breathless',
      'grouding': 'grounding', 'groun': 'ground', 'groun': 'ground',
      
      // Depression terms
      'depresion': 'depression', 'depresed': 'depressed', 'depresing': 'depressing',
      'sadnes': 'sadness', 'sadnes': 'sadness', 'sadnes': 'sadness',
      'hopeles': 'hopeless', 'hopelesnes': 'hopelessness', 'hopeles': 'hopeless',
      'tirednes': 'tiredness', 'tirednes': 'tiredness', 'tierd': 'tired',
      'fatigue': 'fatigue', 'fatigued': 'fatigued', 'fatig': 'fatigue',
      'sleepines': 'sleepiness', 'sleepy': 'sleepy', 'slepy': 'sleepy',
      
      // General mental health
      'therapi': 'therapy', 'therapist': 'therapist', 'therap': 'therapy',
      'medicaton': 'medication', 'medicatons': 'medications', 'meds': 'medications',
      'counseling': 'counseling', 'counselor': 'counselor', 'counsel': 'counseling',
      'psycholog': 'psychology', 'psychologst': 'psychologist', 'psych': 'psychology',
      'psychiatr': 'psychiatry', 'psychiatrst': 'psychiatrist', 'psychiat': 'psychiatry',
      
      // Common misspellings
      'recieve': 'receive', 'recieved': 'received', 'recieving': 'receiving',
      'seperate': 'separate', 'seperated': 'separated', 'seperating': 'separating',
      'occured': 'occurred', 'occuring': 'occurring', 'occurence': 'occurrence',
      'definately': 'definitely', 'definatly': 'definitely', 'definately': 'definitely',
      'neccessary': 'necessary', 'necesary': 'necessary', 'neccesary': 'necessary',
      'accomodate': 'accommodate', 'acommodate': 'accommodate', 'accomodation': 'accommodation',
      'embarass': 'embarrass', 'embarassing': 'embarrassing', 'embarassed': 'embarrassed',
      'occassion': 'occasion', 'occassional': 'occasional', 'occassionally': 'occasionally',
      'reccomend': 'recommend', 'reccomendation': 'recommendation', 'reccomended': 'recommended',
      'begining': 'beginning', 'begining': 'beginning', 'begining': 'beginning',
      'existance': 'existence', 'exsistence': 'existence', 'exsist': 'exist',
      'experiance': 'experience', 'experienc': 'experience', 'experiencing': 'experiencing',
      'frustraiting': 'frustrating', 'frustraiting': 'frustrating', 'frustraited': 'frustrated',
      'succesful': 'successful', 'succes': 'success', 'succesfuly': 'successfully',
      'thier': 'their', 'there': 'there', 'theyre': 'they\'re',
      'your': 'your', 'youre': 'you\'re', 'yours': 'yours',
      'its': 'its', 'it\'s': 'it\'s', 'itself': 'itself',
      'wont': 'won\'t', 'dont': 'don\'t', 'cant': 'can\'t', 'shouldnt': 'shouldn\'t',
      'wouldnt': 'wouldn\'t', 'couldnt': 'couldn\'t', 'havent': 'haven\'t',
      'hasnt': 'hasn\'t', 'hadnt': 'hadn\'t', 'didnt': 'didn\'t', 'doesnt': 'doesn\'t',
      'isnt': 'isn\'t', 'arent': 'aren\'t', 'wasnt': 'wasn\'t', 'werent': 'weren\'t',
      'ive': 'I\'ve', 'youve': 'you\'ve', 'weve': 'we\'ve', 'theyve': 'they\'ve',
      'im': 'I\'m', 'youre': 'you\'re', 'were': 'we\'re', 'theyre': 'they\'re',
      'ill': 'I\'ll', 'youll': 'you\'ll', 'well': 'we\'ll', 'theyll': 'they\'ll',
      'id': 'I\'d', 'youd': 'you\'d', 'wed': 'we\'d', 'theyd': 'they\'d',
      'ive': 'I\'ve', 'youve': 'you\'ve', 'weve': 'we\'ve', 'theyve': 'they\'ve'
    };
    
    let normalized = text.toLowerCase();
    for (const [misspelling, correct] of Object.entries(misspellings)) {
      normalized = normalized.replace(new RegExp(misspelling, 'gi'), correct);
    }
    return normalized;
  };

  // EXPERT AI RESPONSE GENERATION
  const generateAIResponse = (userMessage, aiCompanion, circle) => {
    const normalizedMessage = normalizeText(userMessage);
    const responses = [];

    // Expert knowledge-based responses
    if (aiCompanion.knowledge) {
      // Check for specific symptoms, techniques, or topics
      const knowledge = aiCompanion.knowledge;
      
      // Anxiety-specific expert responses
      if (circle.name.toLowerCase().includes('anxiety')) {
        if (aiCompanion.name === 'Dr. CalmBot') {
          if (normalizedMessage.includes('panic') || normalizedMessage.includes('attack')) {
            responses.push(
              "I understand you're experiencing panic symptoms. Let's use the 5-4-3-2-1 grounding technique right now: Name 5 things you can see around you, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This activates your prefrontal cortex and calms your amygdala. Panic attacks typically peak within 10 minutes - you're safe and this will pass.",
              "Panic attacks are your body's fight-or-flight response activated inappropriately. The physical symptoms - racing heart, sweating, trembling - are normal responses to perceived danger. Your brain is trying to protect you. Let's practice box breathing: Inhale for 4, hold for 4, exhale for 6, hold for 2. This stimulates your vagus nerve and activates your parasympathetic nervous system.",
              "I hear your panic symptoms. Remember, panic attacks are not dangerous - they're uncomfortable but temporary. Your heart rate will normalize, your breathing will slow down. Let's focus on what you can control right now: your breathing. Try pursed-lip breathing - inhale through your nose for 4 counts, then exhale through pursed lips for 6 counts. This increases CO2 levels and calms your nervous system."
            );
          } else if (normalizedMessage.includes('worry') || normalizedMessage.includes('anxious')) {
            responses.push(
              "I understand your anxiety. Let's practice cognitive restructuring - a core CBT technique. When you notice anxious thoughts, ask yourself: 'What evidence do I have for this thought? What evidence do I have against it? What would I tell a friend in this situation?' This helps you challenge catastrophic thinking patterns.",
              "Your anxiety is trying to protect you, but it's overestimating the threat. Let's use the 'What if' technique: Instead of 'What if something bad happens?', ask 'What if something good happens?' or 'What if I can handle this?' This shifts your focus from catastrophic thinking to problem-solving.",
              "I hear your worries. Let's practice the 'STOP' technique: Stop what you're doing, Take a deep breath, Observe your thoughts and feelings without judgment, Proceed with a mindful action. This creates space between your thoughts and your response, giving you more control."
            );
          }
        } else if (aiCompanion.name === 'BreathMaster') {
          if (normalizedMessage.includes('breath') || normalizedMessage.includes('breathing')) {
            responses.push(
              "I understand you're having breathing difficulties. Let's practice diaphragmatic breathing - this activates your parasympathetic nervous system and reduces anxiety. Place one hand on your chest, one on your belly. Breathe so only your belly hand moves. Inhale for 4, hold for 4, exhale for 6. This increases heart rate variability and calms your nervous system.",
              "Your breathing pattern affects your entire nervous system. When anxious, we often breathe shallowly from our chest, which triggers more anxiety. Let's practice 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8. This technique, developed by Dr. Andrew Weil, activates your vagus nerve and promotes deep relaxation.",
              "I hear your breathing concerns. Let's try coherent breathing - inhale for 5, exhale for 5. This creates a 0.1 Hz frequency that synchronizes your heart rate variability and activates your parasympathetic nervous system. Research shows this technique reduces anxiety and improves emotional regulation."
            );
          }
        }
      }
      
      // Depression-specific expert responses
      if (circle.name.toLowerCase().includes('depression')) {
        if (aiCompanion.name === 'Dr. Hope') {
          if (normalizedMessage.includes('sad') || normalizedMessage.includes('depressed') || normalizedMessage.includes('hopeless')) {
            responses.push(
              "I understand you're feeling depressed. Depression is a real medical condition that affects your brain chemistry, not a personal failing. Let's practice behavioral activation - start with one small, pleasurable activity today, even for just 5 minutes. This helps increase dopamine and serotonin levels naturally.",
              "Your feelings of sadness and hopelessness are symptoms of depression, not your reality. Let's use the 'Pleasant Activity Scheduling' technique: List 3 activities you used to enjoy, even slightly. Pick one and schedule it for today. This helps rewire your brain's reward system and increases positive emotions.",
              "I hear your depression symptoms. Let's practice the 'Three Good Things' exercise: Before bed, write down three good things that happened today, no matter how small. This gratitude practice increases serotonin and helps your brain focus on positive experiences, counteracting depression's negative bias."
            );
          } else if (normalizedMessage.includes('tired') || normalizedMessage.includes('fatigue') || normalizedMessage.includes('energy')) {
            responses.push(
              "Depression often causes severe fatigue - this is due to changes in your brain's energy metabolism and neurotransmitter levels. Let's try graded activity: Start with 5 minutes of gentle movement today. Even a short walk increases BDNF (brain-derived neurotrophic factor) and helps restore your brain's energy systems.",
              "I understand your fatigue. Depression affects your circadian rhythms and sleep architecture. Let's work on sleep hygiene: Go to bed and wake up at the same time daily, avoid screens 1 hour before bed, and get 10 minutes of morning sunlight. This helps regulate your melatonin and cortisol levels.",
              "Your low energy is a common depression symptom. Let's practice 'Behavioral Activation' - start with micro-activities: Get out of bed, brush your teeth, take a shower. Each small action increases dopamine and helps break the depression cycle. Remember, progress, not perfection."
            );
          }
        }
      }
    }

    // Fallback to general expert responses if no specific match
    if (responses.length === 0) {
      responses.push(
        `I understand what you're going through. As your ${aiCompanion.role.toLowerCase()}, I'm here to provide evidence-based support. ${aiCompanion.expertise.includes('CBT') ? 'Let\'s use cognitive-behavioral techniques to help you manage this.' : 'Let\'s work together to find the best approach for your situation.'}`,
        `Thank you for sharing that with me. Your feelings are valid and important. ${aiCompanion.expertise.includes('specialist') ? 'Based on my expertise in this area, I can help you understand what\'s happening and provide effective strategies.' : 'I\'m here to support you with proven techniques and compassionate care.'}`,
        `I hear you, and I want you to know that you're not alone in this. ${aiCompanion.expertise.includes('research') ? 'Research shows that with the right support and treatment, recovery is possible.' : 'With the right tools and support, you can work through this challenge.'} Let's focus on what we can do right now to help you feel better.`
      );
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Render individual circle item
  const renderCircleItem = ({ item }) => (
    <View style={[styles.circleCard, { borderLeftColor: item.color }]}>
      <View style={styles.circleHeader}>
        <Text style={styles.circleName}>{item.name}</Text>
        <View style={styles.memberCount}>
          <Text style={styles.memberCountText}>{item.memberCount} members</Text>
        </View>
      </View>
      
      <Text style={styles.circleDescription}>{item.description}</Text>
      
      {/* AI Companions Section */}
      {item.aiCompanions && item.aiCompanions.length > 0 && (
        <View style={styles.aiCompanionsSection}>
          <Text style={styles.aiCompanionsTitle}>🤖 AI Companions</Text>
          <View style={styles.aiCompanionsList}>
            {item.aiCompanions.map((ai, index) => (
              <View key={index} style={styles.aiCompanion}>
                <Text style={styles.aiAvatar}>{ai.avatar}</Text>
                <View style={styles.aiInfo}>
                  <Text style={styles.aiName}>{ai.name}</Text>
                  <Text style={styles.aiRole}>{ai.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Recent Activity */}
      {item.recentActivity && (
        <View style={styles.recentActivity}>
          <Text style={styles.recentActivityText}>💬 {item.recentActivity}</Text>
        </View>
      )}
      
      {/* Join Code Display */}
      {item.isJoined && item.joinCode && (
        <View style={styles.joinCodeSection}>
          <Text style={styles.joinCodeLabel}>Share Code:</Text>
          <Text style={styles.joinCode}>{item.joinCode}</Text>
        </View>
      )}

      {/* Circle Chat Section - Only show if joined */}
      {item.isJoined && (
        <View style={styles.circleChatSection}>
          <Text style={styles.chatSectionTitle}>💬 Circle Chat</Text>
          
          {/* Messages Display */}
          <View style={styles.messagesContainer}>
            {circleMessages[item.id] && circleMessages[item.id].length > 0 ? (
              circleMessages[item.id].slice(-3).map((message) => (
                <View key={message.id} style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageSender}>
                      {message.avatar && !message.isUser ? `${message.avatar} ` : ''}
                      {message.sender}
                    </Text>
                    <Text style={styles.messageTime}>{message.timestamp}</Text>
                  </View>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))
            ) : (
              <View style={styles.welcomeMessage}>
                <Text style={styles.welcomeText}>
                  Welcome to {item.name}! 🤗
                </Text>
                <Text style={styles.welcomeSubtext}>
                  Start a conversation and our AI companions will join in!
                </Text>
              </View>
            )}
          </View>

          {/* Chat Input */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.text + '80'}
              value={circleInputs[item.id] || ''}
              onChangeText={(text) => setCircleInputs(prev => ({
                ...prev,
                [item.id]: text
              }))}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendCircleMessage(item.id, circleInputs[item.id] || '')}
              disabled={!circleInputs[item.id]?.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.circleActions}>
        {item.isJoined ? (
          <View style={styles.joinedActions}>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => enterChat(item)}
            >
              <Text style={styles.chatButtonText}>💬 Full Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.leaveButton}
              onPress={() => leaveCircle(item.id)}
            >
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => {
              setJoinCircleCode(item.joinCode || '');
              setShowJoinModal(true);
            }}
          >
            <Text style={styles.joinButtonText}>Join Circle</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Show chat screen if selected
  if (showChat && selectedCircle) {
    return (
      <CircleChatScreen 
        route={{ params: { circle: selectedCircle } }}
        navigation={{ goBack: () => setShowChat(false) }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Peer Circles</Text>
          <Text style={styles.subtitle}>Connect with others on similar journeys</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionButtonText}>Create Circle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.actionButtonText}>Join Circle</Text>
          </TouchableOpacity>
        </View>

        {/* Circles List */}
        <View style={styles.circlesSection}>
          <Text style={styles.sectionTitle}>Available Circles</Text>
          <FlatList
            data={circles}
            renderItem={renderCircleItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Placeholder for Chat Messages */}
        <View style={styles.chatPlaceholder}>
          <Text style={styles.chatPlaceholderTitle}>Chat Coming Soon!</Text>
          <Text style={styles.chatPlaceholderText}>
            Real-time messaging will be available in the next update. 
            For now, you can join circles and connect with members.
          </Text>
        </View>
      </ScrollView>

      {/* Create Circle Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Circle</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Circle name"
              placeholderTextColor={COLORS.text + '80'}
              value={newCircleName}
              onChangeText={setNewCircleName}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.text + '80'}
              value={newCircleDescription}
              onChangeText={setNewCircleDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={createCircle}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Circle Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Circle</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter join code"
              placeholderTextColor={COLORS.text + '80'}
              value={joinCircleCode}
              onChangeText={setJoinCircleCode}
              autoCapitalize="characters"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={joinCircle}
              >
                <Text style={styles.confirmButtonText}>Join</Text>
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
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text + 'CC',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  circlesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  circleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  memberCount: {
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  memberCountText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  circleDescription: {
    fontSize: 14,
    color: COLORS.text + 'CC',
    lineHeight: 20,
    marginBottom: 15,
  },
  aiCompanionsSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.lavender,
    borderRadius: 10,
  },
  aiCompanionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  aiCompanionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  aiCompanion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  aiInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  aiRole: {
    fontSize: 10,
    color: COLORS.text + 'CC',
  },
  recentActivity: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: COLORS.mint,
    borderRadius: 8,
  },
  recentActivityText: {
    fontSize: 12,
    color: COLORS.text + 'CC',
    fontStyle: 'italic',
  },
  joinCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 8,
    backgroundColor: COLORS.lightYellow,
    borderRadius: 8,
  },
  joinCodeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  joinCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  circleActions: {
    alignItems: 'flex-end',
  },
  joinedActions: {
    flexDirection: 'row',
    gap: 10,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: COLORS.lightPink,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  leaveButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chatPlaceholder: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    borderStyle: 'dashed',
  },
  chatPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  chatPlaceholderText: {
    fontSize: 14,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.lightPurple,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightPink,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Circle Chat Styles
  circleChatSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: COLORS.lavender,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightPurple,
  },
  chatSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  messagesContainer: {
    maxHeight: 200,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    marginBottom: 8,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  aiMessage: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    marginRight: '15%',
    borderWidth: 1,
    borderColor: COLORS.lightPurple,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.text + '80',
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
  },
  welcomeMessage: {
    padding: 15,
    backgroundColor: COLORS.mint,
    borderRadius: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: COLORS.text + 'CC',
    textAlign: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.lightPurple,
  },
  chatInput: {
    flex: 1,
    maxHeight: 80,
    fontSize: 14,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 8,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PeerCirclesScreen;
