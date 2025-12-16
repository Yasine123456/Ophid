import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import SnakeDetailModal from '../components/SnakeDetailModal';
import * as Location from 'expo-location';
import reportStorage from '../services/reportStorage';
import type { Report } from '../services/reportStorage';
import locationCache from '../utils/locationCache';
import { SNAKES_DATABASE, Snake } from '../types/snake';

const createUnknownSnake = (scientificName: string, userImageUri: string): Snake => ({
  id: 0,
  name: 'Unknown Species',
  scientific: scientificName,
  venomous: false,
  region: 'N/A',
  description: `The AI identified this as "${scientificName}", but it is not in our local database. This could be a rare species, a non-native species, or a misidentification.`,
  identification: 'No further identification details available.',
  danger: 'UNKNOWN - Exercise caution',
  imageUrl: userImageUri || 'https://via.placeholder.com/300x200?text=No+Image',
  keyFeatures: [],
});

export default function AnalysisResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();

  const [snakeModalVisible, setSnakeModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>('Locating...');
  const [reportSaved, setReportSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Extract params
  const scientificNameFromModel = (params.analysisResult as string) || 'Unknown species';
  const userSnakePhotoUri = (params.snakePhotoUri as string) || '';
  const userBitePhotoUri = (params.bitePhotoUri as string) || '';
  const userDescription = (params.description as string) || '';

  // Find matching snake in database - try multiple matching strategies
  const findMatchingSnake = (): Snake | null => {
    const searchTerm = scientificNameFromModel.toLowerCase().trim();

    // 1. Exact scientific name match
    let match = SNAKES_DATABASE.find(
      (s) => s.scientific.toLowerCase() === searchTerm
    );
    if (match) return match;

    // 2. Partial scientific name match (in case model returns extra text)
    match = SNAKES_DATABASE.find(
      (s) => searchTerm.includes(s.scientific.toLowerCase()) ||
        s.scientific.toLowerCase().includes(searchTerm)
    );
    if (match) return match;

    // 3. Common name match
    match = SNAKES_DATABASE.find(
      (s) => s.name.toLowerCase() === searchTerm ||
        searchTerm.includes(s.name.toLowerCase())
    );
    if (match) return match;

    // 4. Check if any word in the response matches a scientific name genus
    const words = searchTerm.split(/\s+/);
    for (const word of words) {
      if (word.length < 4) continue; // Skip short words
      match = SNAKES_DATABASE.find(
        (s) => s.scientific.toLowerCase().startsWith(word) ||
          s.scientific.toLowerCase().includes(word)
      );
      if (match) return match;
    }

    return null;
  };

  const matchedSnake = findMatchingSnake();

  // Use matched snake or create unknown snake entry
  const result = matchedSnake || createUnknownSnake(scientificNameFromModel, userSnakePhotoUri);
  const isKnownSnake = !!matchedSnake;

  useEffect(() => {
    const getLocationInfo = async () => {
      try {
        const locationData = await locationCache.getLocation();
        setLocation({ coords: locationData.coords } as Location.LocationObject);
        setLocationName(locationData.locationName);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationName('Location unavailable');
      }
    };
    getLocationInfo();
  }, []);

  // Log the identification result for debugging
  useEffect(() => {
    console.log('=== Analysis Results ===');
    console.log('Model output:', scientificNameFromModel);
    console.log('Matched snake:', matchedSnake?.name || 'None');
    console.log('Is known species:', isKnownSnake);
  }, [scientificNameFromModel, matchedSnake, isKnownSnake]);

  const saveReportToHistory = async () => {
    if (isSaving || reportSaved) {
      return;
    }

    setIsSaving(true);

    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      let severity: 'Low' | 'Moderate' | 'High' = 'Low';
      if (result.danger.toUpperCase().includes('HIGH')) {
        severity = 'High';
      } else if (result.danger.toUpperCase().includes('MODERATE')) {
        severity = 'Moderate';
      } else if (result.danger.toUpperCase().includes('UNKNOWN')) {
        severity = 'Moderate'; // Default unknown to moderate for safety
      }

      const report: Report = {
        id: reportId,
        date: now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        snakeType: result.name,
        scientific: result.scientific,
        location: locationName,
        status: result.venomous ? 'Requires Attention' : 'No Treatment Needed',
        severity: severity,
        confidence: isKnownSnake ? 85 : 50,
        venomous: result.venomous,
        dangerLevel: result.danger,
        snakeImageUrl: result.imageUrl,
        snakeId: result.id,
        timestamp: now.getTime(),
        lat: location?.coords.latitude,
        lon: location?.coords.longitude,
        snakePhotoUri: userSnakePhotoUri || undefined,
        bitePhotoUri: userBitePhotoUri || undefined,
        description: userDescription || undefined,
      };

      console.log('Saving report:', report.id);

      await reportStorage.saveReport(report);

      setReportSaved(true);
      Alert.alert(
        'Report Saved',
        'This snake encounter has been saved to your history.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert(
        'Save Failed',
        'Could not save the report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewSnakeDetails = () => {
    if (isKnownSnake) {
      // Open modal with the specific snake
      setSnakeModalVisible(true);
    } else {
      // Open search modal so user can find the snake manually
      Alert.alert(
        'Species Not in Database',
        `"${scientificNameFromModel}" was not found in our local database. Would you like to search our snake guide manually?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Search Guide',
            onPress: () => setSearchModalVisible(true),
          },
        ]
      );
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleGoHome}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analysis Complete</Text>
        <TouchableOpacity
          onPress={saveReportToHistory}
          disabled={reportSaved || isSaving}
          style={styles.saveButton}
        >
          {isSaving ? (
            <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
          ) : (
            <Ionicons
              name={reportSaved ? 'checkmark-circle' : 'bookmark-outline'}
              size={28}
              color={reportSaved ? '#16a34a' : colors.textPrimary}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Confidence Banner */}
        <View style={[styles.confidenceBanner, { backgroundColor: isKnownSnake ? '#dcfce7' : '#fef3c7' }]}>
          <Ionicons
            name={isKnownSnake ? 'checkmark-circle' : 'help-circle'}
            size={24}
            color={isKnownSnake ? '#16a34a' : '#f59e0b'}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.confidenceTitle, { color: isKnownSnake ? '#166534' : '#92400e' }]}>
              {isKnownSnake ? 'Species Identified' : 'Identification Uncertain'}
            </Text>
            <Text style={[styles.confidenceText, { color: isKnownSnake ? '#15803d' : '#a16207' }]}>
              {isKnownSnake
                ? `Matched to ${result.name} in our database`
                : `"${scientificNameFromModel}" not found in local database`}
            </Text>
          </View>
        </View>

        {/* Result Card */}
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: result.venomous ? '#dc2626' : isKnownSnake ? '#16a34a' : '#64748b',
            },
          ]}
        >
          <Image source={{ uri: result.imageUrl }} style={styles.resultImage} />

          <View style={styles.resultInfo}>
            <View style={styles.resultTitleRow}>
              {isKnownSnake ? (
                <Ionicons
                  name={result.venomous ? 'warning' : 'shield-checkmark'}
                  size={32}
                  color={result.venomous ? '#dc2626' : '#16a34a'}
                />
              ) : (
                <Ionicons name="help-circle" size={32} color="#64748b" />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultName, { color: colors.textPrimary }]}>
                  {result.name}
                </Text>
                <Text style={[styles.resultScientificName, { color: colors.textSecondary }]}>
                  {result.scientific}
                </Text>
              </View>
            </View>

            {/* Danger Badge */}
            <View
              style={[
                styles.dangerBadge,
                {
                  backgroundColor: result.venomous
                    ? '#dc2626'
                    : isKnownSnake
                      ? '#16a34a'
                      : '#64748b',
                },
              ]}
            >
              <Ionicons
                name={result.venomous ? 'warning' : isKnownSnake ? 'shield-checkmark' : 'help'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.dangerText}>{result.danger}</Text>
            </View>
          </View>
        </View>

        {/* Warning Banners */}
        {!isKnownSnake ? (
          <View style={[styles.warningBanner, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <Ionicons name="information-circle" size={28} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: '#92400e' }]}>
                Unrecognized Species
              </Text>
              <Text style={[styles.warningText, { color: '#a16207' }]}>
                The AI returned "{scientificNameFromModel}" which is not in our local guide.
                This could be a rare/regional species or a misidentification.
                Please exercise caution and consider seeking expert verification.
              </Text>
            </View>
          </View>
        ) : result.venomous ? (
          <View style={[styles.warningBanner, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
            <Ionicons name="warning" size={28} color="#dc2626" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: '#991b1b' }]}>
                Venomous Snake - Immediate Action Required
              </Text>
              <Text style={[styles.warningText, { color: '#b91c1c' }]}>
                This snake is considered venomous. If a bite has occurred, seek immediate medical attention.
                Do not wait for symptoms to appear.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Snake Details Button */}
        <TouchableOpacity
          style={[
            styles.detailsButton,
            {
              backgroundColor: isKnownSnake ? '#eff6ff' : colors.cardBg,
              borderColor: isKnownSnake ? '#2563eb' : colors.border,
            },
          ]}
          onPress={handleViewSnakeDetails}
        >
          <Ionicons name="book" size={20} color={isKnownSnake ? '#2563eb' : colors.textSecondary} />
          <Text
            style={[
              styles.detailsButtonText,
              { color: isKnownSnake ? '#1e40af' : colors.textSecondary },
            ]}
          >
            {isKnownSnake ? `View ${result.name} Details` : 'Search Snake Guide'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isKnownSnake ? '#2563eb' : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Key Features (if known snake) */}
        {isKnownSnake && result.keyFeatures && result.keyFeatures.length > 0 && (
          <View style={[styles.featuresCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>
              Key Identification Features
            </Text>
            <View style={styles.featuresList}>
              {result.keyFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Location Card */}
        <View style={[styles.locationCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="location" size={20} color="#2563eb" />
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            {locationName}
          </Text>
        </View>

        {/* Action Buttons */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          What To Do Next
        </Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
            onPress={() => router.push('/first-aid')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#dc2626' }]}>
              <Ionicons name="medkit" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.actionButtonTitle, { color: '#991b1b' }]}>First Aid</Text>
            <Text style={[styles.actionButtonSubtitle, { color: '#b91c1c' }]}>
              Immediate steps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }]}
            onPress={() => router.push('/nearest-hospital')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#2563eb' }]}>
              <Ionicons name="business" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.actionButtonTitle, { color: '#1e40af' }]}>Hospitals</Text>
            <Text style={[styles.actionButtonSubtitle, { color: '#2563eb' }]}>
              Find nearby
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }]}
            onPress={() => router.push('/emergency-contacts')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#16a34a' }]}>
              <Ionicons name="call" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.actionButtonTitle, { color: '#166534' }]}>Emergency</Text>
            <Text style={[styles.actionButtonSubtitle, { color: '#15803d' }]}>
              Call for help
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Reminder */}
        {!reportSaved && (
          <TouchableOpacity
            style={[styles.saveReminder, { backgroundColor: '#eff6ff', borderColor: '#2563eb' }]}
            onPress={saveReportToHistory}
          >
            <Ionicons name="bookmark-outline" size={24} color="#2563eb" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.saveReminderTitle, { color: '#1e40af' }]}>
                Save This Report
              </Text>
              <Text style={[styles.saveReminderText, { color: '#2563eb' }]}>
                Tap to save this encounter to your history for future reference.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563eb" />
          </TouchableOpacity>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            AI identification is for reference only and should not replace professional medical advice.
            Always seek evaluation from a healthcare professional for any snake bite.
          </Text>
        </View>
      </ScrollView>

      {/* Snake Detail Modal - for known species */}
      <SnakeDetailModal
        visible={snakeModalVisible}
        snakeId={isKnownSnake ? result.id : null}
        onClose={() => setSnakeModalVisible(false)}
        darkMode={darkMode}
        colors={colors}
      />

      {/* Search Modal - for unknown species */}
      <SnakeDetailModal
        visible={searchModalVisible}
        snakeId={null}
        showSearch={true}
        onClose={() => setSearchModalVisible(false)}
        darkMode={darkMode}
        colors={colors}
      />
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
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  confidenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 13,
    marginTop: 2,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: 250,
  },
  resultInfo: {
    padding: 16,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  resultName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  resultScientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  dangerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  featuresCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  saveReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  saveReminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveReminderText: {
    fontSize: 13,
    marginTop: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 32,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});