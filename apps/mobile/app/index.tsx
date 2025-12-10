
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LandingScreen() {
  return (
    <View className="flex-1 bg-blue-50 relative overflow-hidden">
        <StatusBar style="dark" />
        
        {/* Background Gradients */}
        <View className="absolute top-[-20%] left-[-20%] h-[50%] w-[50%] rounded-full bg-blue-200 opacity-30 blur-[100px]" />
        <View className="absolute bottom-[-20%] right-[-20%] h-[50%] w-[50%] rounded-full bg-cyan-200 opacity-30 blur-[100px]" />

        {/* 3D Placeholder (Center) */}
        <View className="flex-1 items-center justify-center">
            <View className="h-64 w-64 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm">
                <Text className="text-blue-400 font-semibold tracking-widest text-sm">LOADING 3D MODEL...</Text>
            </View>
        </View>

        {/* Door Button (Bottom Right) */}
        <View className="absolute bottom-12 right-8">
            <Link href="/login" asChild>
                <TouchableOpacity className="items-center justify-center group active:scale-95 transition-transform">
                    <View className="h-24 w-16 bg-white rounded-t-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-end pb-2">
                         <View className="h-[90%] w-[80%] bg-blue-100/50 rounded-t-full border border-blue-200" />
                         <View className="absolute top-[50%] right-2 h-2 w-2 bg-yellow-400 rounded-full shadow-sm" />
                    </View>
                    <Text className="mt-2 text-blue-400 text-xs font-bold tracking-widest text-center">ENTER</Text>
                </TouchableOpacity>
            </Link>
        </View>
        
        <Text className="absolute bottom-6 left-6 text-blue-300/50 text-[10px] tracking-tighter">SALA MOBILE v0.1</Text>
    </View>
  );
}
