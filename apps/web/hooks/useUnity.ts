'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// CRITICAL: Add keyboard event interception SYNCHRONOUSLY at module load
// This MUST run before Unity's framework.js loads to prevent it from capturing keyboard input
if (typeof window !== 'undefined') {
  const preventUnityKeyboardCapture = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.stopImmediatePropagation();
    }
  };
  
  // Try both window AND document level
  window.addEventListener('keydown', preventUnityKeyboardCapture, { capture: true });
  window.addEventListener('keyup', preventUnityKeyboardCapture, { capture: true });
  window.addEventListener('keypress', preventUnityKeyboardCapture, { capture: true });
  document.addEventListener('keydown', preventUnityKeyboardCapture, { capture: true });
  document.addEventListener('keyup', preventUnityKeyboardCapture, { capture: true });
  document.addEventListener('keypress', preventUnityKeyboardCapture, { capture: true });
}

declare global {
  interface Window {
    createUnityInstance: (
      canvas: HTMLCanvasElement,
      config: UnityConfig,
      onProgress?: (progress: number) => void
    ) => Promise<UnityInstance>;
    dispatchReactUnityEvent?: (eventName: string, data?: any) => void;
  }
}

interface UnityConfig {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl?: string;
  companyName?: string;
  productName?: string;
  productVersion?: string;
}

interface UnityInstance {
  SendMessage: (objectName: string, methodName: string, value?: string | number) => void;
  Quit: () => Promise<void>;
  SetFullscreen: (fullscreen: boolean) => void;
}

interface UseUnityOptions {
  buildPath?: string;
  buildName?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  onCharacterFinishedSpeaking?: () => void;
  onCharacterStateChanged?: (state: string) => void;
  onAudioProgress?: (progress: number) => void;
}

export function useUnity(options: UseUnityOptions = {}) {
  const {
    buildPath = '/unity-build-chat',
    buildName = 'unity-build-chat',
    onReady,
    onError,
    onProgress,
    onCharacterFinishedSpeaking,
    onCharacterStateChanged,
    onAudioProgress,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<UnityInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Set up event handlers from Unity
  useEffect(() => {
    window.dispatchReactUnityEvent = (eventName: string, data?: any) => {
      switch (eventName) {
        case 'OnCharacterFinishedSpeaking':
          onCharacterFinishedSpeaking?.();
          break;
        case 'OnCharacterStateChanged':
          onCharacterStateChanged?.(data);
          break;
        case 'OnAudioProgress':
          onAudioProgress?.(data);
          break;
        default:
          console.log(`Unity event: ${eventName}`, data);
      }
    };

    return () => {
      window.dispatchReactUnityEvent = undefined;
    };
  }, [onCharacterFinishedSpeaking, onCharacterStateChanged, onAudioProgress]);

  // Resume AudioContext on first user interaction to prevent warnings
  useEffect(() => {
    let resumed = false;
    
    const resumeAudioContext = () => {
      if (resumed) return;
      resumed = true;
      
      // Resume all AudioContext instances
      const audioContexts = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (audioContexts) {
        // Try to resume any existing audio contexts
        const allContexts = document.querySelectorAll('canvas');
        allContexts.forEach(() => {
          try {
            // Create and immediately resume a context to unlock audio
            const ctx = new audioContexts();
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }
          } catch (e) {
            // Ignore errors
          }
        });
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };

    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('touchstart', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);

    return () => {
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };
  }, []);

  // Store callbacks in refs to prevent effect re-runs
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const onProgressRef = useRef(onProgress);
  
  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
    onProgressRef.current = onProgress;
  }, [onReady, onError, onProgress]);

  // Load Unity (only when buildPath or buildName changes)
  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;

    const loadUnity = async () => {
      try {
        // Load Unity loader script
        const loaderUrl = `${buildPath}/Build/${buildName}.loader.js`;
        
        // Check if script already loaded
        if (!window.createUnityInstance) {
          const script = document.createElement('script');
          script.src = loaderUrl;
          script.async = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Unity loader'));
            document.body.appendChild(script);
          });
        }

        if (!mounted) return;

        // Create Unity instance (non-compressed build)
        const config: UnityConfig = {
          dataUrl: `${buildPath}/Build/${buildName}.data`,
          frameworkUrl: `${buildPath}/Build/${buildName}.framework.js`,
          codeUrl: `${buildPath}/Build/${buildName}.wasm`,
          streamingAssetsUrl: `${buildPath}/StreamingAssets`,
          companyName: 'Sala',
          productName: 'Sala 3D',
          productVersion: '1.0',
        };

        const instance = await window.createUnityInstance(
          canvasRef.current!,
          config,
          (progress: number) => {
            if (!mounted) return;
            setLoadingProgress(progress);
            onProgressRef.current?.(progress);
          }
        );

        if (!mounted) {
          instance.Quit();
          return;
        }

        instanceRef.current = instance;
        // Expose to window for debugging
        (window as unknown as { unityInstance: UnityInstance }).unityInstance = instance;
        
        // IMPORTANT: Disable Unity's keyboard capture so HTML inputs work
        // Unity WebGL captures all keyboard input by default, which breaks HTML forms
        if ((instance as any).Module?.WebGLInput) {
          (instance as any).Module.WebGLInput.captureAllKeyboardInput = false;
        }
        
        setIsLoading(false);
        setIsReady(true);
        onReadyRef.current?.();

      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error('Unity load failed');
        setError(error);
        setIsLoading(false);
        onErrorRef.current?.(error);
      }
    };

    loadUnity();

    return () => {
      mounted = false;
      // Don't quit Unity on unmount during development to prevent reload issues
      // if (instanceRef.current) {
      //   instanceRef.current.Quit().catch(console.error);
      //   instanceRef.current = null;
      // }
    };
  }, [buildPath, buildName]); // Only re-run when build config changes

  // Character control methods
  const sendMessage = useCallback((objectName: string, methodName: string, value?: string | number) => {
    if (instanceRef.current) {
      instanceRef.current.SendMessage(objectName, methodName, value);
    }
  }, []);

  const speakWithAudio = useCallback((base64Audio: string) => {
    sendMessage('SalaCharacter', 'SpeakWithAudio', base64Audio);
  }, [sendMessage]);

  const speakWithWav = useCallback((base64Wav: string) => {
    sendMessage('SalaCharacter', 'SpeakWithWav', base64Wav);
  }, [sendMessage]);

  const speak = useCallback((text: string) => {
    sendMessage('SalaCharacter', 'Speak', text);
  }, [sendMessage]);

  const stopSpeaking = useCallback(() => {
    sendMessage('SalaCharacter', 'StopSpeaking');
  }, [sendMessage]);

  const listen = useCallback(() => {
    sendMessage('SalaCharacter', 'Listen');
  }, [sendMessage]);

  const think = useCallback(() => {
    sendMessage('SalaCharacter', 'Think');
  }, [sendMessage]);

  const idle = useCallback(() => {
    sendMessage('SalaCharacter', 'Idle');
  }, [sendMessage]);

  const setExpression = useCallback((expression: string) => {
    sendMessage('SalaCharacter', 'SetExpression', expression);
  }, [sendMessage]);

  return {
    canvasRef,
    isLoading,
    loadingProgress,
    error,
    isReady,
    // Control methods
    sendMessage,
    speakWithAudio,
    speakWithWav,
    speak,
    stopSpeaking,
    listen,
    think,
    idle,
    setExpression,
  };
}
