import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface SavedExercise {
  name: string;
  saved: boolean;
}

export const savedExercisesService = {
  /**
   * Get all saved exercises for the current user from Firestore
   */
  async getSavedExercises(): Promise<Set<string>> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No authenticated user');
        return new Set();
      }

      const docRef = doc(db, 'users', userId, 'savedExercises', 'list');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return new Set(data.exerciseNames || []);
      }
      
      return new Set();
    } catch (error) {
      console.error('Error fetching saved exercises:', error);
      throw error;
    }
  },

  /**
   * Save exercise names to Firestore
   */
  async saveExercises(exerciseNames: string[]): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'savedExercises', 'list');
      await setDoc(docRef, { 
        exerciseNames,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('Saved exercises updated successfully');
    } catch (error) {
      console.error('Error saving exercises:', error);
      throw error;
    }
  },

  /**
   * Add a saved exercise
   */
  async addSavedExercise(exerciseName: string): Promise<void> {
    try {
      const savedExercises = await this.getSavedExercises();
      savedExercises.add(exerciseName);
      await this.saveExercises(Array.from(savedExercises));
    } catch (error) {
      console.error('Error adding saved exercise:', error);
      throw error;
    }
  },

  /**
   * Remove a saved exercise
   */
  async removeSavedExercise(exerciseName: string): Promise<void> {
    try {
      const savedExercises = await this.getSavedExercises();
      savedExercises.delete(exerciseName);
      await this.saveExercises(Array.from(savedExercises));
    } catch (error) {
      console.error('Error removing saved exercise:', error);
      throw error;
    }
  },

  /**
   * Toggle saved state of an exercise
   */
  async toggleSavedExercise(exerciseName: string, isSaved: boolean): Promise<void> {
    if (isSaved) {
      await this.addSavedExercise(exerciseName);
    } else {
      await this.removeSavedExercise(exerciseName);
    }
  },

  /**
   * Migrate saved exercises from localStorage to Firestore
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Check if saved exercises already exist in Firestore
      const existingExercises = await this.getSavedExercises();
      if (existingExercises.size > 0) {
        console.log('Saved exercises already exist in Firestore, skipping migration');
        return;
      }

      // Get data from localStorage
      const savedData = localStorage.getItem('savedExercises');
      if (!savedData) {
        console.log('No saved exercises in localStorage to migrate');
        return;
      }

      const exercises = JSON.parse(savedData);
      const savedExerciseNames = exercises
        .filter((e: any) => e.saved)
        .map((e: any) => e.name);

      if (savedExerciseNames.length > 0) {
        await this.saveExercises(savedExerciseNames);
        console.log(`Migrated ${savedExerciseNames.length} saved exercises from localStorage to Firestore`);
      }
    } catch (error) {
      console.error('Error migrating saved exercises from localStorage:', error);
      throw error;
    }
  }
};

