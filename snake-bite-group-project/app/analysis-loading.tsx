import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
// Direct import instead of dynamic import
import { runInference } from '../services/modelService';

interface AnalysisImage {
  path: string;
  mime: string;
  type: 'snake' | 'bite';
}

export default function AnalysisLoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();

  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

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

    const performAnalysis = async () => {
      try {
        const { snakePhotoUri, bitePhotoUri, description } = params;

        // Build images array from params
        const images: AnalysisImage[] = [];

        const snakeUri = typeof snakePhotoUri === 'string' ? snakePhotoUri.trim() : '';
        const biteUri = typeof bitePhotoUri === 'string' ? bitePhotoUri.trim() : '';
        const descText = typeof description === 'string' ? description.trim() : '';

        if (snakeUri !== '') {
          images.push({
            path: snakeUri,
            mime: 'image/jpeg',
            type: 'snake',
          });
        }

        if (biteUri !== '') {
          images.push({
            path: biteUri,
            mime: 'image/jpeg',
            type: 'bite',
          });
        }

        console.log('=== Analysis Starting ===');
        console.log(`Snake photo: ${snakeUri ? 'Yes' : 'No'}`);
        console.log(`Bite photo: ${biteUri ? 'Yes' : 'No'}`);
        console.log(`Description: ${descText ? `Yes (${descText.length} chars)` : 'No'}`);

        // Validate input
        if (images.length === 0 && descText === '') {
          Alert.alert(
            'Missing Information',
            'Please provide at least one photo or a description.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }

        console.log('Calling runInference...');

        // Call inference directly
        const result = await runInference(images, descText);

        console.log('Analysis result:', result);

        if (result) {
          router.replace({
            pathname: '/analysis-results',
            params: {
              snakePhotoUri: snakeUri,
              bitePhotoUri: biteUri,
              description: descText,
              analysisResult: result,
            },
          });
        } else {
          throw new Error('No result returned');
        }
      } catch (error) {
        console.error('Analysis error:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        Alert.alert(
          'Analysis Failed',
          `Could not identify the snake: ${errorMessage}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };

    // Short delay for animations
    const timer = setTimeout(performAnalysis, 500);
    return () => clearTimeout(timer);
  }, [params, router]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.content}>
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: pulseValue }] }]}
        >
          <View style={styles.iconCircle}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="flask" size={64} color="#ffffff" />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
          Analyzing...
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Please wait while the AI identifies the snake
        </Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});