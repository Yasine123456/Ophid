import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import locationCache from '../utils/locationCache';

interface Hospital {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  distance: number;
  isOpen: boolean;
  hasEmergency: boolean;
  lat?: number;
  lon?: number;
}

interface NearbyMedicalServicesProps {
  darkMode?: boolean;
  colors: {
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  units: 'metric' | 'imperial';
  showLocationCard?: boolean;
  onViewMoreContacts?: () => void;
}

const PLACEHOLDER_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'Royal Victoria Infirmary',
    type: 'Major Trauma Center',
    address: 'Queen Victoria Rd, Newcastle upon Tyne, NE1 4LP',
    phone: '+44 191 233 6161',
    distance: 1.2,
    isOpen: true,
    hasEmergency: true,
  },
  {
    id: 2,
    name: 'Freeman Hospital',
    type: 'Emergency Department',
    address: 'Freeman Rd, High Heaton, Newcastle upon Tyne, NE7 7DN',
    phone: '+44 191 233 6161',
    distance: 2.3,
    isOpen: true,
    hasEmergency: true,
  },
  {
    id: 3,
    name: 'Newcastle General Hospital',
    type: 'General Hospital',
    address: 'Westgate Rd, Newcastle upon Tyne, NE4 6BE',
    phone: '+44 191 273 8811',
    distance: 3.1,
    isOpen: true,
    hasEmergency: true,
  },
];

