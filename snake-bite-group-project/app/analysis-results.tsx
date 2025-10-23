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
import { useTheme } from './context/ThemeContext';
import SnakeDetailModal from '../components/SnakeDetailModal';
import * as Location from 'expo-location';
import reportStorage from '../services/reportStorage';
import locationCache from '../utils/locationCache';

export default function AnalysisResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();
  const [snakeModalVisible, setSnakeModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>('Location unavailable');
  const [reportSaved, setReportSaved] = useState(false);

  // Mock result - in real app, this would come from AI analysis
  const result = {
    snakeId: 1, // Copperhead ID from database
    snakeName: 'Copperhead',
    scientific: 'Agkistrodon contortrix',
    confidence: 92,
    venomous: true,
    dangerLevel: 'MODERATE',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Agkistrodon_contortrix_contortrix_CDC-a.png',
  };

  useEffect(() => {
    getLocationInfo();
    
    // DEBUG: Log what params we received
    console.log('=== ANALYSIS RESULTS PARAMS ===');
    console.log('All params:', params);
    console.log('Snake Photo URI:', params.snakePhotoUri);
    console.log('Bite Photo URI:', params.bitePhotoUri);
    console.log('Description:', params.description);
    console.log('Types:', {
      snakePhoto: typeof params.snakePhotoUri,
      bitePhoto: typeof params.bitePhotoUri,
      description: typeof params.description,
    });
    console.log('==============================');
  }, []);

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

  const saveReportToHistory = async () => {
    try {
      const reportId = `report_${Date.now()}`;
      const now = new Date();
      
      // Extract and clean the params
      const snakePhotoUri = typeof params.snakePhotoUri === 'string' && params.snakePhotoUri.trim() !== '' 
        ? params.snakePhotoUri 
        : undefined;
      const bitePhotoUri = typeof params.bitePhotoUri === 'string' && params.bitePhotoUri.trim() !== '' 
        ? params.bitePhotoUri 
        : undefined;
      const description = typeof params.description === 'string' && params.description.trim() !== '' 
        ? params.description 
        : undefined;
      
      console.log('=== SAVING REPORT ===');
      console.log('Snake Photo URI (cleaned):', snakePhotoUri);
      console.log('Bite Photo URI (cleaned):', bitePhotoUri);
      console.log('Description (cleaned):', description);
      
      const report = {
        id: reportId,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        snakeType: result.snakeName,
        scientific: result.scientific,
        location: locationName,
        status: result.venomous ? 'Treated' : 'No Treatment Needed',
        severity: (result.venomous ? 'High' : 'Low') as 'Low' | 'Moderate' | 'High',
        confidence: result.confidence,
        venomous: result.venomous,
        dangerLevel: result.dangerLevel,
        snakeImageUrl: result.imageUrl,
        snakeId: result.snakeId,
        timestamp: now.getTime(),
        lat: location?.coords.latitude,
        lon: location?.coords.longitude,
        
        // User submitted data
        snakePhotoUri,
        bitePhotoUri,
        description,
      };
      
      console.log('Full report object:', JSON.stringify(report, null, 2));

      await reportStorage.saveReport(report);
      
      console.log('Report saved successfully!');
      
      setReportSaved(true);
      
      Alert.alert(
        'Report Saved',
        'This encounter has been saved to your history.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert(
        'Error',
        'Failed to save report. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analysis Complete</Text>
        <TouchableOpacity onPress={saveReportToHistory}>
          <Ionicons 
            name={reportSaved ? "checkmark-circle" : "bookmark-outline"} 
            size={28} 
            color={reportSaved ? "#16a34a" : colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={48} color="#ffffff" />
          </View>
          <Text style={styles.successTitle}>Species Identified!</Text>
          <Text style={styles.successSubtitle}>Analysis completed successfully</Text>
        </View>

        {/* Save Report Button */}
        {!reportSaved && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#16a34a' }]}
            onPress={saveReportToHistory}
          >
            <Ionicons name="bookmark" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save to History</Text>
          </TouchableOpacity>
        )}

        {reportSaved && (
          <View style={[styles.savedBanner, { backgroundColor: '#dcfce7', borderColor: '#16a34a' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.savedBannerText}>Report saved to history</Text>
          </View>
        )}

        {/* Main Result Card */}
        <View style={[styles.resultCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}>
          <View style={styles.resultHeader}>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{result.confidence}% Match</Text>
            </View>
          </View>

          <Image source={{ uri: result.imageUrl }} style={styles.resultImage} />

          <View style={styles.resultInfo}>
            <View style={styles.resultTitleRow}>
              <Ionicons name="warning" size={32} color="#dc2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultName, { color: colors.textPrimary }]}>
                  {result.snakeName}
                </Text>
                <Text style={[styles.resultScientific, { color: colors.textSecondary }]}>
                  {result.scientific}
                </Text>
              </View>
            </View>

            <View style={[styles.dangerBadge, styles.dangerModerate]}>
              <Ionicons name="alert-circle" size={20} color="#ffffff" />
              <Text style={styles.dangerText}>
                {result.venomous ? 'VENOMOUS' : 'NON-VENOMOUS'} - {result.dangerLevel} DANGER
              </Text>
            </View>
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={28} color="#dc2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Immediate Action Required</Text>
            <Text style={styles.warningText}>
              This is a venomous snake. Seek medical attention immediately, even if you feel fine. Symptoms may be delayed.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            What to Do Now
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyAction]}
            onPress={() => router.push('/emergency-contacts')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="call" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Call Emergency Services</Text>
              <Text style={styles.actionSubtitle}>999 (UK) or 911 (US)</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.hospitalAction]}
            onPress={() => router.push('/nearest-hospital')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2563eb' }]}>
              <Ionicons name="navigate" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                Find Nearest Hospital
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                Get directions with GPS
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.firstAidAction]}
            onPress={() => router.push('/first-aid')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#16a34a' }]}>
              <Ionicons name="medical" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                First Aid Instructions
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                What to do while waiting
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* View Full Details */}
        <TouchableOpacity
          style={[styles.detailsButton, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
          onPress={() => setSnakeModalVisible(true)}
        >
          <Ionicons name="book" size={20} color="#2563eb" />
          <Text style={[styles.detailsButtonText, { color: '#2563eb' }]}>
            View Full Snake Details
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#2563eb" />
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            AI analysis is for reference only. Always seek professional medical evaluation for snake bites.
          </Text>
        </View>
      </ScrollView>

      {/* Snake Detail Modal */}
      <SnakeDetailModal
        visible={snakeModalVisible}
        snakeId={result.snakeId}
        onClose={() => setSnakeModalVisible(false)}
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
  content: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  savedBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  successBanner: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#64748b',
  },
  resultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    padding: 16,
    alignItems: 'flex-end',
  },
  confidenceBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultImage: {
    width: '100%',
    height: 240,
  },
  resultInfo: {
    padding: 20,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultScientific: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  dangerModerate: {
    backgroundColor: '#f59e0b',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyAction: {
    backgroundColor: '#dc2626',
  },
  hospitalAction: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  firstAidAction: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});