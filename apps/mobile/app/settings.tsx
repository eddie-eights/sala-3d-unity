
import { View, Text, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
             <View className="h-14 flex-row items-center px-4 border-b border-gray-100">
                 <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Text className="text-blue-500 font-bold">Back</Text>
                 </TouchableOpacity>
                 <Text className="text-lg font-bold text-blue-900">Settings</Text>
            </View>

            <View className="p-4">
                <Text className="text-xl font-bold text-blue-900 mb-4">Profile Information</Text>
                {/* Mock Fields */}
                <View className="bg-blue-50 rounded-xl p-4 mb-4">
                    <Text className="text-blue-400 text-xs uppercase font-bold mb-1">Display Name</Text>
                    <Text className="text-blue-900 text-lg">User</Text>
                </View>

                <Text className="text-xl font-bold text-blue-900 mb-4 mt-4">App Settings</Text>
                <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
                    <Text className="text-blue-900">Dark Mode</Text>
                     <Text className="text-gray-400">Off</Text>
                </View>
                 <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
                    <Text className="text-blue-900">Notifications</Text>
                     <Switch value={true} trackColor={{ true: '#3B82F6' }} />
                </View>
            </View>
        </SafeAreaView>
    )
}