export default function NearbyMedicalServices({
  darkMode = false,
  colors,
  units = 'metric',
  showLocationCard = true,
  onViewMoreContacts,
}: NearbyMedicalServicesProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>(PLACEHOLDER_HOSPITALS);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [usingRealData, setUsingRealData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ref to hold the AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getLocation();

    // Cleanup function to abort fetch on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (usingRealData && allHospitals.length > 0) {
      setHospitals(allHospitals.slice(0, displayLimit));
    }
  }, [displayLimit, allHospitals, usingRealData]);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const locationData = await locationCache.getLocation();
      setLocation({ coords: locationData.coords } as Location.LocationObject);

      // Fetch nearby hospitals
      await fetchNearbyHospitals(locationData.coords.latitude, locationData.coords.longitude);
      setLoading(false);
    } catch (err) {
      setError('Unable to get location');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    // Abort previous request if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setFetchError(null);

      const radius = 15000; // 15km radius
      const query = `
        [out:json][timeout:30];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          relation["amenity"="hospital"](around:${radius},${lat},${lon});
          node["healthcare"="hospital"](around:${radius},${lat},${lon});
          way["healthcare"="hospital"](around:${radius},${lat},${lon});
          relation["healthcare"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          way["amenity"="clinic"](around:${radius},${lat},${lon});
          node["amenity"="doctors"](around:${radius},${lat},${lon});
          way["amenity"="doctors"](around:${radius},${lat},${lon});
          node["healthcare"="centre"](around:${radius},${lat},${lon});
          way["healthcare"="centre"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
        },
        signal: controller.signal,
      });

      if (response.status === 429) {
        setFetchError('Rate limited - using nearby data');
        setUsingRealData(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();

      console.log('OSM returned elements:', data.elements?.length || 0);

      if (data.elements && data.elements.length > 0) {
        const processedHospitals = data.elements
          .filter((element: any) => element.tags && element.tags.name)
          .map((element: any, index: number) => {
            // Handle different OSM element types
            const elementLat = element.lat || element.center?.lat;
            const elementLon = element.lon || element.center?.lon;

            if (!elementLat || !elementLon) {
              return null;
            }

            const distance = calculateDistance(lat, lon, elementLat, elementLon);

            // Determine facility type
            let facilityType = 'Medical Clinic';
            const amenity = element.tags.amenity;
            const healthcare = element.tags.healthcare;
            const emergency = element.tags.emergency;

            if (amenity === 'hospital' || healthcare === 'hospital') {
              facilityType = 'Hospital';
            } else if (emergency === 'yes') {
              facilityType = 'Emergency Department';
            } else if (amenity === 'doctors') {
              facilityType = "Doctor's Office";
            } else if (amenity === 'clinic') {
              facilityType = 'Medical Clinic';
            } else if (healthcare === 'centre') {
              facilityType = 'Health Centre';
            }

            return {
              id: index + 1,
              name: element.tags.name,
              type: facilityType,
              address: formatAddress(element.tags),
              phone: element.tags.phone || element.tags['contact:phone'] || 'Not available',
              distance: distance,
              isOpen: true, // Assume open for hospitals
              hasEmergency: facilityType === 'Hospital' || facilityType === 'Emergency Department' || emergency === 'yes',
              lat: elementLat,
              lon: elementLon,
            };
          })
          .filter((h: any) => h !== null) // Remove any nulls
          .sort((a: any, b: any) => a.distance - b.distance);

        console.log('Processed hospitals:', processedHospitals.length); // Clean logging

        if (processedHospitals.length > 0) {
          setAllHospitals(processedHospitals);
          setHospitals(processedHospitals.slice(0, 5));
          setUsingRealData(true);
          setFetchError(null);
        } else {
          setFetchError('No facilities found - using nearby data');
          setUsingRealData(false);
        }
      } else {
        setFetchError('No facilities found - using nearby data');
        setUsingRealData(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Hospital fetch aborted');
        return;
      }
      console.error('Error fetching hospitals:', err);
      // Only set error if we don't have real data to show
      if (!usingRealData) {
        setFetchError('Could not fetch data - using nearby examples');
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatAddress = (tags: any) => {
    const parts = [];
    if (tags['addr:housenumber'] && tags['addr:street']) {
      parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
    } else if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const formatDistance = (distanceInMiles: number) => {
    if (units === 'metric') {
      const km = distanceInMiles * 1.60934;
      return km < 1
        ? `${Math.round(km * 1000)}m away`
        : `${km.toFixed(1)}km away`;
    } else {
      return `${distanceInMiles.toFixed(1)} miles away`;
    }
  };

  const openMaps = (address: string, lat?: number, lon?: number) => {
    let url;
    if (lat && lon) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    Linking.openURL(url);
  };

  const callHospital = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const loadMoreHospitals = () => {
    setLoadingMore(true);

    setTimeout(() => {
      const newLimit = displayLimit + 5;
      setDisplayLimit(newLimit);
      setLoadingMore(false);
    }, 500);
  };

  const hasMoreHospitals = usingRealData && allHospitals.length > hospitals.length;

  return (
    <View style={styles.container}>
      {showLocationCard && (
        <View style={[styles.locationCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.locationHeader}>
            <Ionicons name="navigate" size={24} color="#2563eb" />
            <Text style={[styles.locationTitle, { color: colors.textPrimary }]}>Your Location</Text>
            {usingRealData && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live Data</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Getting your location...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : location ? (
            <View style={styles.locationDetails}>
              <View style={styles.coordRow}>
                <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Latitude:</Text>
                <Text style={[styles.coordValue, { color: colors.textPrimary }]}>
                  {location.coords.latitude.toFixed(6)}°
                </Text>
              </View>
              <View style={styles.coordRow}>
                <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Longitude:</Text>
                <Text style={[styles.coordValue, { color: colors.textPrimary }]}>
                  {location.coords.longitude.toFixed(6)}°
                </Text>
              </View>
              <View style={styles.coordRow}>
                <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Accuracy:</Text>
                <Text style={[styles.coordValue, { color: colors.textPrimary }]}>
                  ±{Math.round(location.coords.accuracy || 0)}m
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {fetchError && (
        <View style={[styles.noticeCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <Text style={styles.noticeText}>{fetchError}</Text>
        </View>
      )}

      <View style={styles.hospitalsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Nearby Medical Facilities
          </Text>
          {location && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => fetchNearbyHospitals(location.coords.latitude, location.coords.longitude)}
            >
              <Ionicons name="refresh" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          {usingRealData ? 'Showing real facilities from OpenStreetMap' : 'Sorted by distance from your location'}
        </Text>

        {hospitals.map((hospital) => (
          <View
            key={hospital.id}
            style={[styles.hospitalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          >
            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalHeaderLeft}>
                <View style={[styles.iconCircle, hospital.hasEmergency ? styles.emergencyCircle : styles.urgentCircle]}>
                  <Ionicons
                    name={hospital.hasEmergency ? "medical" : "fitness"}
                    size={20}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.hospitalTitleContainer}>
                  <Text style={[styles.hospitalName, { color: colors.textPrimary }]}>
                    {hospital.name}
                  </Text>
                  <Text style={[styles.hospitalType, { color: colors.textSecondary }]}>
                    {hospital.type}
                  </Text>
                </View>
              </View>
              {hospital.isOpen && (
                <View style={styles.openBadge}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>Open</Text>
                </View>
              )}
            </View>

            <View style={styles.hospitalDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#2563eb" />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {hospital.address}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#2563eb" />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {hospital.phone}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="navigate-outline" size={16} color="#2563eb" />
                <Text style={[styles.distanceText, { color: colors.textPrimary }]}>
                  {formatDistance(hospital.distance)}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.directionsButton]}
                onPress={() => openMaps(hospital.address, hospital.lat, hospital.lon)}
              >
                <Ionicons name="navigate" size={18} color="#ffffff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => callHospital(hospital.phone)}
                disabled={hospital.phone === 'Not available'}
              >
                <Ionicons name="call" size={18} color="#ffffff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {hasMoreHospitals && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
            onPress={loadMoreHospitals}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={[styles.loadMoreText, { color: '#2563eb' }]}>Loading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="add-circle" size={24} color="#2563eb" />
                <Text style={[styles.loadMoreText, { color: '#2563eb' }]}>
                  Load More Medical Services
                </Text>
                <Text style={[styles.loadMoreSubtext, { color: colors.textSecondary }]}>
                  {allHospitals.length - hospitals.length} more available
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {onViewMoreContacts && (
          <TouchableOpacity
            style={styles.moreContactsButton}
            onPress={onViewMoreContacts}
          >
            <Ionicons name="call" size={24} color="#ffffff" />
            <Text style={styles.moreContactsText}>More Medical Contacts</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationDetails: {
    gap: 8,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  coordLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  coordValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noticeCard: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
  },
  hospitalsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  hospitalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hospitalHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCircle: {
    backgroundColor: '#dc2626',
  },
  urgentCircle: {
    backgroundColor: '#f59e0b',
  },
  hospitalTitleContainer: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hospitalType: {
    fontSize: 13,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  openText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  hospitalDetails: {
    gap: 8,
    marginBottom: 12,
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
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  directionsButton: {
    backgroundColor: '#2563eb',
  },
  callButton: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 4,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadMoreSubtext: {
    fontSize: 13,
  },
  moreContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  moreContactsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
});