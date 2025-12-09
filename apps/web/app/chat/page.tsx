'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UnityView from "@/components/unity/unity-wrapper";
import { Send, Mic, Settings, Menu } from 'lucide-react';
import Link from 'next/link';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am Sala. How can I help you today?' }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        
        // Mock response
        setTimeout(() => {
             const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I am just a demo for now, but I am listening!' };
             setMessages(prev => [...prev, newAiMsg]);
        }, 1000);
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
            {/* Sidebar (Hidden on mobile by default) */}
            <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">
                <div className="flex h-16 items-center border-b border-slate-800 px-4">
                    <span className="text-lg font-bold text-white">Sala 3D</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Recent Chats</div>
                    {/* History items would go here */}
                    <div className="rounded-md bg-slate-800 p-2 text-sm text-slate-300">New Conversation</div>
                </div>
                <div className="border-t border-slate-800 p-4">
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative flex flex-1 flex-col">
                {/* 3D Background Layer */}
                <div className="absolute inset-0 z-0">
                    <UnityView />
                </div>

                {/* Navbar Overlay */}
                <div className="z-10 flex h-16 items-center justify-between px-4 md:justify-end">
                    <Button variant="ghost" size="icon" className="text-white md:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="hidden md:block" /> 
                </div>

                {/* Chat Area Overlay */}
                {/* We position chat at the bottom or side. Let's do a bottom-center floating panel style */}
                <div className="z-10 mt-auto flex w-full flex-col items-center p-4">
                    
                    {/* Chat Logs (Scrollable) */}
                    <ScrollArea className="mb-4 h-[40vh] w-full max-w-2xl rounded-lg bg-black/40 backdrop-blur-sm p-4 text-white shadow-xl">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700/80 text-white'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="flex w-full max-w-2xl gap-2 rounded-full border border-slate-700 bg-slate-900/90 p-2 backdrop-blur-md">
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:bg-slate-800 hover:text-white">
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Input 
                            className="flex-1 border-none bg-transparent text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                         <Button size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSend}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
