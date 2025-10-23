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
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import SnakeDetailModal from '../components/SnakeDetailModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Report {
  id: string;
  date: string;
  time: string;
  snakeType: string;
  scientific: string;
  location: string;
  status: string;
  severity: 'Low' | 'Moderate' | 'High';
  confidence: number;
  venomous: boolean;
  snakePhotoUri?: string;
  bitePhotoUri?: string;
  description?: string;
  dangerLevel: string;
  snakeImageUrl?: string;
  snakeId?: number;
  timestamp: number;
  lat?: number;
  lon?: number;
}

const REPORTS_KEY = '@ophid_reports';

class ReportStorageService {
  async getReportById(id: string): Promise<Report | null> {
    try {
      const reportsJson = await AsyncStorage.getItem(REPORTS_KEY);
      if (reportsJson) {
        const reports: Report[] = JSON.parse(reportsJson);
        return reports.find(r => r.id === id) || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      const reportsJson = await AsyncStorage.getItem(REPORTS_KEY);
      if (!reportsJson) return;
      
      const reports: Report[] = JSON.parse(reportsJson);
      const report = reports.find(r => r.id === id);
      
      // Delete associated photos
      if (report?.snakePhotoUri) {
        await this.deletePhoto(report.snakePhotoUri);
      }
      if (report?.bitePhotoUri) {
        await this.deletePhoto(report.bitePhotoUri);
      }
      
      // Remove report from array
      const updatedReports = reports.filter(r => r.id !== id);
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  async deletePhoto(photoUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }
}

const reportStorage = new ReportStorageService();

export default function ReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, colors } = useTheme();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [snakeModalVisible, setSnakeModalVisible] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const reportId = params.reportId as string;
      console.log('Loading report with ID:', reportId); // DEBUG
      
      const loadedReport = await reportStorage.getReportById(reportId);
      console.log('Loaded report:', loadedReport); // DEBUG
      
      if (loadedReport) {
        console.log('Snake Photo URI:', loadedReport.snakePhotoUri); // DEBUG
        console.log('Bite Photo URI:', loadedReport.bitePhotoUri); // DEBUG
        console.log('Description:', loadedReport.description); // DEBUG
      }
      
      setReport(loadedReport);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportStorage.deleteReport(report!.id);
              Alert.alert('Success', 'Report deleted', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const openFullscreenImage = (uri: string) => {
    setFullscreenImage(uri);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  const openSnakeGuide = () => {
    setSnakeModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>Report not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Report Details</Text>
        <View 
          style={styles.deleteButtonWrapper}
          // @ts-ignore - Web-specific props
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <TouchableOpacity 
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Report Header */}
        <View style={[styles.reportHeader, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.reportHeaderRow}>
            <View style={[
              styles.severityBadge,
              { backgroundColor: report.severity === 'High' ? '#dc2626' : report.severity === 'Moderate' ? '#f59e0b' : '#2563eb' }
            ]}>
              <Ionicons 
                name={report.severity === 'High' ? 'warning' : report.severity === 'Moderate' ? 'alert-circle' : 'checkmark-circle'}
                size={24}
                color="#ffffff"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.snakeName, { color: colors.textPrimary }]}>
                {report.snakeType}
              </Text>
              <Text style={[styles.scientific, { color: colors.textSecondary }]}>
                {report.scientific}
              </Text>
            </View>
          </View>

          <View style={[styles.dangerBadge, { backgroundColor: report.venomous ? '#dc2626' : '#f59e0b' }]}>
            <Ionicons name={report.venomous ? "warning" : "information-circle"} size={16} color="#ffffff" />
            <Text style={styles.dangerText}>
              {report.venomous ? 'VENOMOUS' : 'NON-VENOMOUS'} - {report.dangerLevel}
            </Text>
          </View>

          {report.confidence && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{report.confidence}% Match Confidence</Text>
            </View>
          )}
        </View>

        {/* AI Analysis Summary */}
        <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color="#2563eb" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              AI Analysis Results
            </Text>
          </View>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={[styles.analysisLabel, { color: colors.textSecondary }]}>Species</Text>
              <Text style={[styles.analysisValue, { color: colors.textPrimary }]}>{report.snakeType}</Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={[styles.analysisLabel, { color: colors.textSecondary }]}>Confidence</Text>
              <Text style={[styles.analysisValue, { color: colors.textPrimary }]}>{report.confidence}%</Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={[styles.analysisLabel, { color: colors.textSecondary }]}>Venomous</Text>
              <Text style={[styles.analysisValue, { color: report.venomous ? '#dc2626' : '#16a34a' }]}>
                {report.venomous ? 'YES' : 'NO'}
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={[styles.analysisLabel, { color: colors.textSecondary }]}>Danger Level</Text>
              <Text style={[styles.analysisValue, { color: colors.textPrimary }]}>{report.dangerLevel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.guideButton, { backgroundColor: '#2563eb' }]}
            onPress={openSnakeGuide}
          >
            <Ionicons name="book" size={20} color="#ffffff" />
            <Text style={styles.guideButtonText}>View Full Species Guide</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Snake Database Image */}
        {report.snakeImageUrl && (
          <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="image" size={20} color="#7c3aed" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Reference Image
              </Text>
            </View>
            <Text style={[styles.imageSubtitle, { color: colors.textSecondary }]}>
              Database photo of {report.snakeType}
            </Text>
            <TouchableOpacity onPress={() => openFullscreenImage(report.snakeImageUrl!)}>
              <Image 
                source={{ uri: report.snakeImageUrl }} 
                style={styles.snakeImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Ionicons name="expand" size={24} color="#ffffff" />
                <Text style={styles.imageOverlayText}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* User Submitted Photos */}
        {(report.snakePhotoUri || report.bitePhotoUri) && (
          <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={20} color="#16a34a" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Your Submitted Photos
              </Text>
            </View>
            <Text style={[styles.imageSubtitle, { color: colors.textSecondary }]}>
              Photos you took during the encounter
            </Text>
            
            {report.snakePhotoUri && report.snakePhotoUri.trim() !== '' && (
              <View style={styles.photoContainer}>
                <View style={styles.photoLabel}>
                  <Ionicons name="image" size={16} color="#2563eb" />
                  <Text style={[styles.photoLabelText, { color: colors.textSecondary }]}>
                    Snake Photo
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => openFullscreenImage(report.snakePhotoUri!)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: report.snakePhotoUri }} 
                    style={styles.userPhoto}
                    resizeMode="cover"
                    onError={(error) => console.log('Snake photo load error:', error)}
                    onLoad={() => console.log('Snake photo loaded successfully')}
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={24} color="#ffffff" />
                    <Text style={styles.imageOverlayText}>Tap to enlarge</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {report.bitePhotoUri && report.bitePhotoUri.trim() !== '' && (
              <View style={styles.photoContainer}>
                <View style={styles.photoLabel}>
                  <Ionicons name="bandage" size={16} color="#dc2626" />
                  <Text style={[styles.photoLabelText, { color: colors.textSecondary }]}>
                    Bite Photo
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => openFullscreenImage(report.bitePhotoUri!)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: report.bitePhotoUri }} 
                    style={styles.userPhoto}
                    resizeMode="cover"
                    onError={(error) => console.log('Bite photo load error:', error)}
                    onLoad={() => console.log('Bite photo loaded successfully')}
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={24} color="#ffffff" />
                    <Text style={styles.imageOverlayText}>Tap to enlarge</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* User Description */}
        {report.description && report.description.trim() !== '' && (
          <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#16a34a" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Your Description
              </Text>
            </View>
            <View style={[styles.descriptionBox, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }]}>
              <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                {report.description}
              </Text>
            </View>
          </View>
        )}

        {/* Report Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Report Information
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#2563eb" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date & Time:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {report.date} at {report.time}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#2563eb" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {report.location}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="medical-outline" size={18} color="#2563eb" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {report.status}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={18} color="#2563eb" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Severity:</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {report.severity}
            </Text>
          </View>
        </View>

        {/* Warning */}
        {report.venomous && (
          <View style={[styles.warningBox, { backgroundColor: darkMode ? '#450a0a' : '#fee2e2', borderColor: '#dc2626' }]}>
            <Ionicons name="warning" size={24} color="#dc2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Venomous Snake</Text>
              <Text style={styles.warningText}>
                If you were bitten by this snake, seek immediate medical attention. Keep this report to show medical professionals.
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dc2626' }]}
            onPress={() => router.push('/emergency-contacts')}
          >
            <Ionicons name="call" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Emergency Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2563eb' }]}
            onPress={() => router.push('/nearest-hospital')}
          >
            <Ionicons name="navigate" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Find Hospital</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#16a34a' }]}
            onPress={() => router.push('/first-aid')}
          >
            <Ionicons name="medical" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>First Aid Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={fullscreenImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullscreenImage}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity 
            style={styles.fullscreenClose}
            onPress={closeFullscreenImage}
          >
            <Ionicons name="close-circle" size={40} color="#ffffff" />
          </TouchableOpacity>
          {fullscreenImage && (
            <Image 
              source={{ uri: fullscreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.fullscreenHint}>
            <Ionicons name="resize" size={20} color="#ffffff" />
            <Text style={styles.fullscreenHintText}>Pinch to zoom</Text>
          </View>
        </View>
      </Modal>

      {/* Snake Detail Modal */}
      <SnakeDetailModal
        visible={snakeModalVisible}
        snakeId={report?.snakeId || 1} // Use the saved snake ID
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportHeader: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  severityBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snakeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scientific: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  confidenceBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  snakeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  photoLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  descriptionBox: {
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  guideButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  imageSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  fullscreenHint: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  fullscreenHintText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});