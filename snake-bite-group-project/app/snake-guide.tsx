import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './_context/ThemeContext';
import SideMenu from '../components/SideMenu';
import SnakeDetailModal from '../components/SnakeDetailModal';
import { SNAKES_DATABASE } from '../types/snake';

export default function SnakeGuideScreen() {
  const router = useRouter();
  const { darkMode, colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSnakeId, setSelectedSnakeId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
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
  } else if (screen === 'settings') {
    setTimeout(() => router.push('/(tabs)/settings'), 300);
  }
};

  // Get only the 6 most common snakes in North America
  const commonSnakes = SNAKES_DATABASE.filter(s => s.commonInNA);
  const venomousCommon = commonSnakes.filter(s => s.venomous);
  const nonVenomousCommon = commonSnakes.filter(s => !s.venomous);

  const handleSnakeTap = (snakeId: number) => {
    setSelectedSnakeId(snakeId);
    setShowSearch(false);
    setModalVisible(true);
  };

  const handleSearchSnakes = () => {
    setSelectedSnakeId(null);
    setShowSearch(true);
    setModalVisible(true);
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
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
		  <Ionicons name="menu" size={28} color={colors.textPrimary} />
		</TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Snake Guide</Text>
        <TouchableOpacity onPress={handleSearchSnakes}>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Educational Section - Horizontal Tabs */}
        <View style={styles.educationSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Understanding Snake Types
          </Text>
          
          <View style={styles.tabsContainer}>
            {/* Venomous Tab */}
            <View style={[styles.tab, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}>
              <View style={styles.tabIcon}>
                <Ionicons name="warning" size={32} color="#dc2626" />
              </View>
              <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Venomous</Text>
              <Text style={[styles.tabText, { color: colors.textSecondary }]}>
                Inject toxins through fangs when they bite
              </Text>
            </View>

            {/* Poisonous Tab */}
            <View style={[styles.tab, { backgroundColor: colors.cardBg, borderColor: '#7c3aed' }]}>
              <View style={styles.tabIcon}>
                <Ionicons name="skull" size={32} color="#7c3aed" />
              </View>
              <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Poisonous</Text>
              <Text style={[styles.tabText, { color: colors.textSecondary }]}>
                NONE in North America
              </Text>
            </View>

            {/* Non-Venomous Tab */}
            <View style={[styles.tab, { backgroundColor: colors.cardBg, borderColor: '#f59e0b' }]}>
              <View style={styles.tabIcon}>
                <Ionicons name="alert-circle" size={32} color="#f59e0b" />
              </View>
              <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Non-Venomous</Text>
              <Text style={[styles.tabText, { color: colors.textSecondary }]}>
                May bite, still needs medical care
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Reference Grid - 6 Most Common Overall */}
        <View style={styles.quickReferenceSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            6 Most Common Snakes in North America
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tap any snake to see full details
          </Text>
          <View style={styles.gridContainer}>
            {/* Show only the top 6 most commonly encountered snakes */}
            {[
              commonSnakes.find(s => s.name === 'Garter Snake'),
              commonSnakes.find(s => s.name === 'Rat Snake'),
              commonSnakes.find(s => s.name === 'Copperhead'),
              commonSnakes.find(s => s.name === 'Water Snake'),
              commonSnakes.find(s => s.name === 'Kingsnake'),
              commonSnakes.find(s => s.name === 'Gopher Snake'),
            ].filter(Boolean).map((snake) => (
              <TouchableOpacity
                key={snake!.id}
                style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: snake!.venomous ? '#dc2626' : '#f59e0b' }]}
                onPress={() => handleSnakeTap(snake!.id)}
              >
                <View style={[styles.gridDangerStripe, { backgroundColor: snake!.venomous ? '#dc2626' : '#f59e0b' }]} />
                <Image
                  source={snake!.imageUrl}
                  style={styles.gridImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="disk"
                  onError={() => console.warn('Failed to load snake image (grid):', snake!.name)}
                />
                <View style={styles.gridInfo}>
                  <Ionicons 
                    name={snake!.venomous ? "warning" : "alert-circle"} 
                    size={16} 
                    color={snake!.venomous ? "#dc2626" : "#f59e0b"} 
                  />
                  <Text style={[styles.gridName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {snake!.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Button */}
        <View style={styles.searchSection}>
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
            onPress={handleSearchSnakes}
          >
            <Ionicons name="search" size={24} color="#2563eb" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.searchButtonTitle, { color: colors.textPrimary }]}>
                Not a wild snake?
              </Text>
              <Text style={[styles.searchButtonSubtitle, { color: colors.textSecondary }]}>
                Search our complete database to identify the species
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Detailed List - Venomous */}
        <View style={styles.detailedSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            6 Common Venomous Species
          </Text>
          {venomousCommon.map((snake) => (
            <TouchableOpacity
              key={snake.id}
              style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}
              onPress={() => handleSnakeTap(snake.id)}
            >
              <View style={[styles.listDangerStripe, { backgroundColor: '#dc2626' }]} />
              <Image
                source={snake.imageUrl}
                style={styles.listImage}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
                onError={() => console.warn('Failed to load snake image (venomous list):', snake.name)}
              />
              <View style={styles.listContent}>
                <View style={styles.listHeader}>
                  <Ionicons name="warning" size={20} color="#dc2626" />
                  <Text style={[styles.listName, { color: colors.textPrimary }]}>
                    {snake.name}
                  </Text>
                </View>
                <Text style={[styles.listScientific, { color: colors.textSecondary }]}>
                  {snake.scientific}
                </Text>
                <Text style={[styles.listDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {snake.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Detailed List - Non-Venomous */}
        <View style={styles.detailedSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            6 Common Non-Venomous Species
          </Text>
          {nonVenomousCommon.map((snake) => (
            <TouchableOpacity
              key={snake.id}
              style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: '#f59e0b' }]}
              onPress={() => handleSnakeTap(snake.id)}
            >
              <View style={[styles.listDangerStripe, { backgroundColor: '#f59e0b' }]} />
              <Image
                source={snake.imageUrl}
                style={styles.listImage}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
                onError={() => console.warn('Failed to load snake image (non-venomous list):', snake.name)}
              />
              <View style={styles.listContent}>
                <View style={styles.listHeader}>
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  <Text style={[styles.listName, { color: colors.textPrimary }]}>
                    {snake.name}
                  </Text>
                </View>
                <Text style={[styles.listScientific, { color: colors.textSecondary }]}>
                  {snake.scientific}
                </Text>
                <Text style={[styles.listDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {snake.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* After Snake Bite Section */}
        <View style={[styles.afterBiteCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}>
          <View style={styles.afterBiteHeader}>
            <Ionicons name="medical" size={24} color="#dc2626" />
            <Text style={[styles.afterBiteTitle, { color: colors.textPrimary }]}>
              After ANY Snake Bite
            </Text>
          </View>
          <View style={styles.afterBiteList}>
            <View style={styles.afterBiteItem}>
              <Ionicons name="business" size={20} color="#dc2626" />
              <Text style={[styles.afterBiteText, { color: colors.textSecondary }]}>
                Go to nearest hospital immediately
              </Text>
            </View>
            <View style={styles.afterBiteItem}>
              <Ionicons name="water" size={20} color="#2563eb" />
              <Text style={[styles.afterBiteText, { color: colors.textSecondary }]}>
                Clean the wound gently with soap and water
              </Text>
            </View>
            <View style={styles.afterBiteItem}>
              <Ionicons name="bandage" size={20} color="#2563eb" />
              <Text style={[styles.afterBiteText, { color: colors.textSecondary }]}>
                Keep wound clean and covered
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.hospitalButton}
            onPress={() => router.push('/nearest-hospital')}
          >
            <Ionicons name="navigate" size={20} color="#ffffff" />
            <Text style={styles.hospitalButtonText}>Find Nearest Hospital</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => router.push('/emergency-contacts')}
          >
            <Ionicons name="call" size={20} color="#ffffff" />
            <Text style={styles.emergencyButtonText}>Emergency Contacts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Snake Detail Modal */}
      <SnakeDetailModal
        visible={modalVisible}
        snakeId={selectedSnakeId}
        showSearch={showSearch}
        onClose={() => setModalVisible(false)}
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  educationSection: {
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 140,
  },
  tabIcon: {
    marginBottom: 8,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  tabText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  quickReferenceSection: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  gridDangerStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridInfo: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  searchButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchButtonSubtitle: {
    fontSize: 14,
  },
  detailedSection: {
    padding: 16,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  listDangerStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  listImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginLeft: 4,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  listScientific: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 13,
  },
  afterBiteCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  afterBiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  afterBiteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  afterBiteList: {
    gap: 12,
    marginBottom: 16,
  },
  afterBiteItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  afterBiteText: {
    fontSize: 14,
    flex: 1,
  },
  hospitalButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  hospitalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emergencyButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
