import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SideMenu from '../components/SideMenu';
import NearbyMedicalServices from '../components/NearbyMedicalServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './_context/ThemeContext';
import locationCache from '../utils/locationCache';

export default function NearestHospitalScreen() {
  const router = useRouter();
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Use the theme context instead of hardcoding
  const { darkMode, colors } = useTheme();

  const handleMenuNavigation = (screen: string) => {
    setMenuOpen(false);
    if (screen === 'home') {
      setTimeout(() => router.push('/'), 300);
    } else if (screen === 'snakeguide') {
      setTimeout(() => router.push('/snake-guide'), 300);
    } else if (screen === 'firstaid') {
      setTimeout(() => router.push('/first-aid'), 300);
    } else if (screen === 'emergency') {
      setTimeout(() => router.push('/emergency-contacts'), 300);
    } else if (screen === 'history') {
      setTimeout(() => router.push('/(tabs)/history'), 300);
    } else if (screen === 'settings') {
      setTimeout(() => router.push('/(tabs)/settings'), 300);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem('units');
      if (savedUnits) {
        setUnits(savedUnits as 'metric' | 'imperial');
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleViewMoreContacts = () => {
    router.push('/emergency-contacts');
  };

  return (
    <>
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleMenuNavigation}
        darkMode={darkMode}
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Ionicons name="menu" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Nearest Hospital</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.emergencyNotice, { backgroundColor: darkMode ? '#450a0a' : '#fee2e2', borderColor: '#dc2626' }]}>
            <Ionicons name="warning" size={20} color="#dc2626" />
            <Text style={[styles.emergencyText, { color: darkMode ? '#fca5a5' : '#dc2626' }]}>
              In case of snake bite emergency, call 999 (UK) or 911 (US) immediately
            </Text>
          </View>

          <NearbyMedicalServices 
            darkMode={darkMode}
            colors={colors}
            units={units}
            showLocationCard={true}
            onViewMoreContacts={handleViewMoreContacts}
          />
        </ScrollView>
      </SafeAreaView>
    </>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emergencyNotice: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
