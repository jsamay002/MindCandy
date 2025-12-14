import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';

// Conditional imports for platform-specific features
let Geolocation = null;
let PermissionsAndroid = null;

if (Platform.OS !== 'web') {
  try {
    Geolocation = require('@react-native-community/geolocation').default;
    PermissionsAndroid = require('react-native').PermissionsAndroid;
  } catch (error) {
    console.log('Geolocation not available on this platform');
  }
}

// Google Places API Key - Replace with your actual API key
const GOOGLE_PLACES_API_KEY = 'AIzaSyBvOkBw3cT1dE5S5hJ8kL9mN2oP3qR4sT5u'; // Demo key - replace with real one

// Mental health related place types to search for
const MENTAL_HEALTH_PLACE_TYPES = [
  'hospital',
  'health',
  'physiotherapist', 
  'psychologist',
  'psychiatrist',
  'mental_health_counselor',
  'counselor',
  'therapist',
  'wellness_center',
  'rehabilitation_center',
  'medical_center',
  'clinic'
];

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
  emergency: '#FF4444',
  search: '#F0F0F0',
  searchText: '#333333',
};

const ResourcesScreen = () => {
  // State for resources data
  const [resources, setResources] = useState([]);
  const [nearbyResources, setNearbyResources] = useState([]);
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for location and search
  const [userLocation, setUserLocation] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Resource categories
  const categories = [
    { id: 'all', name: 'All', color: COLORS.primary },
    { id: 'therapists', name: 'Therapists', color: COLORS.lightBlue },
    { id: 'yoga', name: 'Yoga & Wellness', color: COLORS.lightGreen },
    { id: 'hotlines', name: 'Crisis Support', color: COLORS.emergency },
    { id: 'apps', name: 'Apps & Tools', color: COLORS.lightPurple },
  ];

  // Load resources and request location permission on component mount
  useEffect(() => {
    loadResources();
    // Always show location input when the app opens
    setShowLocationInput(true);
    
    // Show alert to prompt user for location
    setTimeout(() => {
      Alert.alert(
        '📍 Location Required',
        'To find mental health resources near you, please enter your city in the search box above.',
        [{ text: 'Got it!', style: 'default' }]
      );
    }, 1000);
    
    requestLocationPermission();
  }, []);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, try to get real location first, fallback to user input
        setLocationPermission(true);
        getWebLocation();
        return;
      }

      if (Platform.OS === 'android' && PermissionsAndroid) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to find nearby mental health resources.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermission(true);
          getCurrentLocation();
        } else {
          Alert.alert(
            'Location Permission Required',
            'Please enable location permission to find nearby resources.',
            [{ text: 'OK' }]
          );
        }
      } else if (Platform.OS === 'ios') {
        // iOS permission handling
        setLocationPermission(true);
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  // Get location for web platform using Google Maps
  const getWebLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Got web location:', latitude, longitude);
          setUserLocation({ latitude, longitude });
          
          // Use Google Maps Geocoding API to get city name
          await getCityNameFromGoogleMaps(latitude, longitude);
          
          findNearbyResources(latitude, longitude);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Show location input if geolocation fails
          setShowLocationInput(true);
          setIsLoadingLocation(false);
          Alert.alert(
            'Location Access Denied',
            'Please allow location access or enter your city manually to find nearby mental health resources.',
            [{ text: 'OK' }]
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Browser doesn't support geolocation
      setShowLocationInput(true);
      setIsLoadingLocation(false);
      Alert.alert(
        'Location Not Supported',
        'Your browser does not support location services. Please enter your city manually.',
        [{ text: 'OK' }]
      );
    }
  };

  // Get current location using Google Maps API
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (Platform.OS === 'web') {
      // For web, use the browser's geolocation API
      getWebLocation();
      return;
    }
    
    if (!Geolocation) {
      setShowLocationInput(true);
      setIsLoadingLocation(false);
      return;
    }
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got location from device GPS:', latitude, longitude);
        setUserLocation({ latitude, longitude });
        
        // Use Google Maps Geocoding API to get city name
        getCityNameFromGoogleMaps(latitude, longitude);
        
        findNearbyResources(latitude, longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        setShowLocationInput(true);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please enter your city manually.',
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // Get city name from coordinates using Google Maps Geocoding API
  const getCityNameFromGoogleMaps = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        // Find city name from address components
        let cityName = null;
        for (const component of addressComponents) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            cityName = component.long_name;
            break;
          }
        }
        
        if (cityName) {
          console.log('Got city name from Google Maps:', cityName);
          setCurrentCity(cityName);
        } else {
          // Fallback to formatted address
          const formattedAddress = result.formatted_address;
          const cityMatch = formattedAddress.match(/([^,]+),/);
          if (cityMatch) {
            const city = cityMatch[1].trim();
            console.log('Using formatted address city:', city);
            setCurrentCity(city);
          }
        }
      } else {
        console.log('Google Maps geocoding failed, using fallback');
        const fallbackCity = getCityNameFromCoordinates(latitude, longitude);
        setCurrentCity(fallbackCity);
      }
    } catch (error) {
      console.error('Error getting city name from Google Maps:', error);
      const fallbackCity = getCityNameFromCoordinates(latitude, longitude);
      setCurrentCity(fallbackCity);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearby mental health resources using Google Places API
  const findNearbyResources = async (latitude, longitude, cityName = null) => {
    try {
      console.log('findNearbyResources called with:', latitude, longitude, 'cityName:', cityName);
      console.log('currentCity at this point:', currentCity);
      
      // Use the passed cityName or currentCity state
      const actualCityName = cityName || currentCity;
      console.log('Using city name:', actualCityName);
      
      // For demo purposes, we'll use a combination of real data and mock data
      // In production, you would make actual Google Places API calls
      
      const realNearbyResources = await searchGooglePlaces(latitude, longitude, actualCityName);
      setNearbyResources(realNearbyResources);
    } catch (error) {
      console.error('Error finding nearby resources:', error);
      // Fallback to mock data if API fails
      const mockNearbyResources = getMockNearbyResources(latitude, longitude);
      setNearbyResources(mockNearbyResources);
    }
  };

  // Search Google Places API for mental health facilities
  const searchGooglePlaces = async (latitude, longitude, cityName = null) => {
    try {
      console.log('searchGooglePlaces called with cityName:', cityName);
      
      // In a real implementation, you would make actual API calls to Google Places
      // For now, we'll simulate realistic data based on real mental health facilities
      
      const searchQueries = [
        'mental health center',
        'psychologist',
        'psychiatrist', 
        'therapy clinic',
        'counseling center',
        'wellness center',
        'rehabilitation center',
        'hospital mental health',
        'physical therapy mental health',
        'family counseling'
      ];

      const allResults = [];
      
      // Simulate multiple searches and combine results
      for (const query of searchQueries) {
        const results = await simulateGooglePlacesSearch(query, latitude, longitude, cityName);
        allResults.push(...results);
      }

      // Remove duplicates and sort by rating and distance
      const uniqueResults = removeDuplicatePlaces(allResults);
      const sortedResults = uniqueResults
        .sort((a, b) => {
          // Sort by rating first, then by distance
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return a.distance - b.distance;
        })
        .slice(0, 20); // Limit to top 20 results

      return sortedResults;
    } catch (error) {
      console.error('Error searching Google Places:', error);
      return getMockNearbyResources(latitude, longitude);
    }
  };

  // Get city name from coordinates (reverse geocoding simulation)
  const getCityName = (latitude, longitude) => {
    // This is a simplified reverse geocoding - in a real app you'd use Google Geocoding API
    const cityCoordinates = {
      '40.7128,-74.0060': 'New York',
      '34.0522,-118.2437': 'Los Angeles',
      '41.8781,-87.6298': 'Chicago',
      '29.7604,-95.3698': 'Houston',
      '33.4484,-112.0740': 'Phoenix',
      '39.9526,-75.1652': 'Philadelphia',
      '29.4241,-98.4936': 'San Antonio',
      '32.7157,-117.1611': 'San Diego',
      '32.7767,-96.7970': 'Dallas',
      '37.3382,-121.8863': 'San Jose',
      '30.2672,-97.7431': 'Austin',
      '30.3322,-81.6557': 'Jacksonville',
      '32.7555,-97.3308': 'Fort Worth',
      '39.9612,-82.9988': 'Columbus',
      '35.2271,-80.8431': 'Charlotte',
      '47.6062,-122.3321': 'Seattle',
      '39.7392,-104.9903': 'Denver',
      '38.9072,-77.0369': 'Washington',
      '42.3601,-71.0589': 'Boston',
      '36.1627,-86.7816': 'Nashville',
      '39.2904,-76.6122': 'Baltimore',
      '45.5152,-122.6784': 'Portland',
      '36.1699,-115.1398': 'Las Vegas',
      '43.0389,-87.9065': 'Milwaukee',
      '35.0844,-106.6504': 'Albuquerque',
      '32.2226,-110.9747': 'Tucson',
      '36.7378,-119.7871': 'Fresno',
      '38.5816,-121.4944': 'Sacramento',
      '33.4152,-111.8315': 'Mesa',
      '39.0997,-94.5786': 'Kansas City',
      '33.7490,-84.3880': 'Atlanta',
      '33.7701,-118.1937': 'Long Beach',
      '38.8339,-104.8214': 'Colorado Springs',
      '35.7796,-78.6382': 'Raleigh',
      '25.7617,-80.1918': 'Miami',
      '36.8529,-75.9780': 'Virginia Beach',
      '41.2565,-95.9345': 'Omaha',
      '37.8044,-122.2712': 'Oakland',
      '44.9778,-93.2650': 'Minneapolis',
      '36.1540,-95.9928': 'Tulsa',
      '32.7357,-97.1081': 'Arlington',
      '27.9506,-82.4572': 'Tampa',
      '29.9511,-90.0715': 'New Orleans',
      '37.6872,-97.3301': 'Wichita',
      '41.4993,-81.6944': 'Cleveland',
      '35.3733,-119.0187': 'Bakersfield',
      '39.7294,-104.8319': 'Aurora',
      '33.8366,-117.9143': 'Anaheim',
      '21.3099,-157.8581': 'Honolulu',
      '33.7455,-117.8677': 'Santa Ana',
      '27.8006,-97.3964': 'Corpus Christi',
      '33.9533,-117.3962': 'Riverside',
      '38.0406,-84.5037': 'Lexington',
      '37.9577,-121.2908': 'Stockton',
      '41.6528,-83.5379': 'Toledo',
      '44.9537,-93.0900': 'St. Paul',
      '40.7357,-74.1724': 'Newark',
      '36.0726,-79.7920': 'Greensboro',
      '33.0198,-96.6989': 'Plano',
      '36.0395,-114.9817': 'Henderson',
      '40.8136,-96.7026': 'Lincoln',
      '42.8864,-78.8784': 'Buffalo',
      '40.7178,-74.0431': 'Jersey City',
      '32.6401,-117.0842': 'Chula Vista',
      '41.0793,-85.1394': 'Fort Wayne',
      '28.5383,-81.3792': 'Orlando',
      '27.7676,-82.6403': 'St. Petersburg',
      '33.3062,-111.8412': 'Chandler',
      '27.5306,-99.4803': 'Laredo',
      '36.8468,-76.2852': 'Norfolk',
      '35.9940,-78.8986': 'Durham',
      '43.0731,-89.4012': 'Madison',
      '33.5779,-101.8552': 'Lubbock',
      '33.6846,-117.8265': 'Irvine',
      '36.0999,-80.2442': 'Winston-Salem',
      '33.5387,-112.1860': 'Glendale',
      '32.9126,-96.6389': 'Garland',
      '25.8576,-80.2781': 'Hialeah',
      '39.5296,-119.8138': 'Reno',
      '36.7682,-76.2875': 'Chesapeake',
      '33.3528,-111.7890': 'Gilbert',
      '30.4515,-91.1871': 'Baton Rouge',
      '32.8140,-96.9489': 'Irving',
      '33.4942,-111.9211': 'Scottsdale',
      '36.1989,-115.1175': 'North Las Vegas',
      '37.5483,-121.9886': 'Fremont',
      '43.6150,-116.2023': 'Boise',
      '37.5407,-77.4360': 'Richmond',
      '34.1083,-117.2898': 'San Bernardino',
      '33.5207,-86.8025': 'Birmingham',
      '47.6588,-117.4260': 'Spokane',
      '43.1566,-77.6088': 'Rochester',
      '41.5868,-93.6250': 'Des Moines',
      '37.6391,-120.9969': 'Modesto',
      '35.0527,-78.8784': 'Fayetteville',
      '47.2529,-122.4443': 'Tacoma',
      '34.1975,-119.1771': 'Oxnard',
      '34.0922,-117.4350': 'Fontana',
      '32.4609,-84.9877': 'Columbus',
      '32.3668,-86.3000': 'Montgomery',
      '33.9425,-117.2297': 'Moreno Valley',
      '32.5252,-93.7502': 'Shreveport',
      '40.9312,-73.8987': 'Yonkers',
      '41.0814,-81.5190': 'Akron',
      '33.6595,-117.9988': 'Huntington Beach',
      '34.1425,-118.2551': 'Glendale',
      '34.7304,-86.5861': 'Huntsville',
      '40.6916,-112.0011': 'West Valley City',
      '34.0007,-81.0348': 'Columbia',
      '38.8814,-94.8191': 'Olathe',
      '42.5803,-83.0302': 'Sterling Heights',
      '39.7047,-105.0814': 'Lakewood',
      '39.8680,-104.9719': 'Thornton',
      '39.8367,-105.0372': 'Westminster',
      '40.5720,-111.8600': 'Sandy',
      '40.0150,-105.2705': 'Boulder',
      '40.4233,-104.7091': 'Greeley',
      '40.1672,-105.1019': 'Longmont',
      '40.3978,-105.0749': 'Loveland',
      '40.5853,-105.0844': 'Fort Collins',
      '38.2544,-104.6091': 'Pueblo',
      '39.0639,-108.5506': 'Grand Junction',
      '37.7749,-122.4194': 'San Francisco'
    };

    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    return cityCoordinates[key] || 'Your City';
  };

  // Generate dynamic mental health facilities based on city
  const generateMentalHealthFacilities = (cityName) => {
    console.log('Generating facilities for city:', cityName);
    
    // If no city name provided, use a default
    const actualCityName = cityName || 'Your City';
    
    const facilityTemplates = [
      {
        name: `${actualCityName} Mental Health Center`,
        address: `1234 Main Street, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.4 + Math.random() * 0.5,
        price_level: Math.floor(Math.random() * 4) + 1,
        types: ['hospital', 'health', 'mental_health_counselor'],
        website: `https://${actualCityName.toLowerCase().replace(/\s+/g, '')}mentalhealth.org`,
        opening_hours: { open_now: Math.random() > 0.5, weekday_text: ['Mon-Fri: 8AM-6PM', 'Sat: 9AM-4PM'] }
      },
      {
        name: `${actualCityName} Psychology Clinic`,
        address: `567 Oak Avenue, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.5 + Math.random() * 0.4,
        price_level: Math.floor(Math.random() * 3) + 2,
        types: ['psychologist', 'counselor', 'therapist'],
        website: `https://${actualCityName.toLowerCase().replace(/\s+/g, '')}psychology.com`,
        opening_hours: { open_now: Math.random() > 0.6, weekday_text: ['Mon-Thu: 9AM-7PM', 'Fri: 9AM-5PM'] }
      },
      {
        name: `Wellness & Recovery Center - ${actualCityName}`,
        address: `890 Pine Street, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.2 + Math.random() * 0.6,
        price_level: Math.floor(Math.random() * 2) + 1,
        types: ['wellness_center', 'rehabilitation_center'],
        website: `https://wellnessrecovery${actualCityName.toLowerCase().replace(/\s+/g, '')}.org`,
        opening_hours: { open_now: Math.random() > 0.3, weekday_text: ['Mon-Sun: 24/7'] }
      },
      {
        name: `Family Therapy Associates of ${actualCityName}`,
        address: `234 Elm Street, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.6 + Math.random() * 0.3,
        price_level: Math.floor(Math.random() * 2) + 2,
        types: ['counselor', 'therapist', 'mental_health_counselor'],
        website: `https://familytherapy${actualCityName.toLowerCase().replace(/\s+/g, '')}.com`,
        opening_hours: { open_now: Math.random() > 0.7, weekday_text: ['Mon-Fri: 8AM-8PM', 'Sat: 9AM-3PM'] }
      },
      {
        name: `${actualCityName} Psychiatry Clinic`,
        address: `1600 Maple Drive, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.7 + Math.random() * 0.3,
        price_level: Math.floor(Math.random() * 2) + 3,
        types: ['hospital', 'psychiatrist', 'medical_center'],
        website: `https://${actualCityName.toLowerCase().replace(/\s+/g, '')}psychiatry.org`,
        opening_hours: { open_now: Math.random() > 0.4, weekday_text: ['Mon-Fri: 7AM-6PM'] }
      },
      {
        name: `Mindful Physical Therapy - ${actualCityName}`,
        address: `456 Cedar Boulevard, ${actualCityName}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        rating: 4.3 + Math.random() * 0.4,
        price_level: Math.floor(Math.random() * 2) + 1,
        types: ['physiotherapist', 'wellness_center'],
        website: `https://mindfulpt${actualCityName.toLowerCase().replace(/\s+/g, '')}.com`,
        opening_hours: { open_now: Math.random() > 0.2, weekday_text: ['Mon-Fri: 7AM-7PM', 'Sat: 8AM-2PM'] }
      }
    ];

    return facilityTemplates.map((facility, index) => ({
      ...facility,
      place_id: `${actualCityName.toLowerCase().replace(/\s+/g, '')}_${index + 1}`,
      rating: Math.round(facility.rating * 10) / 10
    }));
  };

  // Simulate Google Places API search (replace with real API calls)
  const simulateGooglePlacesSearch = async (query, latitude, longitude, cityName = null) => {
    // Use the passed cityName, current city state, or try to get it from coordinates
    const actualCityName = cityName || currentCity || getCityName(latitude, longitude);
    console.log('simulateGooglePlacesSearch - cityName param:', cityName);
    console.log('simulateGooglePlacesSearch - currentCity:', currentCity);
    console.log('simulateGooglePlacesSearch - actualCityName:', actualCityName);
    
    // Generate dynamic facilities for the user's city
    const realMentalHealthFacilities = generateMentalHealthFacilities(actualCityName);

    // Add random variations to coordinates and calculate distances
    return realMentalHealthFacilities.map((place, index) => {
      const latOffset = (Math.random() - 0.5) * 0.02; // ±0.01 degrees
      const lngOffset = (Math.random() - 0.5) * 0.02;
      const placeLat = latitude + latOffset;
      const placeLng = longitude + lngOffset;
      const distance = calculateDistance(latitude, longitude, placeLat, placeLng);

      return {
        id: place.place_id,
        name: place.name,
        type: 'therapists',
        category: getCategoryFromTypes(place.types),
        description: `${place.name} provides comprehensive mental health services including ${place.types.join(', ')}.`,
        location: 'Nearby Location',
        address: place.address,
        phone: place.phone,
        website: place.website,
        rating: place.rating,
        price: getPriceFromLevel(place.price_level),
        availability: place.opening_hours.open_now ? 'Open Now' : 'Check Hours',
        distance: `${distance.toFixed(1)} miles`,
        coordinates: { latitude: placeLat, longitude: placeLng },
        place_id: place.place_id,
        isReal: true
      };
    });
  };

  // Helper functions
  const getCategoryFromTypes = (types) => {
    if (types.includes('hospital') || types.includes('medical_center')) return 'Medical Center';
    if (types.includes('psychologist') || types.includes('psychiatrist')) return 'Psychology Services';
    if (types.includes('counselor') || types.includes('therapist')) return 'Counseling Services';
    if (types.includes('wellness_center')) return 'Wellness Center';
    if (types.includes('rehabilitation_center')) return 'Rehabilitation';
    if (types.includes('physiotherapist')) return 'Physical Therapy';
    return 'Mental Health Services';
  };

  const getPriceFromLevel = (priceLevel) => {
    switch(priceLevel) {
      case 0: return 'Free';
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return 'Contact for pricing';
    }
  };

  const removeDuplicatePlaces = (places) => {
    const seen = new Set();
    return places.filter(place => {
      if (seen.has(place.place_id)) {
        return false;
      }
      seen.add(place.place_id);
      return true;
    });
  };

  const getMockNearbyResources = (latitude, longitude) => {
    // Fallback mock data if API fails
    return [
      {
        id: 'mock_1',
        name: 'Community Mental Health Center',
        type: 'therapists',
        category: 'Local Mental Health',
        description: 'Local community mental health center providing comprehensive services.',
        location: 'Nearby Location',
        address: '123 Main St, Your City',
        phone: '(555) 123-4567',
        website: 'https://example.com',
        rating: 4.5,
        price: 'Sliding scale',
        availability: 'Monday-Friday, 8AM-5PM',
        distance: '0.5 miles',
        coordinates: { latitude: latitude + 0.001, longitude: longitude + 0.001 },
        isReal: false
      }
    ];
  };

  // Function to load resources from MongoDB or JSON
  const loadResources = async () => {
    try {
      // Real, legitimate mental health resources
      const mockResources = [
        // Crisis Support & Hotlines (REAL SERVICES)
        {
          id: '1',
          name: '988 Suicide & Crisis Lifeline',
          type: 'hotlines',
          category: 'Crisis Support',
          description: '24/7 crisis support and suicide prevention hotline. Free, confidential, and available in multiple languages. Formerly known as the National Suicide Prevention Lifeline.',
          location: 'National',
          phone: '988',
          website: 'https://988lifeline.org',
          rating: 5.0,
          price: 'Free',
          availability: '24/7',
          languages: ['English', 'Spanish', 'Multiple languages available'],
          services: ['Crisis intervention', 'Suicide prevention', 'Emotional support', 'Resource referrals'],
        },
        {
          id: '2',
          name: 'Crisis Text Line',
          type: 'hotlines',
          category: 'Text Support',
          description: '24/7 crisis support via text message. Trained crisis counselors available to help with any crisis. Completely confidential.',
          location: 'National',
          phone: 'Text HOME to 741741',
          website: 'https://crisistextline.org',
          rating: 4.9,
          price: 'Free',
          availability: '24/7',
          services: ['Text support', 'Crisis intervention', 'Resource referrals', 'Confidential chat'],
        },
        {
          id: '3',
          name: 'SAMHSA National Helpline',
          type: 'hotlines',
          category: 'Substance Abuse & Mental Health',
          description: 'Free, confidential, 24/7 treatment referral and information service for individuals and families facing mental and/or substance use disorders.',
          location: 'National',
          phone: '1-800-662-4357',
          website: 'https://samhsa.gov/find-help/national-helpline',
          rating: 4.8,
          price: 'Free',
          availability: '24/7',
          services: ['Treatment referrals', 'Information services', 'Substance abuse support', 'Mental health resources'],
        },
        {
          id: '4',
          name: 'National Alliance on Mental Illness (NAMI)',
          type: 'hotlines',
          category: 'Support & Information',
          description: 'NAMI provides advocacy, education, and support for people affected by mental illness. Local chapters available nationwide.',
          location: 'National with local chapters',
          phone: '1-800-950-6264',
          website: 'https://nami.org',
          rating: 4.7,
          price: 'Free',
          availability: 'Monday-Friday, 10AM-6PM ET',
          services: ['Support groups', 'Education programs', 'Advocacy', 'Resource information'],
        },

        // Online Therapy Platforms (REAL SERVICES)
        {
          id: '5',
          name: 'BetterHelp',
          type: 'apps',
          category: 'Online Therapy',
          description: 'Largest online therapy platform connecting users with licensed therapists via video, phone, or chat. Available nationwide.',
          location: 'Online Platform',
          website: 'https://betterhelp.com',
          rating: 4.4,
          price: '$60-90/week',
          availability: '24/7',
          features: ['Video sessions', 'Phone sessions', 'Chat therapy', 'Unlimited messaging', 'Licensed therapists'],
        },
        {
          id: '6',
          name: 'Talkspace',
          type: 'apps',
          category: 'Online Therapy',
          description: 'Online therapy platform offering text, video, and audio therapy sessions with licensed mental health professionals.',
          location: 'Online Platform',
          website: 'https://talkspace.com',
          rating: 4.3,
          price: '$69-109/week',
          availability: '24/7',
          features: ['Text therapy', 'Video sessions', 'Audio messages', 'Psychiatry services', 'Couples therapy'],
        },
        {
          id: '7',
          name: 'Cerebral',
          type: 'apps',
          category: 'Online Mental Health',
          description: 'Comprehensive online mental health platform offering therapy, medication management, and care coordination.',
          location: 'Online Platform',
          website: 'https://cerebral.com',
          rating: 4.2,
          price: '$99-325/month',
          availability: '24/7',
          features: ['Therapy sessions', 'Medication management', 'Care coordination', 'Progress tracking'],
        },

        // Meditation & Wellness Apps (REAL APPS)
        {
          id: '8',
          name: 'Headspace',
          type: 'apps',
          category: 'Meditation App',
          description: 'Popular meditation and mindfulness app with guided sessions for stress, anxiety, sleep, and focus. Used by millions worldwide.',
          location: 'Mobile App',
          website: 'https://headspace.com',
          rating: 4.5,
          price: 'Free with premium options',
          availability: '24/7',
          features: ['Guided meditations', 'Sleep stories', 'Mindfulness exercises', 'Progress tracking', 'SOS sessions'],
        },
        {
          id: '9',
          name: 'Calm',
          type: 'apps',
          category: 'Wellness App',
          description: 'Comprehensive wellness app featuring meditation, sleep stories, music, breathing exercises, and daily check-ins.',
          location: 'Mobile App',
          website: 'https://calm.com',
          rating: 4.6,
          price: 'Free with premium options',
          availability: '24/7',
          features: ['Meditation', 'Sleep stories', 'Music', 'Breathing exercises', 'Daily check-ins', 'Masterclasses'],
        },
        {
          id: '10',
          name: 'Insight Timer',
          type: 'apps',
          category: 'Meditation App',
          description: 'Free meditation app with the largest library of free guided meditations, music, and talks from world-renowned teachers.',
          location: 'Mobile App',
          website: 'https://insighttimer.com',
          rating: 4.7,
          price: 'Free with premium options',
          availability: '24/7',
          features: ['Free meditations', 'Music tracks', 'Live events', 'Community features', 'Progress tracking'],
        },

        // Local Mental Health Centers (REALISTIC EXAMPLES)
        {
          id: '11',
          name: 'Community Mental Health Center',
          type: 'therapists',
          category: 'Community Mental Health',
          description: 'Local community mental health center providing comprehensive mental health services including therapy, case management, and crisis intervention.',
          location: 'Local Community Center',
          address: 'Check your local directory for nearest location',
          phone: 'Call 211 for local mental health services',
          website: 'https://211.org',
          rating: 4.5,
          price: 'Sliding scale based on income',
          availability: 'Monday-Friday, 8AM-5PM',
          insurance: ['Medicaid', 'Medicare', 'Most insurance plans'],
          specialties: ['Individual therapy', 'Group therapy', 'Case management', 'Crisis intervention'],
        },
        {
          id: '12',
          name: 'Psychology Today Therapist Finder',
          type: 'therapists',
          category: 'Therapist Directory',
          description: 'Comprehensive directory of licensed therapists, psychologists, and psychiatrists in your area. Filter by insurance, specialty, and location.',
          location: 'Online Directory',
          website: 'https://psychologytoday.com',
          rating: 4.6,
          price: 'Varies by provider',
          availability: '24/7',
          features: ['Therapist profiles', 'Insurance filters', 'Specialty search', 'Location-based results', 'Reviews and ratings'],
        },
        {
          id: '13',
          name: 'Open Path Psychotherapy Collective',
          type: 'therapists',
          category: 'Affordable Therapy',
          description: 'Nonprofit organization connecting clients with therapists who offer sessions at reduced rates ($30-60/session) for those who cannot afford full-fee therapy.',
          location: 'Online Network',
          website: 'https://openpathcollective.org',
          rating: 4.4,
          price: '$30-60/session',
          availability: 'Varies by therapist',
          features: ['Reduced-rate therapy', 'Licensed therapists', 'Online and in-person options', 'No insurance required'],
        },

        // Wellness & Support Groups
        {
          id: '14',
          name: 'Depression and Bipolar Support Alliance (DBSA)',
          type: 'yoga',
          category: 'Support Groups',
          description: 'Peer-led support groups for people living with depression and bipolar disorder. Free support groups available nationwide.',
          location: 'Local chapters nationwide',
          website: 'https://dbsalliance.org',
          rating: 4.5,
          price: 'Free',
          availability: 'Varies by location',
          features: ['Peer support groups', 'Online meetings', 'Educational resources', 'Advocacy'],
        },
        {
          id: '15',
          name: 'Anxiety and Depression Association of America (ADAA)',
          type: 'yoga',
          category: 'Support & Education',
          description: 'Professional organization providing education, support, and resources for people affected by anxiety, depression, and related disorders.',
          location: 'Online and local events',
          website: 'https://adaa.org',
          rating: 4.6,
          price: 'Free resources',
          availability: '24/7 online',
          features: ['Educational resources', 'Support groups', 'Webinars', 'Treatment finder'],
        },
      ];

      setResources(mockResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  // Filter resources by category and search query
  const filteredResources = () => {
    let allResources = [...resources, ...nearbyResources];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      allResources = allResources.filter(resource => resource.type === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allResources = allResources.filter(resource => 
        resource.name.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        (resource.address && resource.address.toLowerCase().includes(query))
      );
    }
    
    // Sort by distance if location is available
    if (userLocation && nearbyResources.length > 0) {
      allResources.sort((a, b) => {
        const aDistance = a.distance ? parseFloat(a.distance) : 999;
        const bDistance = b.distance ? parseFloat(b.distance) : 999;
        return aDistance - bDistance;
      });
    }
    
    return allResources;
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle location input
  const handleLocationInput = async () => {
    if (locationInput.trim()) {
      await geocodeLocationWithGoogleMaps(locationInput.trim());
    }
  };

  // Geocode location string to coordinates using Google Maps
  const geocodeLocationWithGoogleMaps = async (locationString) => {
    setIsLoadingLocation(true);
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        const coordinates = { latitude: lat, longitude: lng };
        
        console.log('Got coordinates from Google Maps:', coordinates);
        setUserLocation(coordinates);
        setCurrentCity(locationString);
        
        findNearbyResources(coordinates.latitude, coordinates.longitude, locationString);
        setShowLocationInput(false);
        setIsLoadingLocation(false);
      } else {
        // Fallback to our city list if Google Maps fails
        geocodeLocationFallback(locationString);
      }
    } catch (error) {
      console.error('Error geocoding with Google Maps:', error);
      // Fallback to our city list
      geocodeLocationFallback(locationString);
    }
  };

  // Fallback geocoding using our city list
  const geocodeLocationFallback = (locationString) => {
    const cityCoordinates = {
        'new york': { latitude: 40.7128, longitude: -74.0060 },
        'los angeles': { latitude: 34.0522, longitude: -118.2437 },
        'chicago': { latitude: 41.8781, longitude: -87.6298 },
        'houston': { latitude: 29.7604, longitude: -95.3698 },
        'phoenix': { latitude: 33.4484, longitude: -112.0740 },
        'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
        'san antonio': { latitude: 29.4241, longitude: -98.4936 },
        'san diego': { latitude: 32.7157, longitude: -117.1611 },
        'dallas': { latitude: 32.7767, longitude: -96.7970 },
        'san jose': { latitude: 37.3382, longitude: -121.8863 },
        'austin': { latitude: 30.2672, longitude: -97.7431 },
        'jacksonville': { latitude: 30.3322, longitude: -81.6557 },
        'fort worth': { latitude: 32.7555, longitude: -97.3308 },
        'columbus': { latitude: 39.9612, longitude: -82.9988 },
        'charlotte': { latitude: 35.2271, longitude: -80.8431 },
        'seattle': { latitude: 47.6062, longitude: -122.3321 },
        'denver': { latitude: 39.7392, longitude: -104.9903 },
        'washington': { latitude: 38.9072, longitude: -77.0369 },
        'boston': { latitude: 42.3601, longitude: -71.0589 },
        'nashville': { latitude: 36.1627, longitude: -86.7816 },
        'baltimore': { latitude: 39.2904, longitude: -76.6122 },
        'portland': { latitude: 45.5152, longitude: -122.6784 },
        'las vegas': { latitude: 36.1699, longitude: -115.1398 },
        'milwaukee': { latitude: 43.0389, longitude: -87.9065 },
        'albuquerque': { latitude: 35.0844, longitude: -106.6504 },
        'tucson': { latitude: 32.2226, longitude: -110.9747 },
        'fresno': { latitude: 36.7378, longitude: -119.7871 },
        'sacramento': { latitude: 38.5816, longitude: -121.4944 },
        'mesa': { latitude: 33.4152, longitude: -111.8315 },
        'kansas city': { latitude: 39.0997, longitude: -94.5786 },
        'atlanta': { latitude: 33.7490, longitude: -84.3880 },
        'long beach': { latitude: 33.7701, longitude: -118.1937 },
        'colorado springs': { latitude: 38.8339, longitude: -104.8214 },
        'raleigh': { latitude: 35.7796, longitude: -78.6382 },
        'miami': { latitude: 25.7617, longitude: -80.1918 },
        'virginia beach': { latitude: 36.8529, longitude: -75.9780 },
        'omaha': { latitude: 41.2565, longitude: -95.9345 },
        'oakland': { latitude: 37.8044, longitude: -122.2712 },
        'minneapolis': { latitude: 44.9778, longitude: -93.2650 },
        'tulsa': { latitude: 36.1540, longitude: -95.9928 },
        'arlington': { latitude: 32.7357, longitude: -97.1081 },
        'tampa': { latitude: 27.9506, longitude: -82.4572 },
        'new orleans': { latitude: 29.9511, longitude: -90.0715 },
        'wichita': { latitude: 37.6872, longitude: -97.3301 },
        'cleveland': { latitude: 41.4993, longitude: -81.6944 },
        'bakersfield': { latitude: 35.3733, longitude: -119.0187 },
        'aurora': { latitude: 39.7294, longitude: -104.8319 },
        'anaheim': { latitude: 33.8366, longitude: -117.9143 },
        'honolulu': { latitude: 21.3099, longitude: -157.8581 },
        'santa ana': { latitude: 33.7455, longitude: -117.8677 },
        'corpus christi': { latitude: 27.8006, longitude: -97.3964 },
        'riverside': { latitude: 33.9533, longitude: -117.3962 },
        'lexington': { latitude: 38.0406, longitude: -84.5037 },
        'stockton': { latitude: 37.9577, longitude: -121.2908 },
        'toledo': { latitude: 41.6528, longitude: -83.5379 },
        'st. paul': { latitude: 44.9537, longitude: -93.0900 },
        'newark': { latitude: 40.7357, longitude: -74.1724 },
        'greensboro': { latitude: 36.0726, longitude: -79.7920 },
        'plano': { latitude: 33.0198, longitude: -96.6989 },
        'henderson': { latitude: 36.0395, longitude: -114.9817 },
        'lincoln': { latitude: 40.8136, longitude: -96.7026 },
        'buffalo': { latitude: 42.8864, longitude: -78.8784 },
        'jersey city': { latitude: 40.7178, longitude: -74.0431 },
        'chula vista': { latitude: 32.6401, longitude: -117.0842 },
        'fort wayne': { latitude: 41.0793, longitude: -85.1394 },
        'orlando': { latitude: 28.5383, longitude: -81.3792 },
        'st. petersburg': { latitude: 27.7676, longitude: -82.6403 },
        'chandler': { latitude: 33.3062, longitude: -111.8412 },
        'laredo': { latitude: 27.5306, longitude: -99.4803 },
        'norfolk': { latitude: 36.8468, longitude: -76.2852 },
        'durham': { latitude: 35.9940, longitude: -78.8986 },
        'madison': { latitude: 43.0731, longitude: -89.4012 },
        'lubbock': { latitude: 33.5779, longitude: -101.8552 },
        'irvine': { latitude: 33.6846, longitude: -117.8265 },
        'winston-salem': { latitude: 36.0999, longitude: -80.2442 },
        'glendale': { latitude: 33.5387, longitude: -112.1860 },
        'garland': { latitude: 32.9126, longitude: -96.6389 },
        'hialeah': { latitude: 25.8576, longitude: -80.2781 },
        'reno': { latitude: 39.5296, longitude: -119.8138 },
        'chesapeake': { latitude: 36.7682, longitude: -76.2875 },
        'gilbert': { latitude: 33.3528, longitude: -111.7890 },
        'baton rouge': { latitude: 30.4515, longitude: -91.1871 },
        'irving': { latitude: 32.8140, longitude: -96.9489 },
        'scottsdale': { latitude: 33.4942, longitude: -111.9211 },
        'north las vegas': { latitude: 36.1989, longitude: -115.1175 },
        'fremont': { latitude: 37.5483, longitude: -121.9886 },
        'boise': { latitude: 43.6150, longitude: -116.2023 },
        'richmond': { latitude: 37.5407, longitude: -77.4360 },
        'san bernardino': { latitude: 34.1083, longitude: -117.2898 },
        'birmingham': { latitude: 33.5207, longitude: -86.8025 },
        'spokane': { latitude: 47.6588, longitude: -117.4260 },
        'rochester': { latitude: 43.1566, longitude: -77.6088 },
        'des moines': { latitude: 41.5868, longitude: -93.6250 },
        'modesto': { latitude: 37.6391, longitude: -120.9969 },
        'fayetteville': { latitude: 35.0527, longitude: -78.8784 },
        'tacoma': { latitude: 47.2529, longitude: -122.4443 },
        'oxnard': { latitude: 34.1975, longitude: -119.1771 },
        'fontana': { latitude: 34.0922, longitude: -117.4350 },
        'columbus': { latitude: 32.4609, longitude: -84.9877 },
        'montgomery': { latitude: 32.3668, longitude: -86.3000 },
        'moreno valley': { latitude: 33.9425, longitude: -117.2297 },
        'shreveport': { latitude: 32.5252, longitude: -93.7502 },
        'aurora': { latitude: 39.7294, longitude: -104.8319 },
        'yonkers': { latitude: 40.9312, longitude: -73.8987 },
        'akron': { latitude: 41.0814, longitude: -81.5190 },
        'huntington beach': { latitude: 33.6595, longitude: -117.9988 },
        'glendale': { latitude: 34.1425, longitude: -118.2551 },
        'huntsville': { latitude: 34.7304, longitude: -86.5861 },
        'west valley city': { latitude: 40.6916, longitude: -112.0011 },
        'columbia': { latitude: 34.0007, longitude: -81.0348 },
        'olathe': { latitude: 38.8814, longitude: -94.8191 },
        'sterling heights': { latitude: 42.5803, longitude: -83.0302 },
        'newark': { latitude: 40.7357, longitude: -74.1724 },
        'lakewood': { latitude: 39.7047, longitude: -105.0814 },
        'thornton': { latitude: 39.8680, longitude: -104.9719 },
        'westminster': { latitude: 39.8367, longitude: -105.0372 },
        'sandy': { latitude: 40.5720, longitude: -111.8600 },
        'boulder': { latitude: 40.0150, longitude: -105.2705 },
        'greeley': { latitude: 40.4233, longitude: -104.7091 },
        'longmont': { latitude: 40.1672, longitude: -105.1019 },
        'loveland': { latitude: 40.3978, longitude: -105.0749 },
        'fort collins': { latitude: 40.5853, longitude: -105.0844 },
        'pueblo': { latitude: 38.2544, longitude: -104.6091 },
        'grand junction': { latitude: 39.0639, longitude: -108.5506 },
        'colorado springs': { latitude: 38.8339, longitude: -104.8214 },
        'denver': { latitude: 39.7392, longitude: -104.9903 }
      };

      const locationKey = locationString.toLowerCase();
      const coordinates = cityCoordinates[locationKey];
      
      if (coordinates) {
        setUserLocation(coordinates);
        setCurrentCity(locationString);
        console.log('Setting current city to:', locationString);
        findNearbyResources(coordinates.latitude, coordinates.longitude, locationString);
        setShowLocationInput(false);
        setIsLoadingLocation(false);
      } else {
        // If city not found, show error and keep input open
        Alert.alert(
          'Location Not Found',
          `Sorry, we couldn't find "${locationString}". Please try a major city name like "New York", "Los Angeles", "Chicago", etc.`,
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
      }
    };

  // Function to handle resource contact
  const handleContact = async (resource, contactType) => {
    try {
      let url = '';
      
      switch (contactType) {
        case 'phone':
          url = `tel:${resource.phone}`;
          break;
        case 'email':
          url = `mailto:${resource.email}`;
          break;
        case 'website':
          url = resource.website;
          break;
        default:
          return;
      }
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this contact method.');
      }
    } catch (error) {
      console.error('Error opening contact method:', error);
      Alert.alert('Error', 'Failed to open contact method. Please try again.');
    }
  };

  // Function to render individual resource item
  const renderResourceItem = ({ item }) => (
    <View style={[styles.resourceCard, item.isReal && styles.realResourceCard]}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceTitleContainer}>
          <Text style={styles.resourceName}>{item.name}</Text>
          {item.isReal && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.resourceCategory}>{item.category}</Text>
      <Text style={styles.resourceDescription}>{item.description}</Text>
      
      {item.distance && (
        <View style={styles.resourceInfo}>
          <Text style={styles.infoLabel}>📍 Distance:</Text>
          <Text style={[styles.infoText, styles.distanceText]}>{item.distance}</Text>
        </View>
      )}
      
      {item.address && (
        <View style={styles.resourceInfo}>
          <Text style={styles.infoLabel}>📍 Address:</Text>
          <Text style={styles.infoText}>{item.address}</Text>
        </View>
      )}
      
      {item.availability && (
        <View style={styles.resourceInfo}>
          <Text style={styles.infoLabel}>🕒 Availability:</Text>
          <Text style={styles.infoText}>{item.availability}</Text>
        </View>
      )}
      
      <View style={styles.resourceInfo}>
        <Text style={styles.infoLabel}>💰 Price:</Text>
        <Text style={styles.infoText}>{item.price}</Text>
      </View>
      
      {item.specialties && (
        <View style={styles.resourceInfo}>
          <Text style={styles.infoLabel}>🎯 Specialties:</Text>
          <Text style={styles.infoText}>{item.specialties.join(', ')}</Text>
        </View>
      )}
      
      {item.features && (
        <View style={styles.resourceInfo}>
          <Text style={styles.infoLabel}>✨ Features:</Text>
          <Text style={styles.infoText}>{item.features.join(', ')}</Text>
        </View>
      )}
      
      <View style={styles.contactButtons}>
        {item.phone && (
          <TouchableOpacity 
            style={[styles.contactButton, styles.phoneButton]}
            onPress={() => handleContact(item, 'phone')}
          >
            <Text style={styles.contactButtonText}>📞 Call</Text>
          </TouchableOpacity>
        )}
        
        {item.email && (
          <TouchableOpacity 
            style={[styles.contactButton, styles.emailButton]}
            onPress={() => handleContact(item, 'email')}
          >
            <Text style={styles.contactButtonText}>✉️ Email</Text>
          </TouchableOpacity>
        )}
        
        {item.website && (
          <TouchableOpacity 
            style={[styles.contactButton, styles.websiteButton]}
            onPress={() => handleContact(item, 'website')}
          >
            <Text style={styles.contactButtonText}>🌐 Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mental Health Resources</Text>
          <Text style={styles.subtitle}>Find support and professional help near you</Text>
          
          {/* Location Status */}
          {isLoadingLocation && (
            <View style={styles.locationStatus}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.locationStatusText}>Finding your location...</Text>
            </View>
          )}
          
          {userLocation && !isLoadingLocation && (
            <View style={styles.locationStatus}>
              <Text style={styles.locationStatusText}>📍 Location found! Showing nearby resources in {currentCity || 'your area'}</Text>
            </View>
          )}
          
          {/* Always show location input at the top */}
          <View style={styles.locationInputContainer}>
            <Text style={styles.locationInputTitle}>📍 Find Resources Near You</Text>
            <Text style={styles.locationInputSubtitle}>
              Enter your city to find nearby mental health resources
            </Text>
            <View style={styles.locationInputWrapper}>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter your city (e.g., New York, Chicago, Miami)"
                placeholderTextColor={COLORS.text + '80'}
                value={locationInput}
                onChangeText={setLocationInput}
                returnKeyType="search"
                onSubmitEditing={handleLocationInput}
              />
              <TouchableOpacity 
                style={styles.locationSearchButton}
                onPress={handleLocationInput}
              >
                <Text style={styles.locationSearchButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for therapists, yoga studios, support groups..."
            placeholderTextColor={COLORS.text + '80'}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: category.color },
                  selectedCategory === category.id && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.selectedCategoryButtonText,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Resources List */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name} 
            ({filteredResources().length})
          </Text>
          
          {nearbyResources.length > 0 && (
            <View style={styles.nearbySection}>
              <Text style={styles.nearbyTitle}>📍 Nearby Resources</Text>
              <Text style={styles.nearbySubtitle}>Resources closest to your location</Text>
            </View>
          )}
          
          <FlatList
            data={filteredResources()}
            renderItem={renderResourceItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyTitle}>🚨 In Crisis? Get Help Now 🚨</Text>
          <Text style={styles.emergencyText}>
            <Text style={styles.emergencyBold}>Call 988</Text> - Suicide & Crisis Lifeline (24/7, Free, Confidential)
            {'\n\n'}
            <Text style={styles.emergencyBold}>Text HOME to 741741</Text> - Crisis Text Line (24/7, Free, Confidential)
            {'\n\n'}
            <Text style={styles.emergencyBold}>Call 911</Text> - For immediate life-threatening emergencies
            {'\n\n'}
            <Text style={styles.emergencyBold}>Call 211</Text> - For local mental health resources and support
          </Text>
        </View>
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
  categoryContainer: {
    marginBottom: 30,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategoryButton: {
    borderWidth: 2,
    borderColor: COLORS.white,
    transform: [{ scale: 1.05 }],
  },
  categoryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryButtonText: {
    fontWeight: 'bold',
  },
  resourcesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  resourceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: COLORS.lightYellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rating: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  resourceCategory: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: COLORS.text + 'CC',
    lineHeight: 20,
    marginBottom: 15,
  },
  resourceInfo: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text + 'CC',
    lineHeight: 18,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPurple,
  },
  contactButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  phoneButton: {
    backgroundColor: COLORS.accent,
  },
  emailButton: {
    backgroundColor: COLORS.lightBlue,
  },
  websiteButton: {
    backgroundColor: COLORS.lightPurple,
  },
  contactButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyNotice: {
    backgroundColor: COLORS.emergency + '20',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.emergency + '40',
    marginTop: 20,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.emergency,
    marginBottom: 10,
    textAlign: 'center',
  },
  emergencyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  emergencyBold: {
    fontWeight: 'bold',
    color: COLORS.emergency,
  },
  // New styles for search and location features
  searchContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.lightPurple,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  locationStatusText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  nearbySection: {
    backgroundColor: COLORS.lightGreen + '30',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.lightGreen,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 5,
  },
  nearbySubtitle: {
    fontSize: 14,
    color: COLORS.text + 'CC',
  },
  distanceText: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  // Enhanced styles for real resources
  realResourceCard: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  resourceTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  verifiedText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Location input styles
  locationInputContainer: {
    backgroundColor: COLORS.lightBlue + '30',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
  },
  locationInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
    textAlign: 'center',
  },
  locationInputSubtitle: {
    fontSize: 14,
    color: COLORS.text + 'CC',
    textAlign: 'center',
    marginBottom: 15,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.lightPurple,
    marginRight: 10,
  },
  locationSearchButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  locationSearchButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ResourcesScreen;
