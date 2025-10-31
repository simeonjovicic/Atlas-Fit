import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface CompletedSet {
  reps: number;
  weight: number;
}

export interface CompletedExercise {
  name: string;
  completedSets: number;
  sets: CompletedSet[];
  bestSet: string;
}

export interface CompletedWorkout {
  id: number;
  name: string;
  completedAt: string;
  duration: string;
  exercises: CompletedExercise[];
  totalWeight: number;
}

export const workoutHistoryService = {
  /**
   * Get all completed workouts from Firestore for the current user
   */
  async getCompletedWorkouts(): Promise<CompletedWorkout[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No authenticated user');
        return [];
      }

      const historyRef = collection(db, 'users', userId, 'workoutHistory');
      
      // Try with orderBy first, fallback to simple query if index missing
      let querySnapshot;
      try {
        const q = query(historyRef, orderBy('completedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (orderByError: any) {
        // If index error, try without orderBy and sort in memory
        console.warn('Index missing or query error, loading without orderBy:', orderByError);
        querySnapshot = await getDocs(historyRef);
      }

      const workouts: CompletedWorkout[] = [];
      querySnapshot.forEach((doc) => {
        workouts.push({
          id: doc.data().id,
          ...doc.data()
        } as CompletedWorkout);
      });

      // Sort in memory if orderBy failed
      if (workouts.length > 0 && workouts[0].completedAt) {
        workouts.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      }

      console.log(`Loaded ${workouts.length} completed workouts from Firebase`);
      return workouts;
    } catch (error) {
      console.error('Error fetching completed workouts:', error);
      throw error;
    }
  },

  /**
   * Save a completed workout to Firestore
   */
  async saveCompletedWorkout(workout: CompletedWorkout): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Use timestamp as document ID for better querying
      const docId = `${workout.id}-${workout.completedAt.replace(/[:.]/g, '-')}`;
      const docRef = doc(db, 'users', userId, 'workoutHistory', docId);
      
      await setDoc(docRef, workout);
      console.log('Completed workout saved successfully');
    } catch (error) {
      console.error('Error saving completed workout:', error);
      throw error;
    }
  },

  /**
   * Migrate completed workouts from localStorage to Firestore
   * This is a one-time migration function
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Get data from localStorage first
      const savedWorkouts = localStorage.getItem('completedWorkouts');
      if (!savedWorkouts) {
        console.log('No completed workouts in localStorage to migrate');
        return;
      }

      const workouts: CompletedWorkout[] = JSON.parse(savedWorkouts);
      if (workouts.length === 0) {
        console.log('No completed workouts in localStorage to migrate');
        return;
      }

      // Check if workout history already exists in Firestore
      let existingWorkouts: CompletedWorkout[] = [];
      try {
        existingWorkouts = await this.getCompletedWorkouts();
      } catch (error) {
        console.warn('Could not check existing workouts, proceeding with migration:', error);
      }

      if (existingWorkouts.length > 0) {
        console.log('Workout history already exists in Firestore, skipping migration');
        return;
      }

      // Save each workout to Firestore
      console.log(`Starting migration of ${workouts.length} completed workouts...`);
      for (const workout of workouts) {
        try {
          await this.saveCompletedWorkout(workout);
        } catch (error) {
          console.error(`Failed to migrate workout ${workout.id}:`, error);
          // Continue with next workout
        }
      }

      console.log(`Migrated ${workouts.length} completed workouts from localStorage to Firestore`);
    } catch (error) {
      console.error('Error migrating completed workouts from localStorage:', error);
      throw error;
    }
  }
};

