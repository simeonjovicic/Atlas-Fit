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
   * Logout current user
   */
  logout: (): Promise<void> => {
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

