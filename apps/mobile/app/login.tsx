import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Fingerprint, 
  ChevronLeft 
} from 'lucide-react-native';
import { authClient } from '../lib/auth-client';

// Google Icon Component
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C.77 9.84 0 12 0 14.61c0 2.61.77 4.77 2.18 7.56l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = isLogin
        ? await authClient.signInEmail(email, password)
        : await authClient.signUpEmail(email, password, email.split('@')[0] || 'User');

      if (result.success) {
        router.replace('/chat');
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await authClient.signInWithGoogle();
      if (result.success) {
        router.replace('/chat');
      } else {
        Alert.alert('Error', result.error || 'Google sign in failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setLoading(true);
    try {
      const result = await authClient.signInWithPasskey();
      if (result.success) {
        router.replace('/chat');
      } else {
        Alert.alert('Info', result.error || 'Passkey sign in failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Sparkles size={24} color="#3B82F6" />
              </View>
              <Text style={styles.title}>Welcome to Sala</Text>
              <Text style={styles.subtitle}>Your personal 3D space</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                onPress={() => setIsLogin(true)}
                style={[styles.tab, isLogin && styles.tabActive]}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsLogin(false)}
                style={[styles.tab, !isLogin && styles.tabActive]}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email & Password Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <Mail size={16} color="#60A5FA" />
                  </View>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="hello@sala.ai"
                    placeholderTextColor="#93C5FD"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <KeyRound size={16} color="#60A5FA" />
                  </View>
                  <TextInput 
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#93C5FD"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.inputIconRight}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#60A5FA" />
                    ) : (
                      <Eye size={16} color="#60A5FA" />
                    )}
                  </TouchableOpacity>
                </View>
                {!isLogin && password.length > 0 && (
                  <Text style={[styles.hint, password.length >= 8 && styles.hintSuccess]}>
                    {password.length >= 8 ? '✓' : '○'} 8文字以上
                  </Text>
                )}
              </View>
            </View>

            {/* Email Auth Button */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                isLogin ? styles.primaryButtonBlue : styles.primaryButtonGreen,
                loading && styles.buttonDisabled
              ]}
              onPress={handleEmailAuth}
              disabled={loading || (!isLogin && password.length < 8)}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            {isLogin && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handlePasskeySignIn}
                disabled={loading}
              >
                <Fingerprint size={20} color="#1D4ED8" />
                <Text style={styles.socialButtonText}>Sign in with Passkey</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity 
              onPress={() => router.replace('/')}
              style={styles.backLink}
            >
              <ChevronLeft size={16} color="#60A5FA" />
              <Text style={styles.backLinkText}>Back to Entrance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  tabTextActive: {
    color: '#1E3A8A',
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    marginLeft: 4,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    height: 48,
  },
  inputIconLeft: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  inputIconRight: {
    paddingRight: 12,
    paddingLeft: 8,
    height: '100%',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A8A',
    paddingVertical: 12,
  },
  passwordInput: {
    paddingRight: 40,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 4,
  },
  hintSuccess: {
    color: '#16A34A',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonBlue: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonGreen: {
    backgroundColor: '#22C55E',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#BFDBFE',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  backLinkText: {
    fontSize: 14,
    color: '#60A5FA',
  },
});
