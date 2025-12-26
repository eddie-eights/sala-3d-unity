"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, Minimize2, Maximize2, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UnityPlayer, UnityPlayerRef } from "@/components/UnityPlayer";
import { useVoiceInput } from "@/hooks/useVoiceInput";

// Typing animation component
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-white text-blue-900 rounded-bl-none border border-blue-100">
      <div className="flex gap-1 items-center">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [username, setUsername] = useState('きみ');

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (!data.username || !data.birthday) {
            toast.warning("Please complete your profile first.");
            router.push('/mypage');
          } else {
            setUsername(data.username);
            setIsCheckingProfile(false);
          }
        } else if (res.status === 401) {
          router.push('/welcome');
        } else {
          setIsCheckingProfile(false);
        }
      } catch (error) {
        console.error("Profile check failed", error);
        router.push('/welcome');
      }
    };
    checkProfile();
  }, [router]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'お疲れさま！\n何かいいことあった？' }
  ]);
  const [isFloating, setIsFloating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMorePending, setHasMorePending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const unityControlRef = useRef<UnityPlayerRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const ttsQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Auto-scroll to latest message (within chat area only)
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Process TTS queue - play one sentence, show text, then next
  const processTtsQueue = useCallback(async () => {
    if (isPlayingRef.current || ttsQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const sentence = ttsQueueRef.current.shift()!;

    // Show "more pending" indicator if queue still has items
    setHasMorePending(ttsQueueRef.current.length > 0);

    try {
      // Add message to UI
      setMessages(prev => [...prev, { role: 'assistant', content: sentence }]);

      // Get TTS
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence }),
      });

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        if (ttsData.audio?.base64 && unityControlRef.current?.speakWithWav) {
          setIsSpeaking(true);
          unityControlRef.current.speakWithWav(ttsData.audio.base64);

          // Wait for audio to finish (estimate based on duration)
          const durationMs = (ttsData.audio.duration_sec || 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, durationMs));
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      isPlayingRef.current = false;
      setIsSpeaking(false);

      // Process next in queue
      if (ttsQueueRef.current.length > 0) {
        processTtsQueue();
      } else {
        setHasMorePending(false);
      }
    }
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Set thinking state
    setIsThinking(true);
    unityControlRef.current?.think();

    try {
      // Stream AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
          username: username,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Chat API failed');
      }

      // Read streaming response
      const reader = chatResponse.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            if (data.type === 'sentence' && data.text) {
              // Add sentence to TTS queue
              ttsQueueRef.current.push(data.text);
              // Show pending indicator if there are items waiting (more than the one being processed)
              if (ttsQueueRef.current.length > 1 || isPlayingRef.current) {
                setHasMorePending(true);
              }
              processTtsQueue();
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking, username, processTtsQueue]);

  // Web Speech API voice input
  const {
    isRecording,
    isSupported,
    toggleRecording,
    startRecording,
    stopRecording,
  } = useVoiceInput({
    language: 'ja-JP',
    onInterimTranscript: (text) => {
      if (inputRef.current) {
        inputRef.current.value = text;
      }
    },
    onTranscript: (text) => {
      if (text.trim()) {
        handleSend(text);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    onError: (error) => {
      if (error === 'not-allowed') {
        toast.error("Microphone access denied.");
      } else if (error !== 'no-speech') {
        toast.error(`Voice input error: ${error}`);
      }
    },
  });

  // Spacebar hold-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRecording && isSupported &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isSupported, startRecording, stopRecording]);

  // Ctrl+Enter submit
  useEffect(() => {
    (window as any)._submitChatInput = () => {
      const text = inputRef.current?.value || '';
      if (text.trim()) {
        handleSend(text);
      }
    };

    return () => {
      delete (window as any)._submitChatInput;
    };
  }, [handleSend]);

  if (isCheckingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="ml-3 text-blue-600 font-medium">Loading your space...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-blue-50/50 overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px] pointer-events-none" />

      {/* Main Content: Unity 3D Character (Center) */}
      <div id="unity-container" className="flex-1 flex flex-col items-center justify-center relative z-10 p-0 overflow-hidden w-full h-full">
        <UnityPlayer
          ref={unityControlRef}
          key="sala-unity"
          className="w-full h-full"
          onReady={() => console.log('Unity Ready!')}
          onCharacterStateChanged={(state: string) => {
            console.log('Character state:', state);
            if (state === 'idle') setIsSpeaking(false);
          }}
        />
      </div>

      {/* Right Sidebar: Chat Interface */}
      <div className={`
        flex flex-col z-20 transition-all duration-500 ease-in-out border-white/40 bg-white/60 backdrop-blur-xl shadow-xl
        ${isFloating
          ? 'absolute bottom-6 right-6 w-[400px] rounded-2xl border'
          : 'w-[350px] border-l h-full'
        }
      `}>
        {/* Header */}
        {!isFloating && (
          <div className="p-4 border-b border-white/40 flex items-center justify-between">
            <h2 className="font-bold text-blue-900">Sala</h2>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-green-400'}`} />
              <Link href="/mypage">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-100/50">
                  <Home className="h-4 w-4 text-blue-500" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsFloating(true)} className="h-6 w-6 rounded-full hover:bg-blue-100/50">
                <Minimize2 className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
          </div>
        )}

        {/* Floating Controls */}
        {isFloating && (
          <div className="absolute -top-10 right-0 flex gap-2">
            <Link href="/mypage">
              <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 bg-white/80 backdrop-blur border border-white/50 shadow-sm hover:bg-white">
                <Home className="h-4 w-4 text-blue-600" />
              </Button>
            </Link>
            <Button variant="secondary" size="icon" onClick={() => setIsFloating(false)} className="rounded-full h-8 w-8 bg-white/80 backdrop-blur border border-white/50 shadow-sm hover:bg-white">
              <Maximize2 className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        )}

        {/* Messages with auto-scroll */}
        {!isFloating && (
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-line ${m.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-blue-900 rounded-bl-none border border-blue-100'
                    }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {(isThinking || hasMorePending) && <TypingIndicator />}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className={`p-4 ${!isFloating ? 'border-t border-white/40 bg-white/40' : 'bg-transparent'}`}>
          <div className="flex gap-2 items-end">
            <Button
              size="icon"
              onClick={toggleRecording}
              disabled={!isSupported}
              className={`rounded-full h-10 w-10 shrink-0 shadow-md transition-all ${isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-white hover:bg-blue-50 text-blue-500 border border-blue-100'
                }`}
            >
              {isRecording ? (
                <div className="h-3 w-3 bg-white rounded-sm" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <input
              ref={inputRef}
              type="text"
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              className={`flex-1 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm text-blue-900 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${isRecording ? 'ring-2 ring-red-300' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSend(inputRef.current?.value || '');
                }
              }}
            />

            <Button
              size="icon"
              onClick={() => {
                const text = inputRef.current?.value || '';
                handleSend(text);
              }}
              disabled={isRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-10 w-10 shrink-0 shadow-md transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isRecording && <p className="text-xs text-center text-red-500 mt-2 font-medium animate-pulse">Listening... Click to stop & send.</p>}
        </div>
      </div>
    </div>
  );
}
