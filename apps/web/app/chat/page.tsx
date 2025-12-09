'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UnityView from "@/components/unity/unity-wrapper";
import { Send, Mic, Settings, Calendar, Heart, Menu } from 'lucide-react';
import Link from 'next/link';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Good morning! It feels really nice today, doesn\'t it?' }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        
        // Mock response
        setTimeout(() => {
             const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I am listening... (Database not connected yet!)' };
             setMessages(prev => [...prev, newAiMsg]);
        }, 1000);
    };

    return (
        <div className="flex h-screen w-full bg-blue-50/20 overflow-hidden font-sans">
            {/* Sidebar (Cute/Glassmorphism) */}
            <aside className="hidden w-72 flex-col border-r border-white/40 bg-white/60 backdrop-blur-md md:flex z-20 shadow-sm">
                <div className="flex h-20 items-center px-6 border-b border-white/40">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-300 to-cyan-200 shadow-inner flex items-center justify-center text-white font-bold">S</div>
                    <span className="ml-3 text-xl font-bold text-blue-900 tracking-tight">Sala Room</span>
                </div>
                
                {/* Status Card */}
                <div className="p-4">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-white p-4 shadow-sm border border-white">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-400 uppercase">Mood</span>
                            <Heart className="h-4 w-4 text-pink-400 fill-pink-400 animate-pulse" />
                         </div>
                         <div className="text-sm text-blue-800 font-medium">
                            "I'm feeling happy to see you!"
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    <div className="px-2 text-xs font-bold uppercase text-blue-300 tracking-wider">Memories</div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/50 p-3 text-sm text-blue-800 hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-blue-100">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>Recent Chat</span>
                    </div>
                </div>

                <div className="border-t border-white/40 p-4">
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start text-blue-600 hover:bg-blue-50 rounded-xl">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative flex flex-1 flex-col h-full w-full">
                
                {/* 3D Background Layer */}
                <div className="absolute inset-0 z-0">
                    <UnityView />
                </div>

                {/* Navbar Overlay (Mobile) */}
                <div className="absolute top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 md:hidden pointer-events-none">
                    <Button variant="secondary" size="icon" className="bg-white/80 shadow-sm pointer-events-auto backdrop-blur text-blue-900">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Chat Area Overlay - Floating Bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center p-4 md:p-6 pb-6 md:pb-10 pointer-events-none">
                    
                    {/* Chat Logs (Scrollable) */}
                    {/* Use 'pointer-events-auto' so we can scroll */}
                    <ScrollArea className="mb-4 h-[35vh] w-full max-w-2xl pointer-events-auto pr-4">
                        <div className="flex flex-col gap-4 pb-2">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    {msg.role === 'assistant' && (
                                        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-blue-100 text-xs font-bold text-blue-400">S</div>
                                    )}
                                    <div 
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed
                                        ${msg.role === 'user' 
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none' 
                                            : 'bg-white/90 backdrop-blur-md text-blue-900 border border-white/50 rounded-bl-none'}`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-white/50 bg-white/70 p-2 shadow-xl backdrop-blur-md transition-all focus-within:bg-white/90 focus-within:scale-[1.01]">
                        <Button variant="ghost" size="icon" className="rounded-full text-blue-400 hover:bg-blue-100 hover:text-blue-600">
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Input 
                            className="flex-1 border-none bg-transparent text-blue-900 placeholder-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                            placeholder="Tell Sala anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                         <Button size="icon" className="rounded-xl bg-blue-500 hover:bg-blue-600 shadow-md transition-colors" onClick={handleSend}>
                            <Send className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
