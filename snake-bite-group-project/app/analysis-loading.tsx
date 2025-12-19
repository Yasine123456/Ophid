import { SNAKES_DATABASE } from '@/types/snake';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './_context/ThemeContext';

export default function AnalysisLoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

  const hasSnakePhoto = params.hasSnakePhoto === 'true';
  const hasBitePhoto = params.hasBitePhoto === 'true';
  const hasDescription = params.hasDescription === 'true';

  const steps = [
    { text: 'Processing images...', icon: 'image', duration: 1500 },
    { text: 'Analyzing snake features...', icon: 'search', duration: 2000 },
    { text: 'Comparing with database...', icon: 'albums', duration: 1800 },
    { text: 'Calculating danger level...', icon: 'analytics', duration: 1200 },
    { text: 'Preparing results...', icon: 'checkmark-circle', duration: 1000 },
  ];

  useEffect(() => {
    // Log what we received to debug
    console.log('=== ANALYSIS LOADING PARAMS ===');
    console.log('Snake Photo URI:', params.snakePhotoUri);
    console.log('Bite Photo URI:', params.bitePhotoUri);
    console.log('Description:', params.description);
    console.log('==============================');

    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress through steps
    let totalTime = 0;
    steps.forEach((step, index) => {
      totalTime += step.duration;
      setTimeout(() => {
        setCurrentStep(index);
        setProgress(((index + 1) / steps.length) * 100);
      }, totalTime);
    });
    
    // Simulate model result
    const modelResult = "Glossy Snake";
    const modelConfidence = 75;

    const matchedSnake = SNAKES_DATABASE.find((s) =>
      s.name.toLowerCase() === modelResult.toLowerCase()
    );

    console.log("Model output:", modelResult);
    console.log("Matched snake:", matchedSnake);

    // Navigate to results after all steps - PASS THE DATA!
    setTimeout(() => {
      console.log('=== NAVIGATING TO RESULTS ===');
      console.log('Passing Snake Photo:', params.snakePhotoUri);
      console.log('Passing Bite Photo:', params.bitePhotoUri);
      console.log('Passing Description:', params.description);
      
    router.replace({
      pathname: '/analysis-results',
      params: {
        // User input
        snakePhotoUri: String(params.snakePhotoUri || ''),
        bitePhotoUri: String(params.bitePhotoUri || ''),
        description: String(params.description || ''),

        // Model output we simulated
        modelResult: modelResult,
        modelConfidence: String(modelConfidence),

        // If the database matched a snake
        matchedSnakeId: matchedSnake ? String(matchedSnake.id) : '',
        matchedSnakeName: matchedSnake ? matchedSnake.name : 'Unknown',
        matchedSnakeDanger: matchedSnake ? matchedSnake.danger : 'Unknown',
      }
    });
    }, totalTime + 500);

  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View style={[
          styles.iconContainer,
          { transform: [{ scale: pulseValue }] }
        ]}>
          <View style={styles.iconCircle}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="flask" size={64} color="#ffffff" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
          Analyzing Snake
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Using AI to identify species and assess danger
        </Text>

        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progress)}% Complete
        </Text>

        {/* Current Step */}
        <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name={steps[currentStep]?.icon as any || 'hourglass'} size={24} color="#2563eb" />
          <Text style={[styles.stepText, { color: colors.textPrimary }]}>
            {steps[currentStep]?.text || 'Initializing...'}
          </Text>
        </View>

        {/* Analyzing Cards */}
        <View style={styles.analyzingCards}>
          <Text style={[styles.analyzingTitle, { color: colors.textSecondary }]}>
            ANALYZING:
          </Text>
          
          {hasSnakePhoto && (
            <View style={[styles.analyzingCard, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}>
              <Ionicons name="image" size={20} color="#2563eb" />
              <Text style={[styles.analyzingText, { color: colors.textPrimary }]}>
                Snake Photo
              </Text>
              <View style={styles.analyzingBadge}>
                <View style={styles.analyzingDot} />
              </View>
            </View>
          )}

          {hasBitePhoto && (
            <View style={[styles.analyzingCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}>
              <Ionicons name="bandage" size={20} color="#dc2626" />
              <Text style={[styles.analyzingText, { color: colors.textPrimary }]}>
                Bite Photo
              </Text>
              <View style={styles.analyzingBadge}>
                <View style={styles.analyzingDot} />
              </View>
            </View>
          )}

          {hasDescription && (
            <View style={[styles.analyzingCard, { backgroundColor: colors.cardBg, borderColor: '#16a34a' }]}>
              <Ionicons name="document-text" size={20} color="#16a34a" />
              <Text style={[styles.analyzingText, { color: colors.textPrimary }]}>
                Description
              </Text>
              <View style={styles.analyzingBadge}>
                <View style={styles.analyzingDot} />
              </View>
            </View>
          )}
        </View>

        {/* Technical Info */}
        <View style={[styles.techCard, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc', borderColor: colors.border }]}>
          <Text style={[styles.techTitle, { color: colors.textSecondary }]}>
            PROCESSING STEPS
          </Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.techStep}>
              <Ionicons 
                name={
                  index < currentStep ? "checkmark-circle" : 
                  index === currentStep ? "hourglass" : 
                  "ellipse-outline"
                } 
                size={16} 
                color={
                  index < currentStep ? "#16a34a" : 
                  index === currentStep ? "#2563eb" : 
                  "#cbd5e1"
                }
              />
              <Text style={[
                styles.techStepText, 
                { color: index <= currentStep ? colors.textPrimary : colors.textSecondary },
                index < currentStep && styles.techStepComplete
              ]}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    minWidth: '80%',
  },
  stepText: {
    fontSize: 15,
    fontWeight: '500',
  },
  analyzingCards: {
    width: '100%',
    marginBottom: 24,
  },
  analyzingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  analyzingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  analyzingText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  analyzingBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  techCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  techTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  techStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  techStepText: {
    fontSize: 13,
  },
  techStepComplete: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});
