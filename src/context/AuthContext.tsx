import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserAccount, signInUser, signOutUser, getCurrentUserData } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, uwNetId: string) => Promise<{ success: boolean; showConfirmation?: boolean }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  showSignupConfirmation: boolean;
  hideSignupConfirmation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignupConfirmation, setShowSignupConfirmation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // Don't process auth changes if we're showing signup confirmation
      if (showSignupConfirmation) {
        return;
      }

      if (firebaseUser) {
        try {
          const userData = await getCurrentUserData(firebaseUser);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [showSignupConfirmation]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await signInUser(email, password);
      setCurrentUser(userData);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, uwNetId: string): Promise<{ success: boolean; showConfirmation?: boolean }> => {
    try {
      setIsLoading(true);
      
      // Create account
      await createUserAccount(email, password, name, uwNetId);
      
      // Sign out immediately after account creation
      await signOutUser();
      
      // Show confirmation screen
      setShowSignupConfirmation(true);
      setCurrentUser(null);
      
      return { success: true, showConfirmation: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const hideSignupConfirmation = () => {
    setShowSignupConfirmation(false);
  };

  const logout = async (): Promise<void> => {
    try {
      await signOutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isLoading,
    showSignupConfirmation,
    hideSignupConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};