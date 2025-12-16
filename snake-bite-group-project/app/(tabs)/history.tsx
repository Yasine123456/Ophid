import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import SideMenu from '../../components/SideMenu';
import { useRouter, useFocusEffect } from 'expo-router';
import reportStorage from '../../services/reportStorage';
import type { Report } from '../../services/reportStorage';

export default function HistoryScreen() {
  const { darkMode, colors } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    try {
      setLoading(true);
      const savedReports = await reportStorage.getAllReports();
      setReports(savedReports);
      console.log(`Loaded ${savedReports.length} reports`);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleDeleteReport = (reportId: string, reportName: string) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete the report for "${reportName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete report:', reportId);
              await reportStorage.deleteReport(reportId);

              // Refresh the list after deletion
              await loadReports();

              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewReport = (reportId: string) => {
    router.push({
      pathname: '/report-detail',
      params: { reportId },
    });
  };

  const handleMenuNavigation = (screen: string) => {
    setMenuOpen(false);
    const routes: Record<string, string> = {
      home: '/',
      settings: '/settings',
      snakeguide: '/snake-guide',
      hospital: '/nearest-hospital',
      firstaid: '/first-aid',
      emergency: '/emergency-contacts',
    };

    if (routes[screen]) {
      setTimeout(() => router.push(routes[screen] as any), 300);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return '#dc2626';
      case 'Moderate':
        return '#f59e0b';
      case 'Low':
        return '#2563eb';
      default:
        return '#64748b';
    }
  };

  const getSeverityIcon = (severity: string): keyof typeof Ionicons.glyphMap => {
    switch (severity) {
      case 'High':
        return 'warning';
      case 'Moderate':
        return 'alert-circle';
      case 'Low':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  // Check if snake is unknown (id 0 or not set)
  const isUnknownSnake = (snakeId?: number) => {
    return snakeId === undefined || snakeId === null || snakeId === 0;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleMenuNavigation}
        darkMode={darkMode}
      />

      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>O</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reports</Text>
        </View>
        <TouchableOpacity onPress={loadReports}>
          <Ionicons name="refresh" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
            Submitted Reports
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            {reports.length === 0
              ? 'No reports yet'
              : `${reports.length} report${reports.length === 1 ? '' : 's'} saved`}
          </Text>
        </View>

        {loading ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Loading Reports...
            </Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No Reports Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your submitted snake encounter reports will appear here
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionButton, { backgroundColor: '#2563eb' }]}
              onPress={() => router.push('/submit-analysis')}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.emptyActionText}>Submit First Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportContainer}>
                {/* Main card - clickable */}
                <TouchableOpacity
                  style={[styles.reportCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  onPress={() => handleViewReport(report.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportHeader}>
                    <View style={styles.reportHeaderLeft}>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: getSeverityColor(report.severity) },
                        ]}
                      >
                        <Ionicons
                          name={getSeverityIcon(report.severity)}
                          size={16}
                          color="#ffffff"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.snakeNameRow}>
                          <Text style={[styles.snakeName, { color: colors.textPrimary }]}>
                            {report.snakeType}
                          </Text>
                          {isUnknownSnake(report.snakeId) && (
                            <View style={styles.unknownBadge}>
                              <Ionicons name="help-circle" size={12} color="#f59e0b" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                          {report.date} at {report.time}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>

                  {/* Show thumbnail if available */}
                  {(report.snakePhotoUri || report.snakeImageUrl) && (
                    <View style={styles.thumbnailContainer}>
                      <Image
                        source={{ uri: report.snakePhotoUri || report.snakeImageUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <View style={styles.reportDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#2563eb" />
                      <Text
                        style={[styles.detailText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {report.location}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons
                        name={report.venomous ? 'warning' : 'shield-checkmark'}
                        size={16}
                        color={report.venomous ? '#dc2626' : '#16a34a'}
                      />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {report.venomous ? 'Venomous' : 'Non-venomous'}
                        {isUnknownSnake(report.snakeId) && ' (Unverified)'}
                      </Text>
                    </View>

                    {report.confidence && (
                      <View style={styles.detailRow}>
                        <Ionicons name="analytics-outline" size={16} color="#2563eb" />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                          {report.confidence}% confidence
                        </Text>
                      </View>
                    )}

                    {/* Show if user submitted photos/description */}
                    <View style={styles.submittedDataRow}>
                      {report.snakePhotoUri && (
                        <View
                          style={[
                            styles.submittedBadge,
                            { backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' },
                          ]}
                        >
                          <Ionicons name="image" size={12} color="#2563eb" />
                          <Text style={[styles.submittedBadgeText, { color: '#2563eb' }]}>
                            Photo
                          </Text>
                        </View>
                      )}
                      {report.bitePhotoUri && (
                        <View
                          style={[
                            styles.submittedBadge,
                            { backgroundColor: darkMode ? '#7f1d1d' : '#fee2e2' },
                          ]}
                        >
                          <Ionicons name="bandage" size={12} color="#dc2626" />
                          <Text style={[styles.submittedBadgeText, { color: '#dc2626' }]}>
                            Bite
                          </Text>
                        </View>
                      )}
                      {report.description && (
                        <View
                          style={[
                            styles.submittedBadge,
                            { backgroundColor: darkMode ? '#14532d' : '#dcfce7' },
                          ]}
                        >
                          <Ionicons name="document-text" size={12} color="#16a34a" />
                          <Text style={[styles.submittedBadgeText, { color: '#16a34a' }]}>
                            Notes
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Delete button - separate from card */}
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.cardBg }]}
                  onPress={() => handleDeleteReport(report.id, report.snakeType)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add new report button at bottom */}
        {reports.length > 0 && (
          <TouchableOpacity
            style={[styles.addReportButton, { backgroundColor: '#2563eb' }]}
            onPress={() => router.push('/submit-analysis')}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" />
            <Text style={styles.addReportButtonText}>Submit New Report</Text>
          </TouchableOpacity>
        )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    padding: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  emptyState: {
    margin: 16,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  reportsList: {
    padding: 16,
  },
  reportContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  reportCard: {
    borderRadius: 16,
    padding: 16,
    paddingRight: 56,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snakeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snakeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unknownBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 2,
  },
  reportDate: {
    fontSize: 13,
    marginTop: 2,
  },
  thumbnailContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  reportDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  submittedDataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  submittedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  addReportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});