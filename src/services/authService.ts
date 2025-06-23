import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const createUserAccount = async (
  email: string, 
  password: string, 
  name: string, 
  uwNetId: string
): Promise<User> => {
  // Validate UW email
  if (!email.endsWith('@uw.edu')) {
    throw new Error('Must use a valid @uw.edu email address');
  }

  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name,
      uwNetId,
      joinedDate: new Date().toISOString(),
      isVerified: false, // Can be updated later through admin verification
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('Error creating user account:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

export const getCurrentUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};