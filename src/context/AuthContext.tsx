import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginUserData, StudentProfile } from '../types/auth';
import { notificationService } from '../services/notificationService';
import { authEvents } from '../utils/authEvents';
import { useToast } from './ToastContext';
import { api } from '../services/api';
import { navigationRef } from '../navigation/navigationRef';

interface AuthContextType {
  userToken: string | null;
  userData: LoginUserData | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  login: (token: string, data: LoginUserData) => Promise<void>;
  logout: () => Promise<void>;
  fetchStudentProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginUserData | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const isHandlingUnauthorizedRef = useRef(false);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        console.log('[AuthContext] Loading storage data...');
        const token = await AsyncStorage.getItem('userToken');
        const data = await AsyncStorage.getItem('userData');
        const profile = await AsyncStorage.getItem('studentProfile');
        
        console.log('[AuthContext] Storage data loaded:', { 
          hasToken: !!token, 
          token: token, // Mostramos el token para depuración
          hasUserData: !!data, 
          hasProfile: !!profile 
        });

        if (token) {
          setUserToken(token);
        }
        if (data) {
          setUserData(JSON.parse(data));
        }
        if (profile) {
          setStudentProfile(JSON.parse(profile));
        }
      } catch (e) {
        console.error('[AuthContext] Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (token: string, data: LoginUserData) => {
    try {
      console.log('[AuthContext] Login called with token:', token);
      console.log('[AuthContext] Login user data:', data);
      
      isHandlingUnauthorizedRef.current = false;

      setUserToken(token);
      setUserData(data);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      // We could fetch profile here, but let's expose the function so screens can call it and handle loading states
    } catch (e) {
      console.error('[AuthContext] Failed to save auth data', e);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (userToken) {
        await notificationService.unregisterDevice(userToken);
      }
      setUserToken(null);
      setUserData(null);
      setStudentProfile(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('studentProfile');

      // Force navigation to Login
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (e) {
      console.error('Failed to remove auth data', e);
    }
  }, [userToken]);

  useEffect(() => {
    const unsubscribe = authEvents.on('UNAUTHORIZED', async () => {
      if (isHandlingUnauthorizedRef.current) {
        return;
      }
      isHandlingUnauthorizedRef.current = true;
      
      console.log('[AuthContext] Session expired, logging out...');
      await logout();
      showToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
    });
    return unsubscribe;
  }, [logout, showToast]);

  const fetchStudentProfile = async () => {
    if (!userToken) {
      console.log('[AuthContext] fetchStudentProfile: No token available');
      return;
    }
    
    try {
      console.log('[AuthContext] Fetching student profile...');
      const response = await api.get<{ data: StudentProfile }>('/student/profile', { token: userToken });

      console.log('[AuthContext] Profile data received:', response ? 'YES' : 'NO');
      if (response.data) {
        // Fix image URL if it comes from local dev environment
        if (response.data.profile && response.data.profile.photo) {
           response.data.profile.photo = response.data.profile.photo.replace(
             'https://internifyutesis.test:8443', 
             'https://overfoul-domingo-unharmable.ngrok-free.dev'
           );
        }
        
        setStudentProfile(response.data);
        await AsyncStorage.setItem('studentProfile', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, studentProfile, isLoading, login, logout, fetchStudentProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
