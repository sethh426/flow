import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase-config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth Functions
export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  if (!auth) {
    return { success: false, error: 'Firebase authentication is not configured.' };
  }

  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
};

export { auth, db };
