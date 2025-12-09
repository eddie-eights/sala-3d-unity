
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleAuth = () => {
        // Mock auth
        if (email && password) {
            router.replace('/chat');
        } else {
            Alert.alert("Error", "Please fill in all fields (Mock)");
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-blue-50 p-6">
            <View className="w-full max-w-sm bg-white/80 rounded-3xl p-6 shadow-xl backdrop-blur-xl border border-white">
                <Text className="text-2xl font-bold text-blue-900 text-center mb-2">
                    {isLogin ? 'Welcome Back' : 'Join the Room'}
                </Text>
                <Text className="text-blue-500 text-center mb-8">
                    {isLogin ? 'Enter your key' : 'Create a new key'}
                </Text>

                <View className="space-y-4 w-full">
                    <View>
                         <Text className="text-blue-800 font-medium ml-1">Email</Text>
                        <TextInput 
                            className="w-full bg-white rounded-xl px-4 py-3 text-blue-900 border border-blue-100"
                            placeholder="hello@sala.ai"
                            placeholderTextColor="#93C5FD"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                    <View>
                        <Text className="text-blue-800 font-medium ml-1">Password</Text>
                        <TextInput 
                            className="w-full bg-white rounded-xl px-4 py-3 text-blue-900 border border-blue-100"
                            placeholder="••••••••"
                            placeholderTextColor="#93C5FD"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    className="w-full bg-blue-500 rounded-xl py-4 mt-8 shadow-lg shadow-blue-200"
                    onPress={handleAuth}
                >
                    <Text className="text-white text-center font-bold text-lg">
                        {isLogin ? 'Enter' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="mt-4">
                     <Text className="text-center text-blue-500 text-sm">
                        {isLogin ? "Don't have a key? Sign Up" : "Already have a key? Log In"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
