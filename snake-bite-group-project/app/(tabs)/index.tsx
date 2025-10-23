import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SideMenu from '../../components/SideMenu';
import SnakeDetailModal from '../../components/SnakeDetailModal';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [snakeModalVisible, setSnakeModalVisible] = useState(false);
  const { darkMode, colors } = useTheme();

  const handleAction = (actionName: string) => {
    // Navigate to submission screen with the specific section pre-selected
    if (actionName === 'Upload Snake Photo') {
      router.push({ pathname: '/submit-analysis', params: { section: 'snake' } });
    } else if (actionName === 'Take Bite Photo') {
      router.push({ pathname: '/submit-analysis', params: { section: 'bite' } });
    } else if (actionName === 'Add Description') {
      router.push({ pathname: '/submit-analysis', params: { section: 'description' } });
    }
  };

  const handleMenuNavigation = (screen: string) => {
    setMenuOpen(false);
    if (screen === 'settings') {
      setTimeout(() => router.push('/settings'), 300);
    } else if (screen === 'snakeguide') {
      setTimeout(() => router.push('/snake-guide'), 300);
    } else if (screen === 'hospital') {
      setTimeout(() => router.push('/nearest-hospital'), 300);
    } else if (screen === 'firstaid') {
      setTimeout(() => router.push('/first-aid'), 300);
    } else if (screen === 'emergency') {
      setTimeout(() => router.push('/emergency-contacts'), 300);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleMenuNavigation}
        darkMode={darkMode}
      />

      {/* Snake Search Modal */}
      <SnakeDetailModal
        visible={snakeModalVisible}
        showSearch={true}
        onClose={() => setSnakeModalVisible(false)}
        darkMode={darkMode}
        colors={colors}
      />

      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(true)}
        >
          <Ionicons name="menu" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>O</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ophid</Text>
        </View>
      </View>

      <ScrollView style={styles.mainContent}>
        <View style={[styles.messageCard, { backgroundColor: colors.cardBg, borderColor: darkMode ? '#334155' : '#dbeafe' }]}>
          <Text style={[styles.messageTitle, { color: colors.textPrimary }]}>Stay Calm.</Text>
          <Text style={[styles.messageTitle, { color: colors.textPrimary }]}>Don't Panic.</Text>
          <Text style={[styles.messageSubtitle, { color: colors.textSecondary }]}>We're here to help.</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Upload Snake Photo')}
          >
            <View style={[styles.actionButtonCircle, { backgroundColor: colors.cardBg }]}>
              <Ionicons name="cloud-upload-outline" size={28} color="#2563eb" />
            </View>
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Upload Snake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Take Bite Photo')}
          >
            <View style={[styles.actionButtonCircle, { backgroundColor: colors.cardBg }]}>
              <Ionicons name="camera-outline" size={28} color="#2563eb" />
            </View>
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Take Bite Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Add Description')}
          >
            <View style={[styles.actionButtonCircle, { backgroundColor: colors.cardBg }]}>
              <Ionicons name="create-outline" size={28} color="#2563eb" />
            </View>
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Add Description</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.speciesButton, { backgroundColor: colors.buttonBg }]}
          onPress={() => setSnakeModalVisible(true)}
        >
          <Text style={styles.speciesButtonText}>Not a wild snake?</Text>
          <Text style={styles.speciesButtonText}>Tell us the species here.</Text>
        </TouchableOpacity>

        <View style={[styles.locationNotice, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="location-outline" size={20} color="#2563eb" />
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            Location will be detected automatically
          </Text>
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuButton: {
    position: 'absolute',
    left: 24,
    top: 16,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  messageCard: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  messageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messageSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  speciesButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  speciesButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  locationNotice: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});