'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
