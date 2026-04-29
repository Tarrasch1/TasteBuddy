import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.logout();
            } catch (error) {
              // Ignore errors
            }
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="person-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-500 text-center mt-4">
          Sign in to view your profile
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="items-center pt-6 pb-8 border-b border-gray-100">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <Ionicons name="person" size={48} color="#9ca3af" />
          )}
        </View>
        
        <Text className="text-xl font-bold text-gray-900">{user.displayName}</Text>
        <Text className="text-gray-500">@{user.username}</Text>
        
        {user.bio && (
          <Text className="text-gray-600 text-center mt-2 px-6">{user.bio}</Text>
        )}
        
        <TouchableOpacity
          onPress={() => router.push('/profile/edit')}
          className="mt-4 border border-gray-200 px-6 py-2 rounded-lg"
        >
          <Text className="text-gray-700 font-medium">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row py-4 border-b border-gray-100">
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-gray-900">0</Text>
          <Text className="text-gray-500 text-sm">Reviews</Text>
        </View>
        <View className="flex-1 items-center border-x border-gray-100">
          <Text className="text-xl font-bold text-gray-900">0</Text>
          <Text className="text-gray-500 text-sm">Friends</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-gray-900">0</Text>
          <Text className="text-gray-500 text-sm">Saved</Text>
        </View>
      </View>

      {/* Menu */}
      <View className="py-2">
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => router.push('/notifications')}
        />
        <MenuItem
          icon="people-outline"
          label="Friends"
          onPress={() => router.push('/friends')}
        />
        <MenuItem
          icon="star-outline"
          label="My Reviews"
          onPress={() => router.push('/reviews')}
        />
        <MenuItem
          icon="time-outline"
          label="Activity History"
          onPress={() => router.push('/activity')}
        />
        
        <View className="h-2 bg-gray-50" />
        
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => router.push('/settings')}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => router.push('/help')}
        />
        <MenuItem
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={() => router.push('/privacy')}
        />
        
        <View className="h-2 bg-gray-50" />
        
        <MenuItem
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleLogout}
          danger
        />
      </View>

      {/* App Version */}
      <View className="items-center py-6">
        <Text className="text-gray-400 text-sm">TasteBuddy v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:bg-gray-50"
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? '#ef4444' : '#6b7280'}
      />
      <Text
        className={`flex-1 ml-3 text-base ${
          danger ? 'text-red-500' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}
