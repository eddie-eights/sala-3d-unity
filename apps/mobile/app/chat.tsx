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
  StyleSheet,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../lib/api-client';
import { User, ArrowLeft, Mic, Send, Keyboard, X, StopCircle, Home, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'お疲れさま！\n何かいいことあった？' }
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
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Here you would implement actual recording stop and speech-to-text
  };

  const handleVoicePress = () => {
      // No-op for tap, we use press-in/out
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
    <LinearGradient
      colors={['#DBEAFE', '#EFF6FF']} // blue-100 to blue-50
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{width: 44}} /> {/* Placeholder for balance */}
          
          <View style={styles.titleContainer}>
              <View style={styles.titleIcon}>
                  <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.headerTitle}>Sala</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/mypage')}
            style={styles.headerButton}
          >
            <Home size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* 3D Character Area */}
        <View style={styles.characterArea}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>3D CHARACTER</Text>
            <View style={styles.placeholderRing} />
          </View>
        </View>

        {/* Floating Message Bubble */}
        {!showTextInput && (
          <Animated.View style={styles.floatingMessageContainer}>
            <View style={styles.floatingMessageContent}>
               <View style={styles.messageTriangle} />
               <Text style={styles.floatingMessageText}>
                  {isThinking ? '考え中...' : getLastAssistantMessage()}
               </Text>
            </View>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.bottomControls}
        >
          {showTextInput ? (
            // Text Input Mode
            <View style={styles.textInputContainer}>
              <TouchableOpacity 
                onPress={() => setShowTextInput(false)}
                style={styles.modeSwitchButton}
              >
                <Mic size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.textInput}
                placeholder="メッセージを入力..."
                placeholderTextColor="#9CA3AF"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => handleSendMessage(input)}
                returnKeyType="send"
              />
              
              <TouchableOpacity 
                onPress={() => handleSendMessage(input)}
                style={[
                    styles.sendButton, 
                    input.trim().length === 0 && styles.sendButtonDisabled
                ]}
                disabled={input.trim().length === 0 || isThinking}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowChatHistory(true)}
                style={{ marginLeft: 8, padding: 4 }}
              >
                <MessageCircle size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ) : (
            // Voice Input Mode
            <View style={styles.voiceInputContainer}>
              <TouchableOpacity 
                onPress={() => setShowTextInput(true)}
                style={styles.modeSwitchButtonSecondary}
              >
                <Keyboard size={24} color="#6B7280" />
              </TouchableOpacity>

              <View style={styles.voiceButtonWrapper}>
                  <Animated.View 
                      style={[
                          styles.pulseRing, 
                          { transform: [{ scale: pulseAnim }], opacity: isRecording ? 1 : 0 }
                      ]} 
                  />
                  <Pressable 
                    onPressIn={startRecording}
                    onPressOut={stopRecording}
                    style={({pressed}) => [
                      styles.voiceButton,
                      pressed && styles.voiceButtonPressed,
                      isRecording && styles.voiceButtonRecording
                    ]}
                  >
                   <Mic size={32} color="white" />
                  </Pressable>
              </View>

              <TouchableOpacity 
                onPress={() => setShowChatHistory(true)}
                style={styles.historyButtonSecondary}
              >
                <MessageCircle size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <Text style={styles.voiceHint}>
                {isRecording ? '離して送信' : '押しながら話す'}
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Chat History Modal */}
        <Modal
          visible={showChatHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowChatHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalDismissArea} onPress={() => setShowChatHistory(false)} />
            
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>History</Text>
                <TouchableOpacity onPress={() => setShowChatHistory(false)} style={styles.closeButton}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                  style={styles.messagesList}
                  contentContainerStyle={styles.messagesListContent}
              >
                {messages.map((msg) => (
                  <View 
                    key={msg.id} 
                    style={[
                        styles.messageRow, 
                        msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant
                    ]}
                  >
                    {msg.role === 'assistant' && (
                      <View style={styles.avatarSmall}>
                          <View style={styles.avatarOnlineDot} />
                          <Text style={styles.avatarText}>S</Text>
                      </View>
                    )}
                    <View 
                      style={[
                        styles.messageBubble,
                        msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant
                      ]}
                    >
                      <Text style={[
                          styles.messageText,
                          msg.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant
                      ]}>
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                ))}
                {isThinking && (
                  <View style={styles.messageRowAssistant}>
                     <View style={styles.avatarSmall}>
                          <Text style={styles.avatarText}>S</Text>
                     </View>
                     <View style={styles.typingIndicator}>
                          <View style={styles.typingDot} />
                          <View style={[styles.typingDot, { marginHorizontal: 4 }]} />
                          <View style={styles.typingDot} />
                     </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  titleIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // emerald-500
    marginRight: 6,
  },
  onlineIndicator: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  characterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#E5E7EB',
    letterSpacing: 2,
  },
  placeholderRing: {
    marginTop: 20,
    width: 120,
    height: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  floatingMessageContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingMessageContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: '90%',
  },
  messageTriangle: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.95)',
  },
  floatingMessageText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomControls: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  modeSwitchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    paddingHorizontal: 12,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  voiceInputContainer: {
    alignItems: 'center',
    position: 'relative',
    height: 120, // ensure space for large button
    justifyContent: 'center',
  },
  modeSwitchButtonSecondary: {
    position: 'absolute',
    left: 20,
    bottom: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonSecondary: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  voiceButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  voiceButtonRecording: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCA5A5', // light red
    zIndex: 1,
  },

  voiceHint: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  avatarOnlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  messageTextUser: {
    color: 'white',
  },
  messageTextAssistant: {
    color: '#1F2937',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
});
