import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  /**
   * Register a new user with email and password
   */
  register: (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  /**
   * Login with email and password
   */
  login: (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Login with Google Sign-In popup
   */
  loginWithGoogle: (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  /**
   * Logout current user and clear user-specific localStorage data
   */
  logout: async (): Promise<void> => {
    // Clear user-specific data from localStorage before logout
    // This prevents data leakage between users
    const keysToRemove = [
      'workouts',
      'completedWorkouts',
      'profile',
      'profilePhoto',
      'profileHistory',
      'bestStreak',
      'savedExercises'
    ];
    
    // Remove weekly challenge keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('weeklyChallenge-')) {
        localStorage.removeItem(key);
      }
    }
    
    // Remove other user-specific keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return signOut(auth);
  },

  /**
   * Get current user
   */
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  /**
   * Observe authentication state changes
   */
  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

