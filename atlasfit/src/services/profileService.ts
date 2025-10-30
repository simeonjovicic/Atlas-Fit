import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ProfileData {
  name: string;
  email?: string;
  weight: number | null;
  height: number | null;
  workoutsPerWeek: number | null;
  profilePhotoURL?: string;
  measurements: {
    chest: number | null;
    bicepLeft: number | null;
    bicepRight: number | null;
    forearmLeft: number | null;
    forearmRight: number | null;
    shoulders: number | null;
    waist: number | null;
    hips: number | null;
    thighLeft: number | null;
    thighRight: number | null;
    calfLeft: number | null;
    calfRight: number | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileHistoryEntry {
  timestamp: string;
  weight: number | null;
  height: number | null;
  measurements: ProfileData['measurements'];
}

export const profileService = {
  /**
   * Get user profile from Firestore
   */
  async getProfile(): Promise<ProfileData | null> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No authenticated user');
        return null;
      }

      const docRef = doc(db, 'users', userId, 'profile', 'data');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as ProfileData;
      } else {
        console.log('No profile found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Save or update user profile in Firestore
   */
  async saveProfile(profileData: Partial<ProfileData>): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'profile', 'data');
      
      // Add timestamp
      const dataToSave = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, dataToSave, { merge: true });
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  /**
   * Get profile history
   */
  async getProfileHistory(): Promise<ProfileHistoryEntry[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'profile', 'history');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.entries || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching profile history:', error);
      throw error;
    }
  },

  /**
   * Add entry to profile history
   */
  async addProfileHistoryEntry(entry: ProfileHistoryEntry): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'profile', 'history');
      const docSnap = await getDoc(docRef);

      let entries: ProfileHistoryEntry[] = [];
      if (docSnap.exists()) {
        entries = docSnap.data().entries || [];
      }

      // Add new entry
      entries.push(entry);

      // Limit to last 100 entries
      if (entries.length > 100) {
        entries = entries.slice(-100);
      }

      await setDoc(docRef, { entries }, { merge: true });
      console.log('Profile history entry added');
    } catch (error) {
      console.error('Error adding profile history:', error);
      throw error;
    }
  },

  /**
   * Upload profile photo as Base64 string (stored in Firestore, no Storage costs)
   * Note: Firestore has a 1MB document limit, so images should be compressed
   */
  async uploadProfilePhoto(file: Blob): Promise<string> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Check file size (recommend max 500KB for Firestore)
      if (file.size > 500000) {
        throw new Error('Bild ist zu groß. Bitte wähle ein kleineres Bild (max 500KB).');
      }

      // Convert to Base64
      const base64String = await this.convertBlobToBase64(file);

      // Save Base64 string directly to Firestore
      await this.saveProfile({ profilePhotoURL: base64String });

      console.log('Profile photo saved successfully (Base64)');
      return base64String;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  },

  /**
   * Helper: Convert Blob to Base64 string
   */
  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Delete profile photo (removes Base64 string from Firestore)
   */
  async deleteProfilePhoto(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Remove Base64 string from profile
      await this.saveProfile({ profilePhotoURL: '' });

      console.log('Profile photo deleted successfully');
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  },

  /**
   * Migrate profile data from localStorage to Firestore
   * This is a one-time migration function
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Check if profile already exists in Firestore
      const existingProfile = await this.getProfile();
      if (existingProfile) {
        console.log('Profile already exists in Firestore, skipping migration');
        return;
      }

      // Get data from localStorage
      const savedProfile = localStorage.getItem('profile');
      const savedProfilePhoto = localStorage.getItem('profilePhoto');
      const savedProfileHistory = localStorage.getItem('profileHistory');

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        
        // Save to Firestore
        await this.saveProfile({
          ...profileData,
          createdAt: new Date().toISOString()
        });

        console.log('Profile migrated from localStorage to Firestore');
      }

      // Migrate history
      if (savedProfileHistory) {
        const historyData = JSON.parse(savedProfileHistory);
        const docRef = doc(db, 'users', userId, 'profile', 'history');
        await setDoc(docRef, { entries: historyData }, { merge: true });
        console.log('Profile history migrated');
      }

      // Note: Profile photo would need to be re-uploaded as it's stored as base64 in localStorage
      // We can't easily migrate this, user will need to re-upload
    } catch (error) {
      console.error('Error migrating profile from localStorage:', error);
      throw error;
    }
  }
};

