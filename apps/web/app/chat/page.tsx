"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Mic, MicOff } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! Welcome to your room. I am Sala.' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    // Mock response
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "That's interesting!" }]);
    }, 1000);
  };

  const toggleRecording = () => {
      if (isRecording) {
            // Stop recording -> Auto Send
            setIsRecording(false);
            // Mock voice-to-text result
            handleSend("🎤 [Voice Message] This is a simulated voice input.");
      } else {
            // Start recording
            setIsRecording(true);
      }
  };

  return (
    <div className="flex h-screen w-full bg-blue-50/50 overflow-hidden relative">
       {/* Background Decoration */}
       <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />
       <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px] pointer-events-none" />

      {/* Main Content: Unity Container (Center) */}
      <div id="unity-container" className="flex-1 flex flex-col items-center justify-center relative z-10 p-0 overflow-hidden">
        {/* Placeholder for Unity Canvas - This area is reserved for the 3D scene */}
        <div className="relative h-full w-full flex items-center justify-center">
             {/* Temporary Placeholder Visuals */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-blue-200/20 font-bold text-9xl select-none">UNITY 3D</div>
            </div>
            
            {/* Character Placeholder (to be replaced by Unity Canvas) */}
            <div className="relative z-10 flex h-[600px] w-[400px] items-center justify-center rounded-3xl border-4 border-dashed border-white/30 bg-white/5 backdrop-blur-sm animate-pulse">
                 <span className="text-blue-300 font-medium">Sala (SD Model)</span>
            </div>
        </div>
      </div>

      {/* Right Sidebar: Chat Interface */}
      <div className="w-[350px] border-l border-white/40 bg-white/60 backdrop-blur-xl shadow-xl flex flex-col z-20">
        {/* Header */}
        <div className="p-4 border-b border-white/40 flex items-center justify-between">
            <h2 className="font-bold text-blue-900">Chat with Sala</h2>
            <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-green-400'}`} />
        </div>

        {/* Messages */}
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
            </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-white/40 bg-white/40">
            <div className="flex gap-2 items-end">
                <Button 
                    size="icon" 
                    onClick={toggleRecording} 
                    className={`rounded-full h-10 w-10 shrink-0 shadow-md transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-white hover:bg-blue-50 text-blue-500 border border-blue-100'}`}
                >
                    {isRecording ? <div className="h-3 w-3 bg-white rounded-sm" /> : <Mic className="h-4 w-4" />}
                </Button>

                <div className="relative flex-1">
                     <textarea 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Type a message..."}
                        className="flex min-h-[40px] w-full rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm text-blue-900 placeholder:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        rows={1}
                        disabled={isRecording}
                    />
                </div>

                <Button 
                    size="icon" 
                    onClick={() => handleSend(input)} 
                    disabled={isRecording || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-10 w-10 shrink-0 shadow-md transition-transform hover:scale-105"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
            {isRecording && <p className="text-xs text-center text-red-500 mt-2 font-medium animate-pulse">Recording... Click to stop & send.</p>}
        </div>
      </div>
    </div>
  );
}
