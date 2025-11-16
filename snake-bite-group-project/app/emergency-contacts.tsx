import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './_context/ThemeContext';
import SideMenu from '../components/SideMenu';
import * as Location from 'expo-location';
import locationCache from '../utils/locationCache';

interface EmergencyService {
  name: string;
  number: string;
  description: string;
  icon: string;
  color: string;
}

interface CountryEmergencyData {
  country: string;
  countryCode: string;
  services: EmergencyService[];
  specialists: Array<{
    name: string;
    number?: string;
    description: string;
    hours?: string;
    website?: string;
  }>;
}

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const { darkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [countryData, setCountryData] = useState<CountryEmergencyData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
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

  useEffect(() => {
    detectCountry();
  }, []);

  const detectCountry = async () => {
	  try {
		setLoading(true);
		const countryCode = await locationCache.getCountryCode();
		setCountryData(getEmergencyDataByCountry(countryCode));
		setLoading(false);
	  } catch (error) {
		console.error('Error detecting country:', error);
		// Default to UK if detection fails
		setCountryData(getEmergencyDataByCountry('US'));
		setLoading(false);
	  }
	};
	
  const getEmergencyDataByCountry = (countryCode: string): CountryEmergencyData => {
    const emergencyData: { [key: string]: CountryEmergencyData } = {
      'GB': {
        country: 'United Kingdom',
        countryCode: 'GB',
        services: [
          {
            name: 'Emergency Services (999)',
            number: '999',
            description: 'Police, Fire, Ambulance - All emergencies',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'Emergency Services (112)',
            number: '112',
            description: 'European emergency number - works in UK',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'NHS 111',
            number: '111',
            description: 'Non-emergency medical advice',
            icon: 'call',
            color: '#2563eb',
          },
        ],
        specialists: [
          {
            name: 'National Poisons Information Service',
            number: '0344 892 0111',
            description: 'Expert toxicology advice',
            hours: '24/7',
          },
          {
            name: 'TOXBASE (Healthcare Professionals)',
            description: 'Online poisons database for medical staff',
            website: 'www.toxbase.org',
          },
        ],
      },
      'US': {
        country: 'United States',
        countryCode: 'US',
        services: [
          {
            name: 'Emergency Services (911)',
            number: '911',
            description: 'Police, Fire, Ambulance - All emergencies',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'Poison Control',
            number: '1-800-222-1222',
            description: '24/7 Poison emergency hotline',
            icon: 'flask',
            color: '#7c3aed',
          },
        ],
        specialists: [
          {
            name: 'Reptile-Related Injuries Hotline',
            number: '1-800-962-8443',
            description: 'Specialized venomous bite treatment',
            hours: '24/7',
          },
          {
            name: 'National Poison Control',
            number: '1-800-222-1222',
            description: 'Expert poison and venom advice',
            hours: '24/7',
          },
        ],
      },
      'CA': {
        country: 'Canada',
        countryCode: 'CA',
        services: [
          {
            name: 'Emergency Services (911)',
            number: '911',
            description: 'Police, Fire, Ambulance - All emergencies',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'Poison Control',
            number: '1-844-764-7669',
            description: '24/7 Poison emergency hotline',
            icon: 'flask',
            color: '#7c3aed',
          },
        ],
        specialists: [
          {
            name: 'Ontario Poison Centre',
            number: '1-800-268-9017',
            description: 'Expert toxicology advice',
            hours: '24/7',
          },
        ],
      },
      'AU': {
        country: 'Australia',
        countryCode: 'AU',
        services: [
          {
            name: 'Emergency Services (000)',
            number: '000',
            description: 'Police, Fire, Ambulance - All emergencies',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'Emergency Services (112)',
            number: '112',
            description: 'Mobile emergency number',
            icon: 'medical',
            color: '#dc2626',
          },
          {
            name: 'Poisons Information',
            number: '13 11 26',
            description: 'Poison emergency advice',
            icon: 'flask',
            color: '#7c3aed',
          },
        ],
        specialists: [
          {
            name: 'Australian Venom Research Unit',
            description: 'Snake bite and venom research',
            website: 'www.avru.org',
          },
        ],
      },
    };

    // Default to UK if country not found
    return emergencyData[countryCode] || emergencyData['GB'];
  };

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };
  
  if (loading) {
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
			  <Text style={[styles.title, { color: colors.textPrimary }]}>Emergency Contacts</Text>
			  <View style={{ width: 28 }} />
			</View>
			<View style={styles.loadingContainer}>
			  <ActivityIndicator size="large" color="#2563eb" />
			  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
				Detecting your location...
			  </Text>
			</View>
		 </SafeAreaView>
      </>
    );
  }

  if (!countryData) {
    return null;
  }
  
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
			<Text style={[styles.title, { color: colors.textPrimary }]}>Emergency Contacts</Text>
			<TouchableOpacity onPress={detectCountry}>
			  <Ionicons name="refresh" size={24} color={colors.textPrimary} />
			</TouchableOpacity>
		  </View>

		  <ScrollView style={styles.content}>
			{/* Location Banner */}
			<View style={[styles.locationBanner, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
			  <Ionicons name="location" size={20} color="#2563eb" />
			  <Text style={[styles.locationText, { color: colors.textPrimary }]}>
				Emergency numbers for: <Text style={styles.locationCountry}>{countryData.country}</Text>
			  </Text>
			</View>

			<View style={[styles.warningBanner, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
			  <Ionicons name="warning" size={24} color="#dc2626" />
			  <View style={{ flex: 1 }}>
				<Text style={styles.warningTitle}>In Case of Snake Bite</Text>
				<Text style={styles.warningText}>
				  Call emergency services immediately. Time is critical for snake bite treatment.
				</Text>
			  </View>
			</View>

			<View style={styles.section}>
			  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
				Emergency Services
			  </Text>
			  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
				Life-threatening emergencies - call immediately
			  </Text>

			  {countryData.services.map((service, index) => (
				<TouchableOpacity
				  key={index}
				  style={[styles.serviceCard, { backgroundColor: colors.cardBg, borderColor: service.color }]}
				  onPress={() => makeCall(service.number)}
				>
				  <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
					<Ionicons name={service.icon as any} size={24} color="#ffffff" />
				  </View>
				  <View style={styles.serviceInfo}>
					<Text style={[styles.serviceName, { color: colors.textPrimary }]}>
					  {service.name}
					</Text>
					<Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
					  {service.description}
					</Text>
					<Text style={[styles.serviceNumber, { color: service.color }]}>
					  {service.number}
					</Text>
				  </View>
				  <Ionicons name="call" size={24} color={service.color} />
				</TouchableOpacity>
			  ))}
			</View>

			<View style={styles.section}>
			  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
				Specialist Services
			  </Text>
			  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
				Expert poison and venom treatment advice
			  </Text>

			  {countryData.specialists.map((service, index) => (
				<View
				  key={index}
				  style={[styles.specialistCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
				>
				  <View style={styles.specialistHeader}>
					<Ionicons name="shield-checkmark" size={20} color="#7c3aed" />
					<Text style={[styles.specialistName, { color: colors.textPrimary }]}>
					  {service.name}
					</Text>
				  </View>
				  <Text style={[styles.specialistDescription, { color: colors.textSecondary }]}>
					{service.description}
				  </Text>
				  {service.number && (
					<TouchableOpacity
					  style={styles.specialistContact}
					  onPress={() => makeCall(service.number!)}
					>
					  <Ionicons name="call-outline" size={16} color="#7c3aed" />
					  <Text style={[styles.specialistNumber, { color: '#7c3aed' }]}>
						{service.number}
					  </Text>
					  {service.hours && (
						<Text style={[styles.specialistHours, { color: colors.textSecondary }]}>
						  ({service.hours})
						</Text>
					  )}
					</TouchableOpacity>
				  )}
				  {service.website && (
					<View style={styles.specialistWebsite}>
					  <Ionicons name="globe-outline" size={16} color="#2563eb" />
					  <Text style={[styles.websiteText, { color: '#2563eb' }]}>
						{service.website}
					  </Text>
					</View>
				  )}
				</View>
			  ))}
			</View>

			<View style={[styles.tipsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
			  <View style={styles.tipsHeader}>
				<Ionicons name="information-circle" size={24} color="#2563eb" />
				<Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>
				  When Calling for Help
				</Text>
			  </View>
			  <View style={styles.tipsList}>
				<View style={styles.tipItem}>
				  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
				  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
					State clearly that it's a snake bite emergency
				  </Text>
				</View>
				<View style={styles.tipItem}>
				  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
				  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
					Provide your exact location
				  </Text>
				</View>
				<View style={styles.tipItem}>
				  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
				  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
					Describe the snake if possible
				  </Text>
				</View>
				<View style={styles.tipItem}>
				  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
				  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
					Note the time the bite occurred
				  </Text>
				</View>
				<View style={styles.tipItem}>
				  <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
				  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
					Report any symptoms the victim is experiencing
				  </Text>
				</View>
			  </View>
			</View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  locationBanner: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  locationCountry: {
    fontWeight: 'bold',
  },
  warningBanner: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    gap: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  serviceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  specialistCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  specialistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  specialistName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  specialistDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  specialistContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  specialistNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  specialistHours: {
    fontSize: 12,
  },
  specialistWebsite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  websiteText: {
    fontSize: 14,
  },
  tipsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
