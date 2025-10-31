import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface UserSettings {
  notificationsEnabled: boolean;
  firstLaunch: boolean;
  bestStreak: number;
  weeklyChallenges?: Record<string, any>;
}

export const userSettingsService = {
  /**
   * Get user settings from Firestore
   */
  async getSettings(): Promise<UserSettings | null> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No authenticated user');
        return null;
      }

      const docRef = doc(db, 'users', userId, 'settings', 'data');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      }
      
      // Return default settings if none exist
      return {
        notificationsEnabled: false,
        firstLaunch: true,
        bestStreak: 0,
        weeklyChallenges: {}
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  /**
   * Update a single setting
   */
  async updateSetting(key: keyof UserSettings, value: any): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'settings', 'data');
      
      // Get existing settings first
      const docSnap = await getDoc(docRef);
      const existingSettings = docSnap.exists() ? docSnap.data() : {};
      
      const updatedSettings = {
        ...existingSettings,
        [key]: value,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedSettings, { merge: true });
      console.log(`Setting ${key} updated successfully`);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  /**
   * Update multiple settings at once
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'settings', 'data');
      
      // Get existing settings first
      const docSnap = await getDoc(docRef);
      const existingSettings = docSnap.exists() ? docSnap.data() : {};
      
      const updatedSettings = {
        ...existingSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedSettings, { merge: true });
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Save weekly challenge
   */
  async saveWeeklyChallenge(weekId: string, challenge: any): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'settings', 'data');
      
      // Get existing settings
      const docSnap = await getDoc(docRef);
      const existingSettings = docSnap.exists() ? docSnap.data() : {};
      
      const weeklyChallenges = existingSettings.weeklyChallenges || {};
      weeklyChallenges[weekId] = challenge;
      
      const updatedSettings = {
        ...existingSettings,
        weeklyChallenges,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedSettings, { merge: true });
      console.log('Weekly challenge saved successfully');
    } catch (error) {
      console.error('Error saving weekly challenge:', error);
      throw error;
    }
  },

  /**
   * Get weekly challenge for a specific week
   */
  async getWeeklyChallenge(weekId: string): Promise<any | null> {
    try {
      const settings = await this.getSettings();
      if (!settings || !settings.weeklyChallenges) {
        return null;
      }
      return settings.weeklyChallenges[weekId] || null;
    } catch (error) {
      console.error('Error getting weekly challenge:', error);
      throw error;
    }
  },

  /**
   * Migrate settings from localStorage to Firestore
   * This is a one-time migration function
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Check if settings already exist in Firestore
      const existingSettings = await this.getSettings();
      if (existingSettings && !existingSettings.firstLaunch) {
        console.log('Settings already exist in Firestore, skipping migration');
        return;
      }

      // Get data from localStorage
      const notificationsEnabled = localStorage.getItem('notificationsEnabled');
      const firstLaunch = localStorage.getItem('firstLaunch');
      const bestStreak = localStorage.getItem('bestStreak');
      
      // Migrate weekly challenges
      const weeklyChallenges: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weeklyChallenge-')) {
          const weekId = key.replace('weeklyChallenge-', '');
          try {
            weeklyChallenges[weekId] = JSON.parse(localStorage.getItem(key) || '{}');
          } catch (e) {
            console.warn(`Failed to parse weekly challenge ${weekId}:`, e);
          }
        }
      }

      const settings: Partial<UserSettings> = {};
      
      if (notificationsEnabled !== null) {
        settings.notificationsEnabled = JSON.parse(notificationsEnabled);
      }
      
      if (firstLaunch !== null) {
        settings.firstLaunch = firstLaunch === 'false' ? false : true;
      }
      
      if (bestStreak !== null) {
        settings.bestStreak = parseInt(bestStreak) || 0;
      }
      
      if (Object.keys(weeklyChallenges).length > 0) {
        settings.weeklyChallenges = weeklyChallenges;
      }

      if (Object.keys(settings).length > 0) {
        await this.updateSettings(settings);
        console.log('Settings migrated from localStorage to Firestore');
      }
    } catch (error) {
      console.error('Error migrating settings from localStorage:', error);
      throw error;
    }
  }
};

