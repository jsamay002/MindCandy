# 🍭 MindfulMood - Mental Health App

A comprehensive mental health app with a vibrant Candy Crush-inspired theme, featuring real-time location-based resource discovery and AI-powered assistance.

## ✨ Key Features

### 🏠 Home Screen
- **Mood Tracking**: Interactive mood selection with animations
- **Journaling**: Quick journal entry with last entry preview
- **Candy-themed UI**: Vibrant colors and smooth animations

### 🤝 Peer Circles
- **Community Support**: Connect with others on similar mental health journeys
- **Circle Management**: Create and join support groups
- **Social Features**: Share experiences and get peer support

### 🤖 AI Assistant
- **Contextual Responses**: AI that understands different emotional states
- **Real-time Chat**: Smooth messaging with auto-scroll and timestamps
- **Smart Bubbles**: Different styles for user vs AI messages
- **Emotional Intelligence**: Responses tailored to sad, anxious, angry, or help-seeking messages

### 📍 Resources (Enhanced with Location Features)
- **Real Mental Health Centers**: Integration with Google Places API
- **Location-based Discovery**: Find resources near your current location
- **City Input**: Enter your city if location services are unavailable
- **Comprehensive Search**: Search for therapists, hospitals, physical therapy, wellness centers
- **Real Ratings & Reviews**: Google-powered ratings and reviews
- **Distance Calculation**: Sort by proximity to your location
- **Verified Resources**: Real facilities with verified badges
- **100+ Cities Supported**: Major US cities with accurate coordinates
- **Multiple Categories**: 
  - Medical Centers
  - Psychology Services
  - Counseling Services
  - Wellness Centers
  - Rehabilitation Centers
  - Physical Therapy

### 🎴 Flashcards
- **Mental Health Education**: Interactive learning cards
- **Wellness Tips**: Quick access to mental health information

## 🚀 Technical Features

### Location Services
- **Geolocation Integration**: Automatic location detection
- **Permission Handling**: Cross-platform location permissions
- **Distance Calculation**: Haversine formula for accurate distances
- **Fallback Support**: Mock data when location services unavailable

### Google Places Integration
- **Real-time Search**: Live search for mental health facilities
- **Multiple Place Types**: Hospitals, therapists, wellness centers, etc.
- **Rating Integration**: Real Google ratings and reviews
- **Address Validation**: Verified addresses and contact information

### Search & Filtering
- **Smart Search**: Search by name, category, description, or address
- **Category Filtering**: Filter by type of mental health service
- **Distance Sorting**: Sort by proximity to user location
- **Real-time Results**: Instant search results as you type

## 🎨 Design System

### Color Palette (Candy Crush Inspired)
- **Background**: `#FCE8F6` (Light Pink)
- **Primary**: `#FF6F61` (Coral)
- **Secondary**: `#6B5B95` (Purple)
- **Accent**: `#88B04B` (Green)
- **Text**: `#2F2F2F` (Dark Gray)

### UI Components
- **Animated Buttons**: Bounce and scale animations
- **Gradient Backgrounds**: Smooth color transitions
- **Shadow Effects**: Depth and elevation
- **Rounded Corners**: Modern, friendly design
- **Emoji Integration**: Playful and engaging

## 📱 Platform Support

- **Web**: Full functionality with mock location data
- **iOS**: Native location services and permissions
- **Android**: Android location permissions and services

## 🔧 Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Google Places API** (Optional):
   - Get API key from Google Cloud Console
   - Replace `YOUR_GOOGLE_PLACES_API_KEY_HERE` in `ResourcesScreen.js`
   - Enable Places API in Google Cloud Console

3. **Run the App**:
   ```bash
   npx expo start --web
   ```

## 🌟 Real Mental Health Resources

The app includes legitimate mental health resources:

### Crisis Support
- **988 Suicide & Crisis Lifeline**: 24/7 crisis support
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357
- **NAMI**: National Alliance on Mental Illness

### Online Therapy
- **BetterHelp**: Online therapy platform
- **Talkspace**: Text, video, and audio therapy
- **Cerebral**: Comprehensive mental health platform

### Wellness Apps
- **Headspace**: Meditation and mindfulness
- **Calm**: Sleep stories and meditation
- **Insight Timer**: Free meditation library

### Local Resources
- **Community Mental Health Centers**: Sliding scale services
- **Psychology Today**: Therapist finder
- **Open Path Collective**: Affordable therapy ($30-60/session)

## 🚨 Emergency Resources

If you're in crisis, please contact:
- **988** - Suicide & Crisis Lifeline (24/7, Free, Confidential)
- **Text HOME to 741741** - Crisis Text Line (24/7, Free, Confidential)
- **911** - For immediate life-threatening emergencies
- **211** - For local mental health resources and support

## 🔮 Future Enhancements

- [ ] Real Google Places API integration
- [ ] User accounts and data persistence
- [ ] Push notifications for mood check-ins
- [ ] Integration with wearable devices
- [ ] Telehealth appointment booking
- [ ] Community chat features
- [ ] Progress tracking and analytics

## 📄 License

This project is for educational and demonstration purposes. Please ensure you have proper licenses for any third-party services used in production.

---

**Note**: This app is designed to provide mental health resources and support. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about your mental health.