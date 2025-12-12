// Auth Client for Mobile App
// Uses Better Auth endpoints on the web server

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const API_BASE_URL = 'http://localhost:3000';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

// Store session token
let sessionToken: string | null = null;

export const authClient = {
  // Email Sign In
  async signInEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Sign in failed' };
      }

      const data = await response.json();
      sessionToken = data.token;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  // Email Sign Up
  async signUpEmail(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Sign up failed' };
      }

      const data = await response.json();
      sessionToken = data.token;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  // Google OAuth - Opens browser for OAuth flow
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a redirect URL that the web app will redirect back to
      const redirectUrl = Linking.createURL('auth-callback');
      
      // Open the web browser for Google OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(redirectUrl)}`,
        redirectUrl
      );

      if (result.type === 'success' && result.url) {
        // Extract token from callback URL
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        if (token) {
          sessionToken = token;
          return { success: true };
        }
      }

      return { success: false, error: 'OAuth cancelled or failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'OAuth error' };
    }
  },

  // Passkey authentication - placeholder for now
  // Note: React Native passkey support requires additional native modules
  async signInWithPasskey(): Promise<{ success: boolean; error?: string }> {
    // Passkey in React Native requires:
    // - react-native-passkey or similar library
    // - Native iOS/Android configuration
    return { 
      success: false, 
      error: 'Passkey is not yet available on mobile. Please use Google or email/password.' 
    };
  },

  // Get current session
  getSession(): string | null {
    return sessionToken;
  },

  // Clear session
  signOut(): void {
    sessionToken = null;
  },
};

export default authClient;
