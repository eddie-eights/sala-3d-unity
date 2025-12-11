'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceInputOptions {
  language?: string;
  onTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { 
    language = 'ja-JP',
    onTranscript, 
    onInterimTranscript,
    onError 
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false); // Track if we should keep recording
  const accumulatedTextRef = useRef('');

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Play a tone using Web Audio API
  const playTone = useCallback((frequency: number, duration: number, type: 'start' | 'stop') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = type === 'start' ? frequency * 1.5 : frequency * 0.7;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.15);
      }, 100);
    } catch (e) {
      console.warn('Could not play tone:', e);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser');
      return;
    }

    if (isActiveRef.current) return; // Already recording

    isActiveRef.current = true;
    accumulatedTextRef.current = '';
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      playTone(440, 0.15, 'start');
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Ignore results if we're not active (stopping)
      if (!isActiveRef.current) return;
      
      let fullText = '';
      
      // Collect all transcript text
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          fullText += result[0].transcript;
        }
      }
      
      if (fullText) {
        accumulatedTextRef.current = fullText;
        setTranscript(fullText);
        onInterimTranscript?.(fullText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still active (continuous mode)
      if (isActiveRef.current) {
        try {
          recognition.start();
          return;
        } catch (e) {
          console.warn('Could not restart recognition:', e);
        }
      }
      
      // Actually stopping
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language, onInterimTranscript, onError, playTone]);

  const stopRecording = useCallback(() => {
    // Mark as inactive first to prevent auto-restart
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Play stop sound
    playTone(440, 0.2, 'stop');
    setIsRecording(false);
    
    // Send accumulated text
    const textToSend = accumulatedTextRef.current;
    if (textToSend.trim()) {
      onTranscript?.(textToSend);
    }
    accumulatedTextRef.current = '';
    setTranscript('');
    
    // Clear the input field in parent component
    onInterimTranscript?.('');
  }, [onTranscript, onInterimTranscript, playTone]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isSupported,
    transcript,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
