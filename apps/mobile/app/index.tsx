
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LandingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-50 relative overflow-hidden">
        <StatusBar style="dark" />
        {/* Background Blobs */}
        <View className="absolute top-[-50] left-[-50] h-64 w-64 rounded-full bg-blue-200 opacity-40 blur-3xl" />
        <View className="absolute bottom-[-50] right-[-50] h-64 w-64 rounded-full bg-cyan-200 opacity-40 blur-3xl" />

        {/* 3D Placeholder */}
        <View className="flex-1 items-center justify-center w-full">
            <View className="h-64 w-64 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                <Text className="text-blue-300 font-bold text-lg">3D MODEL HERE</Text>
            </View>
        </View>

        {/* Door Button */}
        <View className="mb-20 items-center">
            <Link href="/login" asChild>
                <TouchableOpacity className="items-center justify-center">
                    <View className="h-48 w-32 rounded-t-full border-4 border-white bg-white/40 shadow-xl flex items-center justify-center overflow-hidden backdrop-blur-md">
                        <View className="h-full w-full border-2 border-dashed border-white/60 rounded-t-full flex items-center justify-center">
                             <Text className="text-xl font-bold text-blue-600/80">ENTER</Text>
                        </View>
                    </View>
                    <View className="mt-4 h-2 w-24 bg-blue-900/10 rounded-full blur-sm" />
                </TouchableOpacity>
            </Link>
        </View>
        
        <Text className="absolute bottom-6 text-blue-300 text-xs">Sala 3D Mobile</Text>
    </View>
  );
}
