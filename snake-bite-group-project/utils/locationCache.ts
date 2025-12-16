// utils/locationCache.ts
// BigDataCloud reverse geocoding - free, accurate, includes city names

import * as Location from 'expo-location';

interface CachedLocation {
  coords: Location.LocationObjectCoords;
  locationName: string;
  countryCode: string;
  timestamp: number;
}

class LocationCacheService {
  private cache: CachedLocation | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getLocation(): Promise<{ coords: Location.LocationObjectCoords; locationName: string; countryCode: string }> {
    // Check if we have a valid cache
    if (this.cache && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION) {
      console.log('Using cached location');
      return {
        coords: this.cache.coords,
        locationName: this.cache.locationName,
        countryCode: this.cache.countryCode,
      };
    }

    // Get fresh location
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let locationName = `${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`;
      let countryCode = 'GB';

      // Use BigDataCloud for reverse geocoding
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${currentLocation.coords.latitude}&longitude=${currentLocation.coords.longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) } // 5 second timeout
        );

        if (response.ok) {
          const data = await response.json();
          
          countryCode = data.countryCode || 'GB';
          
          // Build formatted address from available data
          const parts = [
            data.city || data.locality,
            data.principalSubdivision, // State/Region
            data.countryName,
          ].filter(Boolean);
          
          locationName = parts.length > 0 ? parts.join(', ') : locationName;
          
          console.log('BigDataCloud geocoding successful:', locationName);
        } else {
          console.log('BigDataCloud request failed, using coordinates');
        }
      } catch (geocodeError) {
        console.log('BigDataCloud error, using coordinates as fallback');
      }

      // Cache the result
      this.cache = {
        coords: currentLocation.coords,
        locationName,
        countryCode,
        timestamp: Date.now(),
      };

      return {
        coords: currentLocation.coords,
        locationName,
        countryCode,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // Get just the country code (for emergency-contacts)
  async getCountryCode(): Promise<string> {
    try {
      const location = await this.getLocation();
      return location.countryCode;
    } catch (error) {
      console.log('Failed to get country code, defaulting to GB');
      return 'GB';
    }
  }

  // Clear the cache
  clearCache() {
    this.cache = null;
    console.log('Location cache cleared');
  }

  // Check if cache is valid
  isCacheValid(): boolean {
    return this.cache !== null && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION;
  }
}

export default new LocationCacheService();