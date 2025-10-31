import { workoutService } from './workoutService';
import { workoutHistoryService } from './workoutHistoryService';
import { userSettingsService } from './userSettingsService';
import { profileService } from './profileService';
import { savedExercisesService } from './savedExercisesService';

/**
 * Migration Service - Coordinates migration of all data from localStorage to Firebase
 */
export const migrationService = {
  /**
   * Run all migrations for the current user
   * This should be called once after user login
   */
  async runAllMigrations(): Promise<void> {
    try {
      console.log('Starting data migration from localStorage to Firebase...');
      
      // Run migrations in parallel (they check internally if data already exists)
      await Promise.all([
        profileService.migrateFromLocalStorage(),
        workoutService.migrateFromLocalStorage(),
        workoutHistoryService.migrateFromLocalStorage(),
        userSettingsService.migrateFromLocalStorage(),
        savedExercisesService.migrateFromLocalStorage()
      ]);
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
      // Don't throw - we want the app to continue even if migration fails
      // The fallback to localStorage will handle this
    }
  },

  /**
   * Check if migration has been completed (by checking if Firebase has data)
   */
  async isMigrationCompleted(): Promise<boolean> {
    try {
      // Check if any data exists in Firebase
      const [workouts, completedWorkouts, profile, settings] = await Promise.all([
        workoutService.getWorkouts(),
        workoutHistoryService.getCompletedWorkouts(),
        profileService.getProfile(),
        userSettingsService.getSettings()
      ]);

      // Migration is considered complete if at least one data type exists in Firebase
      // OR if localStorage is empty (no data to migrate)
      const savedExercises = await savedExercisesService.getSavedExercises();

      const hasFirebaseData = workouts.length > 0 || 
                               completedWorkouts.length > 0 || 
                               profile !== null ||
                               (settings && !settings.firstLaunch) ||
                               savedExercises.size > 0;

      const hasLocalStorageData = localStorage.getItem('workouts') !== null ||
                                   localStorage.getItem('completedWorkouts') !== null ||
                                   localStorage.getItem('profile') !== null ||
                                   localStorage.getItem('savedExercises') !== null;

      // If we have Firebase data, migration is complete
      // If we have no localStorage data, there's nothing to migrate
      return hasFirebaseData || !hasLocalStorageData;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }
};

