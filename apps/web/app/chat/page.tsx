"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Mic, MicOff, Minimize2, Maximize2, Home, Loader2 } from "lucide-react";
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

export default function ChatPage() {
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  useEffect(() => {
    const checkProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                // Check for required fields: username and birthday
                if (!data.username || !data.birthday) {
                    toast.warning("Please complete your profile first.");
                    router.push('/mypage');
                } else {
                    setIsCheckingProfile(false);
                }
            } else if (res.status === 401) {
                 // Not authenticated - redirect to welcome
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

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'お疲れさま！　何かいいことあった？' }
  ]);
  const [isFloating, setIsFloating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Input ref for uncontrolled input (fixes Japanese IME issues)
  const inputRef = useRef<HTMLInputElement>(null);

  // Unity control ref
  const unityControlRef = useRef<UnityPlayerRef>(null);

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
      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.slice(-10),
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Chat API failed');
      }

      const chatData = await chatResponse.json();
      const aiText = chatData.text;

      // Stop thinking indicator before showing response
      setIsThinking(false);

      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);

      // Use OpenAI TTS with Unity lip sync
      if (aiText && aiText.trim()) {
        const ttsResponse = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            const base64Data = base64Audio.split(',')[1];
            if (unityControlRef.current?.speakWithAudio && base64Data) {
              setIsSpeaking(true);
              unityControlRef.current.speakWithAudio(base64Data);
            }
          };
          reader.readAsDataURL(audioBlob);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking]);

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
      // Show interim text in input field while speaking
      if (inputRef.current) {
        inputRef.current.value = text;
      }
    },
    onTranscript: (text) => {
      if (text.trim()) {
        handleSend(text);
      }
      // Clear input after sending
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    onError: (error) => {
      if (error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access.");
      } else if (error !== 'no-speech') {
        toast.error(`Voice input error: ${error}`);
      }
    },
  });

  // Spacebar hold-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if spacebar pressed and not already recording
      // Ignore if user is typing in an input/textarea
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
        {/* Header - Only visible when NOT floating, OR we need a toggle button somewhere */}
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

        {/* Floating Controls (When Floating) */}
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

        {/* Messages - Hidden when floating */}
        {!isFloating && (
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                m.role === 'user' 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-white text-blue-900 rounded-bl-none border border-blue-100'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && <TypingIndicator />}
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
                    className={`rounded-full h-10 w-10 shrink-0 shadow-md transition-all ${
                      isRecording 
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
                    className="flex-1 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm text-blue-900 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    disabled={isRecording}
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
