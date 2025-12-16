import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Snake, SNAKES_DATABASE } from '../types/snake';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SnakeDetailModalProps {
  visible: boolean;
  snakeId?: number | null;
  showSearch?: boolean;
  onClose: () => void;
  darkMode?: boolean;
  colors: {
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

export default function SnakeDetailModal({
  visible,
  snakeId,
  showSearch = false,
  onClose,
  darkMode = false,
  colors,
}: SnakeDetailModalProps) {
  const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSnakes, setFilteredSnakes] = useState<Snake[]>(SNAKES_DATABASE);
  const [viewMode, setViewMode] = useState<'search' | 'detail'>(showSearch ? 'search' : 'detail');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [snakeModalVisible, setSnakeModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      if (snakeId) {
        const snake = SNAKES_DATABASE.find(s => s.id === snakeId);
        setSelectedSnake(snake || null);
        setViewMode('detail');
      } else if (showSearch) {
        setViewMode('search');
        setSearchQuery('');
      }
    }
  }, [visible, snakeId, showSearch]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSnakes(SNAKES_DATABASE);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = SNAKES_DATABASE.filter(
        snake =>
          snake.name.toLowerCase().includes(query) ||
          snake.scientific.toLowerCase().includes(query) ||
          snake.region.toLowerCase().includes(query) ||
          snake.description.toLowerCase().includes(query)
      );
      setFilteredSnakes(filtered);
    }
  }, [searchQuery]);
  
  const openFullscreenImage = (uri: string) => {
    setFullscreenImage(uri);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  const openSnakeGuide = () => {
    setSnakeModalVisible(true);
  };

  const handleSnakeSelect = (snake: Snake) => {
    setSelectedSnake(snake);
    setViewMode('detail');
  };

  const handleBack = () => {
    if (viewMode === 'detail' && showSearch) {
      setViewMode('search');
      setSelectedSnake(null);
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleBack}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {viewMode === 'search' ? 'Find Snake Species' : selectedSnake?.name || 'Snake Details'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {viewMode === 'search' ? (
          // Search View
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search by name, type, or region..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.searchResults}>
              {filteredSnakes.length === 0 ? (
                <View style={styles.noResults}>
                  <Ionicons name="search" size={48} color={colors.textSecondary} />
                  <Text style={[styles.noResultsText, { color: colors.textPrimary }]}>
                    No snakes found
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: colors.textSecondary }]}>
                    Try a different search term
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                    {filteredSnakes.length} {filteredSnakes.length === 1 ? 'result' : 'results'}
                  </Text>
                  {filteredSnakes.map((snake) => (
                    <TouchableOpacity
                      key={snake.id}
                      style={[styles.searchResultCard, { backgroundColor: colors.cardBg, borderColor: snake.venomous ? '#dc2626' : '#f59e0b' }]}
                      onPress={() => handleSnakeSelect(snake)}
                    >
                      <Image source={{ uri: snake.imageUrl }} style={styles.resultImage} />
                      <View style={styles.resultInfo}>
                        <View style={styles.resultHeader}>
                          <Ionicons 
                            name={snake.venomous ? "warning" : "alert-circle"} 
                            size={20} 
                            color={snake.venomous ? "#dc2626" : "#f59e0b"} 
                          />
                          <Text style={[styles.resultName, { color: colors.textPrimary }]}>
                            {snake.name}
                          </Text>
                        </View>
                        <Text style={[styles.resultScientific, { color: colors.textSecondary }]}>
                          {snake.scientific}
                        </Text>
                        <Text style={[styles.resultRegion, { color: colors.textSecondary }]} numberOfLines={1}>
                          {snake.region}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        ) : (
          // Detail View
          selectedSnake && (
            <ScrollView style={styles.detailContainer}>
			  
			  {/* Snake Database Image */}
			{selectedSnake.imageUrl && (
			  <ScrollView style={styles.detailContainer}>
				<TouchableOpacity onPress={() => openFullscreenImage(selectedSnake.imageUrl!)}>
				  <Image 
					source={{ uri: selectedSnake.imageUrl }} 
					style={styles.detailImage}
					resizeMode="cover"
				  />
				  <View style={styles.imageOverlay}>
					<Ionicons name="expand" size={24} color="#ffffff" />
					<Text style={styles.imageOverlayText}>Tap to enlarge</Text>
				  </View>
				</TouchableOpacity>
			  </ScrollView>
			)}

              {/* Snake Info */}
              <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailHeaderLeft}>
                    <Ionicons 
                      name={selectedSnake.venomous ? "warning" : "alert-circle"} 
                      size={32} 
                      color={selectedSnake.venomous ? "#dc2626" : "#f59e0b"} 
                    />
                    <View style={styles.detailTitleContainer}>
                      <Text style={[styles.detailName, { color: colors.textPrimary }]}>
                        {selectedSnake.name}
                      </Text>
                      <Text style={[styles.detailScientific, { color: colors.textSecondary }]}>
                        {selectedSnake.scientific}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Danger Badge */}
                <View style={[
                  styles.dangerBadge, 
                  selectedSnake.venomous ? styles.dangerHigh : styles.dangerLow
                ]}>
                  <Ionicons 
                    name={selectedSnake.venomous ? "alert-circle" : "information-circle"} 
                    size={16} 
                    color="#ffffff" 
                  />
                  <Text style={styles.dangerText}>{selectedSnake.danger}</Text>
                </View>

                {/* Key Features */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Features</Text>
                  <View style={styles.keyFeaturesGrid}>
                    {selectedSnake.keyFeatures.map((feature, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.featureChip, 
                          { backgroundColor: selectedSnake.venomous 
                            ? (darkMode ? '#450a0a' : '#fee2e2') 
                            : (darkMode ? '#451a03' : '#fef3c7') 
                          }
                        ]}
                      >
                        <Ionicons 
                          name="checkmark-circle" 
                          size={14} 
                          color={selectedSnake.venomous ? "#dc2626" : "#f59e0b"} 
                        />
                        <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Region */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location-outline" size={20} color="#2563eb" />
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Region</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {selectedSnake.region}
                  </Text>
                </View>

                {/* Description */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {selectedSnake.description}
                  </Text>
                </View>

                {/* Identification */}
                <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How to Identify</Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {selectedSnake.identification}
                  </Text>
                </View>

                {/* Warning */}
                <View style={[styles.warningBox, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
                  <Ionicons name="warning" size={20} color="#dc2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningTitle}>Important</Text>
                    <Text style={styles.warningText}>
                      {selectedSnake.venomous 
                        ? 'If bitten, call emergency services immediately. Do not attempt to catch or kill the snake.'
                        : 'Even non-venomous bites should be evaluated by medical professionals. Clean wound and seek medical attention.'}
                    </Text>
                  </View>
                </View>
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
				
              </View>
            </ScrollView>
          )
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  resultRegion: {
    fontSize: 12,
  },
  detailContainer: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 300,
  },
  detailContent: {
    padding: 16,
  },
  detailHeader: {
    marginBottom: 16,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailTitleContainer: {
    flex: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailScientific: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dangerHigh: {
    backgroundColor: '#dc2626',
  },
  dangerLow: {
    backgroundColor: '#f59e0b',
  },
  dangerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  keyFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
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
    lineHeight: 20,
  },
});