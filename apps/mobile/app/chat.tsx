import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../lib/api-client';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'やっほー！今日はどうしたの？' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const router = useRouter();
  
  // Animation for voice button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: text 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Convert messages to API format
      const history = messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await apiClient.sendMessage(text, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ごめんね、エラーが発生しちゃった...',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking]);

  const handleVoicePress = () => {
    if (isRecording) {
      // Stop recording - would integrate with speech-to-text
      setIsRecording(false);
      // For now, simulate with a placeholder
      // In production, this would use expo-speech or a speech recognition library
    } else {
      setIsRecording(true);
    }
  };

  const getLastAssistantMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i].content;
      }
    }
    return '';
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-100 to-blue-50">
      {/* Header - Minimal */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
        <TouchableOpacity 
          onPress={() => setShowChatHistory(true)}
          className="h-10 w-10 rounded-full bg-white/80 items-center justify-center shadow-sm"
        >
          <Text className="text-blue-600 font-bold text-lg">💬</Text>
        </TouchableOpacity>
        
        <Text className="text-blue-900 font-bold text-lg">Sala</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/settings')}
          className="h-10 w-10 rounded-full bg-white/80 items-center justify-center shadow-sm"
        >
          <Text className="text-blue-600 font-bold text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 3D Character Area - Takes most of the screen */}
      <View className="flex-1 items-center justify-center">
        {/* Placeholder for 3D character */}
        <View className="w-full h-full items-center justify-center bg-gradient-to-b from-blue-100/50 to-transparent">
          <Text className="text-blue-200 text-6xl font-bold opacity-40">3D</Text>
          <Text className="text-blue-300 text-xl opacity-40 mt-2">CHARACTER</Text>
        </View>
      </View>

      {/* Last message bubble - Floating above controls */}
      {!showTextInput && (
        <View className="absolute bottom-40 left-4 right-4">
          <View className="bg-white/90 rounded-2xl px-4 py-3 shadow-lg">
            <Text className="text-blue-900 text-center">
              {isThinking ? '考え中...' : getLastAssistantMessage()}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      <View className="pb-8 px-4">
        {showTextInput ? (
          // Text Input Mode
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="flex-row gap-2 items-end">
              <TouchableOpacity 
                onPress={() => setShowTextInput(false)}
                className="h-12 w-12 rounded-full bg-gray-200 items-center justify-center"
              >
                <Text className="text-gray-600 text-xl">🎤</Text>
              </TouchableOpacity>
              
              <TextInput
                className="flex-1 bg-white rounded-2xl px-4 py-3 text-blue-900 shadow-sm border border-blue-100 min-h-[48px]"
                placeholder="メッセージを入力..."
                placeholderTextColor="#93C5FD"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => handleSendMessage(input)}
                multiline
                autoFocus
              />
              
              <TouchableOpacity 
                onPress={() => handleSendMessage(input)}
                className="h-12 w-12 rounded-full bg-blue-500 items-center justify-center shadow-md"
                disabled={isThinking}
              >
                <Text className="text-white text-xl">➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          // Voice Input Mode (Default)
          <View className="items-center">
            <View className="flex-row items-center gap-6">
              {/* Switch to Text Input */}
              <TouchableOpacity 
                onPress={() => setShowTextInput(true)}
                className="h-12 w-12 rounded-full bg-white/80 items-center justify-center shadow-sm"
              >
                <Text className="text-blue-600 text-xl">⌨️</Text>
              </TouchableOpacity>

              {/* Main Voice Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity 
                  onPress={handleVoicePress}
                  onLongPress={() => setIsRecording(true)}
                  onPressOut={() => isRecording && setIsRecording(false)}
                  className={`h-20 w-20 rounded-full items-center justify-center shadow-lg ${
                    isRecording ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                >
                  <Text className="text-white text-3xl">
                    {isRecording ? '⏹' : '🎤'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Placeholder for symmetry */}
              <View className="h-12 w-12" />
            </View>
            
            <Text className="text-blue-400 text-xs mt-3">
              {isRecording ? 'タップで停止' : 'タップして話す'}
            </Text>
          </View>
        )}
      </View>

      {/* Chat History Modal */}
      <Modal
        visible={showChatHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatHistory(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity 
            className="h-1/4" 
            onPress={() => setShowChatHistory(false)} 
          />
          
          <View className="flex-1 bg-white rounded-t-3xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-blue-900">チャット履歴</Text>
              <TouchableOpacity onPress={() => setShowChatHistory(false)}>
                <Text className="text-blue-500 font-bold">閉じる</Text>
              </TouchableOpacity>
            </View>
            
            {/* Messages */}
            <ScrollView className="flex-1 p-4">
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  className={`flex-row mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <View className="h-8 w-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                      <Text className="text-blue-500 font-bold text-xs">S</Text>
                    </View>
                  )}
                  <View 
                    className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 rounded-br-none' 
                        : 'bg-gray-100 rounded-bl-none'
                    }`}
                  >
                    <Text className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
              {isThinking && (
                <View className="flex-row justify-start mb-3">
                  <View className="h-8 w-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                    <Text className="text-blue-500 font-bold text-xs">S</Text>
                  </View>
                  <View className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2">
                    <Text className="text-gray-500">考え中...</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
