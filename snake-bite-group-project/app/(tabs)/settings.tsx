import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import SideMenu from '../../components/SideMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, setDarkMode, colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [units, setUnits] = useState('metric');

  const handleMenuNavigation = (screen: string) => {
    setMenuOpen(false);
    if (screen === 'home') {
      setTimeout(() => router.push('/'), 300);
    } else if (screen === 'snakeguide') {
      setTimeout(() => router.push('/snake-guide'), 300);
    } else if (screen === 'hospital') {
      setTimeout(() => router.push('/nearest-hospital'), 300);
    } else if (screen === 'firstaid') {
      setTimeout(() => router.push('/first-aid'), 300);
    } else if (screen === 'emergency') {
      setTimeout(() => router.push('/emergency-contacts'), 300);
    } else if (screen === 'history') {
      setTimeout(() => router.push('/(tabs)/history'), 300);
    }
  };

  const saveUnits = async (newUnits: string) => {
    try {
      await AsyncStorage.setItem('units', newUnits);
      setUnits(newUnits);
    } catch (error) {
      console.error('Error saving units:', error);
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

      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {darkMode ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={darkMode ? '#2563eb' : '#f1f5f9'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive alerts and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={notifications ? '#2563eb' : '#f1f5f9'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Sound</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Enable notification sounds
                </Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={soundEnabled ? '#2563eb' : '#f1f5f9'}
              disabled={!notifications}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Vibration</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Vibrate on notifications
                </Text>
              </View>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={vibrationEnabled ? '#2563eb' : '#f1f5f9'}
              disabled={!notifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIVACY</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Location Services</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {locationServices ? 'Finding nearest hospitals' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={locationServices ? '#2563eb' : '#f1f5f9'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UNITS</Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => saveUnits(units === 'metric' ? 'imperial' : 'metric')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="speedometer-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Measurement Units</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {units === 'metric' ? 'Metric (km, cm)' : 'Imperial (mi, in)'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#2563eb" />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Version</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  1.0.0
                </Text>
              </View>
            </View>
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
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  menuButton: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
});