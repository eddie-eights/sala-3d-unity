
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
// Icons are harder in RN without vector-icons setup properly or SVG. Using text for now or simple shapes.

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am ready to talk on Mobile too!' }
    ]);
    const [input, setInput] = useState('');
    const router = useRouter();

    const handleSend = () => {
        if (!input.trim()) return;
        const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        
        // Mock response
        setTimeout(() => {
             const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I hear you! (Mobile)' };
             setMessages(prev => [...prev, newAiMsg]);
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-blue-50">
            {/* Header */}
            <View className="h-14 flex-row items-center justify-between px-4 border-b border-blue-100 bg-white/50 backdrop-blur-sm">
                 <Text className="text-xl font-bold text-blue-900">Sala</Text>
                 <TouchableOpacity onPress={() => router.push('/settings')} className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 font-bold text-xs">Settings</Text>
                 </TouchableOpacity>
            </View>

            {/* 3D View Placeholder */}
            <View className="flex-1 items-center justify-center">
                <Text className="text-blue-200 text-4xl font-bold opacity-30">3D SCENE</Text>
            </View>

            {/* Chat Overlay */}
            <View className="h-1/2 bg-transparent justify-end pb-4">
                 <ScrollView className="flex-1 px-4 mb-2">
                    {messages.map((msg) => (
                        <View key={msg.id} className={`flex-row mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <View className="h-8 w-8 rounded-full bg-white border border-blue-100 items-center justify-center mr-2">
                                    <Text className="text-blue-500 font-bold text-xs">S</Text>
                                </View>
                            )}
                            <View 
                                className={`rounded-2xl px-4 py-2 max-w-[80%] 
                                ${msg.role === 'user' ? 'bg-blue-500 rounded-br-none' : 'bg-white rounded-bl-none shadow-sm'}`}
                            >
                                <Text className={msg.role === 'user' ? 'text-white' : 'text-blue-900'}>
                                    {msg.content}
                                </Text>
                            </View>
                        </View>
                    ))}
                 </ScrollView>

                 <View className="px-4 flex-row gap-2">
                    <TextInput 
                        className="flex-1 bg-white rounded-full px-4 py-3 text-blue-900 shadow-sm border border-blue-50"
                        placeholder="Say something..."
                        placeholderTextColor="#93C5FD"
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity 
                        className="h-12 w-12 rounded-full bg-blue-500 items-center justify-center shadow-md"
                        onPress={handleSend}
                    >
                         <Text className="text-white font-bold">></Text>
                    </TouchableOpacity>
                 </View>
            </View>
        </SafeAreaView>
    );
}
