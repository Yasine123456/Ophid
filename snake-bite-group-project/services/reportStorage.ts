// services/reportStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Conditionally import FileSystem only for native platforms
let FileSystem: typeof import('expo-file-system') | null = null;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
}

export interface Report {
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

  // User submitted data
  snakePhotoUri?: string;
  bitePhotoUri?: string;
  description?: string;

  // Analysis results
  dangerLevel: string;
  snakeImageUrl?: string;
  snakeId?: number;

  // Metadata
  timestamp: number;
  lat?: number;
  lon?: number;
}

const REPORTS_KEY = '@ophid_reports';
const PHOTOS_DIR_NAME = 'ophid_photos';

class ReportStorageService {
  private photosDir: string | null = null;

  constructor() {
    // Only set up photos directory on native platforms
    if (Platform.OS !== 'web' && FileSystem?.documentDirectory) {
      this.photosDir = `${FileSystem.documentDirectory}${PHOTOS_DIR_NAME}/`;
    }
  }

  // Initialize photos directory (native only)
  async initializeStorage(): Promise<void> {
    if (Platform.OS === 'web' || !FileSystem || !this.photosDir) {
      // No file system initialization needed on web
      return;
    }

    try {
      const dirInfo = await FileSystem.getInfoAsync(this.photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.photosDir, { intermediates: true });
        console.log('Photos directory created:', this.photosDir);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      // Try to create directory anyway
      try {
        await FileSystem.makeDirectoryAsync(this.photosDir, { intermediates: true });
      } catch (createError) {
        console.error('Error creating directory:', createError);
      }
    }
  }

  // Save a photo to permanent storage and return the new URI
  async savePhoto(photoUri: string, reportId: string, type: 'snake' | 'bite'): Promise<string> {
    // On web, just return the original URI (blob URL or data URI)
    if (Platform.OS === 'web') {
      console.log('Web platform - keeping original photo URI');
      return photoUri;
    }

    // On native, copy to permanent storage
    if (!FileSystem || !this.photosDir) {
      console.warn('FileSystem not available, returning original URI');
      return photoUri;
    }

    try {
      await this.initializeStorage();
      const filename = `${reportId}_${type}_${Date.now()}.jpg`;
      const newUri = `${this.photosDir}${filename}`;

      await FileSystem.copyAsync({
        from: photoUri,
        to: newUri,
      });

      console.log(`Photo saved to: ${newUri}`);
      return newUri;
    } catch (error) {
      console.error('Error saving photo:', error);
      return photoUri; // Return original if save fails
    }
  }

  // Create and save a new report
  async saveReport(report: Report): Promise<void> {
    try {
      console.log('Saving report:', report.id);
      console.log('Platform:', Platform.OS);
      console.log('Snake photo URI:', report.snakePhotoUri ? 'Present' : 'None');
      console.log('Bite photo URI:', report.bitePhotoUri ? 'Present' : 'None');

      // Save photos to permanent storage if on native platform
      if (Platform.OS !== 'web') {
        if (report.snakePhotoUri && report.snakePhotoUri.trim() !== '') {
          report.snakePhotoUri = await this.savePhoto(report.snakePhotoUri, report.id, 'snake');
        }
        if (report.bitePhotoUri && report.bitePhotoUri.trim() !== '') {
          report.bitePhotoUri = await this.savePhoto(report.bitePhotoUri, report.id, 'bite');
        }
      }

      // Get existing reports
      const reports = await this.getAllReports();

      // Add new report at the beginning
      reports.unshift(report);

      // Save updated reports array
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      console.log('Report saved successfully');
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  // Get all reports
  async getAllReports(): Promise<Report[]> {
    try {
      const reportsJson = await AsyncStorage.getItem(REPORTS_KEY);
      if (reportsJson) {
        return JSON.parse(reportsJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  // Get a single report by ID
  async getReportById(id: string): Promise<Report | null> {
    try {
      const reports = await this.getAllReports();
      return reports.find((r) => r.id === id) || null;
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  // Delete a report
  async deleteReport(id: string): Promise<void> {
    try {
      console.log('Deleting report:', id);
      console.log('Platform:', Platform.OS);

      const reports = await this.getAllReports();
      const report = reports.find((r) => r.id === id);

      if (!report) {
        console.warn('Report not found:', id);
        // Still try to remove from array in case of data inconsistency
        const updatedReports = reports.filter((r) => r.id !== id);
        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
        return;
      }

      // Delete associated photos (native only)
      // On web, blob URLs are automatically garbage collected
      if (Platform.OS !== 'web') {
        if (report.snakePhotoUri) {
          await this.deletePhoto(report.snakePhotoUri);
        }
        if (report.bitePhotoUri) {
          await this.deletePhoto(report.bitePhotoUri);
        }
      } else {
        // On web, revoke blob URLs to free memory (if they are blob URLs)
        if (report.snakePhotoUri && report.snakePhotoUri.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(report.snakePhotoUri);
            console.log('Revoked blob URL for snake photo');
          } catch (e) {
            // Ignore errors when revoking
          }
        }
        if (report.bitePhotoUri && report.bitePhotoUri.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(report.bitePhotoUri);
            console.log('Revoked blob URL for bite photo');
          } catch (e) {
            // Ignore errors when revoking
          }
        }
      }

      // Remove report from array
      const updatedReports = reports.filter((r) => r.id !== id);
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
      console.log('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Delete a photo file (native only)
  async deletePhoto(photoUri: string): Promise<void> {
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('Web platform - skipping file deletion');
      return;
    }

    if (!FileSystem) {
      console.warn('FileSystem not available');
      return;
    }

    try {
      // Only try to delete if it looks like a file path
      if (!photoUri || photoUri.startsWith('blob:') || photoUri.startsWith('data:')) {
        console.log('Skipping deletion for non-file URI:', photoUri?.substring(0, 50));
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri);
        console.log(`Photo deleted: ${photoUri}`);
      } else {
        console.log(`Photo file not found (already deleted?): ${photoUri}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Don't throw - photo deletion failure shouldn't block report deletion
    }
  }

  // Clear all reports
  async clearAllReports(): Promise<void> {
    try {
      // Get all reports to delete their photos
      const reports = await this.getAllReports();

      // Delete photos on native platforms
      if (Platform.OS !== 'web') {
        for (const report of reports) {
          if (report.snakePhotoUri) {
            await this.deletePhoto(report.snakePhotoUri);
          }
          if (report.bitePhotoUri) {
            await this.deletePhoto(report.bitePhotoUri);
          }
        }
      }

      // Clear reports from storage
      await AsyncStorage.removeItem(REPORTS_KEY);
      console.log('All reports cleared');
    } catch (error) {
      console.error('Error clearing reports:', error);
      throw error;
    }
  }
}

export default new ReportStorageService();