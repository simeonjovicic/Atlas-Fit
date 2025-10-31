import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Set {
  reps: number;
  weight: number;
  locked?: boolean;
}

export interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  sets: Set[];
  restTime: number;
}

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
  lastPerformed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const workoutService = {
  /**
   * Get all workouts from Firestore for the current user
   */
  async getWorkouts(): Promise<Workout[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No authenticated user');
        return [];
      }

      const workoutsRef = collection(db, 'users', userId, 'workouts');
      const q = query(workoutsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const workouts: Workout[] = [];
      querySnapshot.forEach((doc) => {
        workouts.push({
          id: parseInt(doc.id) || doc.data().id,
          ...doc.data()
        } as Workout);
      });

      return workouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },

  /**
   * Get a single workout by ID
   */
  async getWorkout(workoutId: number): Promise<Workout | null> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'workouts', workoutId.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: parseInt(docSnap.id) || docSnap.data().id,
          ...docSnap.data()
        } as Workout;
      }
      return null;
    } catch (error) {
      console.error('Error fetching workout:', error);
      throw error;
    }
  },

  /**
   * Save or update a workout in Firestore
   */
  async saveWorkout(workout: Workout): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'workouts', workout.id.toString());
      
      const dataToSave = {
        ...workout,
        updatedAt: new Date().toISOString(),
        createdAt: workout.createdAt || new Date().toISOString()
      };

      await setDoc(docRef, dataToSave, { merge: true });
      console.log('Workout saved successfully');
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  /**
   * Delete a workout from Firestore
   */
  async deleteWorkout(workoutId: number): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'workouts', workoutId.toString());
      await deleteDoc(docRef);
      console.log('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  /**
   * Update a workout in Firestore
   */
  async updateWorkout(workoutId: number, data: Partial<Workout>): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'users', userId, 'workouts', workoutId.toString());
      
      const dataToUpdate = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, dataToUpdate, { merge: true });
      console.log('Workout updated successfully');
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  },

  /**
   * Migrate workouts from localStorage to Firestore
   * This is a one-time migration function
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No authenticated user');
      }

      // Check if workouts already exist in Firestore
      const existingWorkouts = await this.getWorkouts();
      if (existingWorkouts.length > 0) {
        console.log('Workouts already exist in Firestore, skipping migration');
        return;
      }

      // Get data from localStorage
      const savedWorkouts = localStorage.getItem('workouts');
      if (!savedWorkouts) {
        console.log('No workouts in localStorage to migrate');
        return;
      }

      const workouts: Workout[] = JSON.parse(savedWorkouts);
      
      // Save each workout to Firestore
      for (const workout of workouts) {
        await this.saveWorkout({
          ...workout,
          createdAt: new Date().toISOString()
        });
      }

      console.log(`Migrated ${workouts.length} workouts from localStorage to Firestore`);
    } catch (error) {
      console.error('Error migrating workouts from localStorage:', error);
      throw error;
    }
  }
};

