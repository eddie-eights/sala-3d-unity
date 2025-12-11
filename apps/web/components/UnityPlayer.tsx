'use client';

import { useUnity } from '@/hooks/useUnity';
import { Loader2 } from 'lucide-react';

interface UnityPlayerProps {
  className?: string;
  buildPath?: string;
  buildName?: string;
  onReady?: () => void;
  onCharacterFinishedSpeaking?: () => void;
  onCharacterStateChanged?: (state: string) => void;
}

export function UnityPlayer({
  className = '',
  buildPath,
  buildName,
  onReady,
  onCharacterFinishedSpeaking,
  onCharacterStateChanged,
}: UnityPlayerProps) {
  const {
    canvasRef,
    isLoading,
    loadingProgress,
    error,
    isReady,
  } = useUnity({
    buildPath,
    buildName,
    onReady,
    onCharacterFinishedSpeaking,
    onCharacterStateChanged,
  });

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Failed to load 3D character</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
          <p className="text-white text-sm">Loading 3D Character...</p>
          <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${loadingProgress * 100}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {Math.round(loadingProgress * 100)}%
          </p>
        </div>
      )}
      
      {/* Unity Canvas */}
      <canvas
        id="unity-canvas"
        ref={canvasRef}
        tabIndex={-1}
        className="w-full h-full"
        style={{ 
          display: isReady ? 'block' : 'none',
          background: 'transparent',
        }}
      />
    </div>
  );
}

// Export hook for external control
export { useUnity } from '@/hooks/useUnity';
