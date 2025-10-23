// services/reportStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import the new FileSystem API (not legacy)
import * as FileSystem from 'expo-file-system/legacy';

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
  snakeId?: number; // ID for linking to snake database
  
  // Metadata
  timestamp: number;
  lat?: number;
  lon?: number;
}

const REPORTS_KEY = '@ophid_reports';
const PHOTOS_DIR = `${FileSystem.documentDirectory}ophid_photos/`;

class ReportStorageService {
  // Initialize photos directory - UPDATED for new API
  async initializeStorage() {
    try {
      // Check if directory exists using new API
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR, { size: false });
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      // Directory might not exist, try to create it anyway
      try {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      } catch (createError) {
        console.error('Error creating directory:', createError);
      }
    }
  }

  // Save a photo to permanent storage and return the new URI
  async savePhoto(photoUri: string, reportId: string, type: 'snake' | 'bite'): Promise<string> {
    try {
      // Skip file operations on web - just return the URI
      if (Platform.OS === 'web') {
        console.log('Web platform - skipping file copy, returning original URI');
        return photoUri;
      }

      await this.initializeStorage();
      const filename = `${reportId}_${type}_${Date.now()}.jpg`;
      const newUri = `${PHOTOS_DIR}${filename}`;
      
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
      console.log('Saving report with photo URIs:', {
        snake: report.snakePhotoUri,
        bite: report.bitePhotoUri,
      });

      // Save photos to permanent storage if they exist (mobile only)
      if (report.snakePhotoUri && report.snakePhotoUri.trim() !== '') {
        report.snakePhotoUri = await this.savePhoto(report.snakePhotoUri, report.id, 'snake');
      }
      if (report.bitePhotoUri && report.bitePhotoUri.trim() !== '') {
        report.bitePhotoUri = await this.savePhoto(report.bitePhotoUri, report.id, 'bite');
      }

      console.log('Final report with saved photos:', {
        snake: report.snakePhotoUri,
        bite: report.bitePhotoUri,
      });

      // Get existing reports
      const reports = await this.getAllReports();
      
      // Add new report at the beginning
      reports.unshift(report);
      
      // Save updated reports array
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      console.log('Report saved to AsyncStorage');
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
      return reports.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  // Delete a report
  async deleteReport(id: string): Promise<void> {
    try {
      const reports = await this.getAllReports();
      const report = reports.find(r => r.id === id);
      
      // Delete associated photos (mobile only, and don't let it block deletion)
      if (Platform.OS !== 'web' && report) {
        try {
          if (report.snakePhotoUri) {
            await this.deletePhoto(report.snakePhotoUri);
          }
          if (report.bitePhotoUri) {
            await this.deletePhoto(report.bitePhotoUri);
          }
        } catch (photoError) {
          console.log('Photo deletion failed, but continuing with report deletion');
          // Continue anyway - don't let photo deletion block report deletion
        }
      }
      
      // Remove report from array - this is the critical part
      const updatedReports = reports.filter(r => r.id !== id);
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
      console.log('Report deleted from AsyncStorage');
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Delete a photo file - UPDATED for new API
  async deletePhoto(photoUri: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return; // Skip file operations on web
      }

      const fileInfo = await FileSystem.getInfoAsync(photoUri, { size: false });
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri);
        console.log(`Photo deleted: ${photoUri}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }

  // Clear all reports (useful for testing or user data reset)
  async clearAllReports(): Promise<void> {
    try {
      // Get all reports to delete their photos
      const reports = await this.getAllReports();
      
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