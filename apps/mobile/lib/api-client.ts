// API Client for Mobile App
// Connects to Next.js backend API

// Default to localhost for development - configure in app.json for production
const API_BASE_URL = 'http://localhost:3000';

interface ChatResponse {
  text: string;
  success: boolean;
  error?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  username?: string;
  birthday?: string;
  gender?: string;
  hometown?: string;
  currentResidence?: string;
  hobbies?: string;
}

export const apiClient = {
  // Chat API
  async sendMessage(message: string, history: Message[] = []): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },

  // Text-to-Speech API
  async textToSpeech(text: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    return await response.blob();
  },

  // Profile API
  async getProfile(): Promise<ProfileData> {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  },

  async updateProfile(data: Partial<ProfileData>): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return await response.json();
  },
};

export default apiClient;
