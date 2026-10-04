import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, db, ensureFirebase } from './firebase-config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
const authErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Could not complete authentication.';

// Auth Functions
export const signUpWithEmail = async (email: string, password: string) => {
  await ensureFirebase();
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: authErrorMessage(error) };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  await ensureFirebase();
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: authErrorMessage(error) };
  }
};

export const signInWithGoogle = async () => {
  await ensureFirebase();
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: authErrorMessage(error) };
  }
};

export const logOut = async () => {
  await ensureFirebase();
  if (!auth) {
    return { success: false, error: 'Firebase authentication is not configured.' };
  }

  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  let active = true;
  let unsubscribe: (() => void) | undefined;
  void ensureFirebase().then(() => {
    if (!active) return;
    if (!auth) callback(null);
    else unsubscribe = onAuthStateChanged(auth, callback);
  });
  return () => {
    active = false;
    unsubscribe?.();
  };
};

export { auth, db };
