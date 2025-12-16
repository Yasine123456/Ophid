import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function RootLayout() {
  const [fallbackModalVisible, setFallbackModalVisible] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');

  useEffect(() => {
    const initModels = async () => {
      // Check for Expo Go environment immediately
      const isExpoGo = Constants.appOwnership === 'expo';

      if (isExpoGo) {
        console.log('Expo Go detected in RootLayout. Enabling cloud mode.');
        try {
          const modelService = await import('../services/modelService');
          if (modelService.enableFallbackMode) {
            modelService.enableFallbackMode('Running in Expo Go');
          }

          setFallbackReason('Running in Expo Go (cloud mode only)');
          setFallbackModalVisible(true);
        } catch (err) {
          console.error('Failed to init cloud mode:', err);
        }
        return;
      }

      // Only attempt model loading on native platforms (development builds)
      if (Platform.OS === 'web') {
        console.log('Web platform: Using Gemini API');
        return;
      }

      try {
        // Dynamically import to avoid issues if module fails to load
        const modelService = await import('../services/modelService');

        // Register callback for fallback notification
        if (modelService.setFallbackCallback) {
          modelService.setFallbackCallback((reason: string) => {
            console.log('Fallback callback triggered:', reason);
            setFallbackReason(reason);
            setFallbackModalVisible(true);
          });
        }

        // Attempt to load models
        if (modelService.loadModels) {
          await modelService.loadModels();
        }

        // Log the inference mode
        if (modelService.getInferenceType) {
          console.log(`Inference mode: ${modelService.getInferenceType()}`);
        }
      } catch (err: any) {
        console.error('Model initialization error:', err?.message || err);

        // Show fallback modal for initialization errors
        setFallbackReason('App initialization error');
        setFallbackModalVisible(true);
      }
    };

    // Small delay to ensure UI is mounted
    const timer = setTimeout(initModels, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="snake-guide" options={{ headerShown: false }} />
        <Stack.Screen name="nearest-hospital" options={{ headerShown: false }} />
        <Stack.Screen name="first-aid" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
        <Stack.Screen name="submit-analysis" options={{ headerShown: false }} />
        <Stack.Screen name="analysis-loading" options={{ headerShown: false }} />
        <Stack.Screen name="analysis-results" options={{ headerShown: false }} />
        <Stack.Screen name="report-detail" options={{ headerShown: false }} />
      </Stack>

      {/* Fallback Notification Modal */}
      <Modal
        visible={fallbackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFallbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-outline" size={48} color="#2563eb" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Cloud Mode Active</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              The app will use cloud-based AI analysis for snake identification.
            </Text>

            {/* Reason */}
            <View style={styles.reasonContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#64748b" />
              <Text style={styles.reasonText}>{fallbackReason}</Text>
            </View>

            {/* Warning */}
            <View style={styles.warningContainer}>
              <Ionicons name="wifi-outline" size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                An internet connection is required for snake identification to work.
              </Text>
            </View>

            {/* Benefits note */}
            <View style={styles.benefitContainer}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
              <Text style={styles.benefitText}>
                Cloud analysis provides highly accurate results powered by Google's Gemini AI.
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setFallbackModalVisible(false)}
            >
              <Text style={styles.buttonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  reasonText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
    lineHeight: 18,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
    width: '100%',
  },
  benefitText: {
    fontSize: 13,
    color: '#16a34a',
    flex: 1,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});