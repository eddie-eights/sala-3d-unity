// Auth Client for Mobile App
// Uses Better Auth endpoints on the web server

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// API URL - use computer's IP address for physical devices
// localhost won't work on physical devices, only simulators
const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000',
  default: 'http://192.168.3.53:3000', // Your PC's IP address
});

const SESSION_KEY = 'sala_session_token';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
}

// Simple storage abstraction
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    // For native, dynamically import SecureStore
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }
};

export const authClient = {
  // Email Sign In
  async signInEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting sign in to:', `${API_BASE_URL}/api/auth/sign-in/email`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign in response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Sign in error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          return { success: false, error: error.message || 'Sign in failed' };
        } catch {
          return { success: false, error: 'Sign in failed' };
        }
      }

      const data = await response.json();
      console.log('Sign in success:', data);
      
      // Better Auth returns session data
      if (data.session?.id) {
        await storage.setItem(SESSION_KEY, data.session.id);
      } else if (data.token) {
        await storage.setItem(SESSION_KEY, data.token);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in network error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  },

  // Email Sign Up
  async signUpEmail(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting sign up to:', `${API_BASE_URL}/api/auth/sign-up/email`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Sign up response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Sign up error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          return { success: false, error: error.message || 'Sign up failed' };
        } catch {
          return { success: false, error: 'Sign up failed' };
        }
      }

      const data = await response.json();
      console.log('Sign up success:', data);
      
      if (data.session?.id) {
        await storage.setItem(SESSION_KEY, data.session.id);
      } else if (data.token) {
        await storage.setItem(SESSION_KEY, data.token);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up network error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  },

  // Google OAuth - Opens browser for OAuth flow
  // Note: Google OAuth requires public URLs, so this only works on web during development
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a redirect URL that the web app will redirect back to
      const redirectUrl = Linking.createURL('auth-callback');
      console.log('Google OAuth redirect URL:', redirectUrl);
      console.log('API Base URL:', API_BASE_URL);
      
      // Open the web browser for Google OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(redirectUrl)}`,
        redirectUrl
      );

      console.log('Google OAuth result:', result);

      if (result.type === 'success' && result.url) {
        // Extract token from callback URL
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        if (token) {
          await storage.setItem(SESSION_KEY, token);
          return { success: true };
        }
      }

      return { success: false, error: 'OAuth cancelled or failed' };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return { success: false, error: error.message || 'OAuth error' };
    }
  },

  // Passkey authentication - placeholder for now
  async signInWithPasskey(): Promise<{ success: boolean; error?: string }> {
    return { 
      success: false, 
      error: 'Passkey is not yet available on mobile. Please use Google or email/password.' 
    };
  },

  // Get current session
  async getSession(): Promise<AuthSession> {
    try {
      const token = await storage.getItem(SESSION_KEY);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        return { user: null, token: null };
      }

      const data = await response.json();
      return { user: data.user, token };
    } catch {
      return { user: null, token: null };
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session.user !== null;
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    await storage.removeItem(SESSION_KEY);
  },
};

export default authClient;
