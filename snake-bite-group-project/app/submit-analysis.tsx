import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from './_context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

export default function SubmitAnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [snakePhoto, setSnakePhoto] = useState<string | null>(null);
  const [bitePhoto, setBitePhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // Check which section to auto-focus based on params
  const initialSection = params.section as string || 'none';

  const pickImage = async (type: 'snake' | 'bite') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'snake') {
        setSnakePhoto(result.assets[0].uri);
      } else {
        setBitePhoto(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (type: 'snake' | 'bite') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'snake') {
        setSnakePhoto(result.assets[0].uri);
      } else {
        setBitePhoto(result.assets[0].uri);
      }
    }
  };

  const removePhoto = (type: 'snake' | 'bite') => {
    if (type === 'snake') {
      setSnakePhoto(null);
    } else {
      setBitePhoto(null);
    }
  };

  const canAnalyze = snakePhoto || bitePhoto || description.trim().length > 0;

  const handleAnalyze = () => {
    if (!canAnalyze) {
      Alert.alert('Missing Information', 'Please provide at least one: snake photo, bite photo, or description');
      return;
    }

    // Navigate to analysis loading screen
    router.push({
      pathname: '/analysis-loading',
      params: {
        hasSnakePhoto: snakePhoto ? 'true' : 'false',
        hasBitePhoto: bitePhoto ? 'true' : 'false',
        hasDescription: description.trim().length > 0 ? 'true' : 'false',
		// Pass the actual data URIs and description
        snakePhotoUri: snakePhoto || '',
        bitePhotoUri: bitePhoto || '',
        description: description || '',
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Submit for Analysis</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Progress Indicator */}
        <View style={[styles.progressCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, snakePhoto && styles.progressDotComplete]} />
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Snake Photo</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, bitePhoto && styles.progressDotComplete]} />
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Bite Photo</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, description.trim().length > 0 && styles.progressDotComplete]} />
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Description</Text>
          </View>
        </View>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Provide at least one type of information for analysis. More information = better accuracy.
        </Text>

        {/* Snake Photo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image" size={24} color="#2563eb" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Snake Photo
            </Text>
            <View style={[styles.optionalBadge, { backgroundColor: darkMode ? '#334155' : '#e0e7ff' }]}>
              <Text style={[styles.optionalText, { color: '#2563eb' }]}>Optional</Text>
            </View>
          </View>

          {snakePhoto ? (
            <View style={[styles.photoPreview, { borderColor: colors.border }]}>
              <Image source={{ uri: snakePhoto }} style={styles.previewImage} />
              <View style={styles.photoOverlay}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto('snake')}
                >
                  <Ionicons name="close-circle" size={32} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
                onPress={() => takePhoto('snake')}
              >
                <Ionicons name="camera" size={32} color="#2563eb" />
                <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
                onPress={() => pickImage('snake')}
              >
                <Ionicons name="images" size={32} color="#2563eb" />
                <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>
                  Upload Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bite Photo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bandage" size={24} color="#dc2626" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Bite Photo
            </Text>
            <View style={[styles.optionalBadge, { backgroundColor: darkMode ? '#334155' : '#e0e7ff' }]}>
              <Text style={[styles.optionalText, { color: '#2563eb' }]}>Optional</Text>
            </View>
          </View>

          {bitePhoto ? (
            <View style={[styles.photoPreview, { borderColor: colors.border }]}>
              <Image source={{ uri: bitePhoto }} style={styles.previewImage} />
              <View style={styles.photoOverlay}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto('bite')}
                >
                  <Ionicons name="close-circle" size={32} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}
                onPress={() => takePhoto('bite')}
              >
                <Ionicons name="camera" size={32} color="#dc2626" />
                <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}
                onPress={() => pickImage('bite')}
              >
                <Ionicons name="images" size={32} color="#dc2626" />
                <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>
                  Upload Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#16a34a" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Written Description
            </Text>
            <View style={[styles.optionalBadge, { backgroundColor: darkMode ? '#334155' : '#e0e7ff' }]}>
              <Text style={[styles.optionalText, { color: '#2563eb' }]}>Optional</Text>
            </View>
          </View>

          <View style={[styles.descriptionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>
              Describe what you saw:
            </Text>
            <TextInput
              style={[styles.descriptionInput, { 
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              }]}
              placeholder="e.g., 'Brown snake with diamond pattern, about 3 feet long, thick body, found near rocks...'"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <View style={styles.characterCount}>
              <Ionicons name="create" size={14} color={colors.textSecondary} />
              <Text style={[styles.characterCountText, { color: colors.textSecondary }]}>
                {description.length} characters
              </Text>
            </View>
          </View>

          {/* Helpful prompts */}
          <View style={[styles.promptsCard, { backgroundColor: darkMode ? '#1e293b' : '#f0f9ff', borderColor: '#2563eb' }]}>
            <Text style={[styles.promptsTitle, { color: colors.textPrimary }]}>
              Helpful details to include:
            </Text>
            <View style={styles.promptsList}>
              <Text style={[styles.promptItem, { color: colors.textSecondary }]}>
                • Color and pattern (stripes, diamonds, bands)
              </Text>
              <Text style={[styles.promptItem, { color: colors.textSecondary }]}>
                • Size (approximate length)
              </Text>
              <Text style={[styles.promptItem, { color: colors.textSecondary }]}>
                • Head shape (triangular, rounded)
              </Text>
              <Text style={[styles.promptItem, { color: colors.textSecondary }]}>
                • Where found (grass, rocks, water, forest)
              </Text>
              <Text style={[styles.promptItem, { color: colors.textSecondary }]}>
                • Any sounds (rattle, hiss)
              </Text>
            </View>
          </View>
        </View>

        {/* Submission Summary */}
        {canAnalyze && (
          <View style={[styles.summaryCard, { backgroundColor: colors.cardBg, borderColor: '#16a34a' }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Ready to Analyze
              </Text>
            </View>
            <View style={styles.summaryItems}>
              {snakePhoto && (
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark" size={16} color="#16a34a" />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Snake photo uploaded
                  </Text>
                </View>
              )}
              {bitePhoto && (
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark" size={16} color="#16a34a" />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Bite photo uploaded
                  </Text>
                </View>
              )}
              {description.trim().length > 0 && (
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark" size={16} color="#16a34a" />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Description provided ({description.length} chars)
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            { backgroundColor: canAnalyze ? '#16a34a' : '#94a3b8' },
            !canAnalyze && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!canAnalyze}
        >
          <Ionicons name="flask" size={28} color="#ffffff" />
          <Text style={styles.analyzeButtonText}>
            Analyze for Snake Species
          </Text>
          {canAnalyze && <Ionicons name="arrow-forward" size={24} color="#ffffff" />}
        </TouchableOpacity>

        {!canAnalyze && (
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Add at least one photo or description to continue
          </Text>
        )}

        {/* Information Box */}
        <View style={[styles.infoBox, { backgroundColor: darkMode ? '#1e293b' : '#fef3c7', borderColor: '#f59e0b' }]}>
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoBoxTitle, { color: darkMode ? '#fbbf24' : '#92400e' }]}>
              How It Works
            </Text>
            <Text style={[styles.infoBoxText, { color: darkMode ? '#fde68a' : '#92400e' }]}>
              Our AI analyzes your photos and description to identify the snake species and assess danger level. Results are typically ready within seconds.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  progressRow: {
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
  },
  progressDotComplete: {
    backgroundColor: '#16a34a',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  optionalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  photoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    marginBottom: 8,
  },
  characterCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  characterCountText: {
    fontSize: 12,
  },
  promptsCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  promptsList: {
    gap: 6,
  },
  promptItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryItems: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
