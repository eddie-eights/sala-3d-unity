
export {};

declare global {
  // Unity interfaces
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
    Module?: {
      WebGLInput: {
        captureAllKeyboardInput: boolean;
      };
    };
  }

  interface Window {
    createUnityInstance: (
      canvas: HTMLCanvasElement,
      config: UnityConfig,
      onProgress?: (progress: number) => void
    ) => Promise<UnityInstance>;
    dispatchReactUnityEvent?: (eventName: string, data?: unknown) => void;
    _submitChatInput?: () => void;
    // Standard web APIs explicitly declared if missing or for clarity
    AudioContext?: {
      new(options?: AudioContextOptions): AudioContext;
      prototype: AudioContext;
    };
    webkitAudioContext?: {
      new(options?: AudioContextOptions): AudioContext;
      prototype: AudioContext;
    };
    // Expose unity instance for debugging
    unityInstance?: UnityInstance;
  }
}
