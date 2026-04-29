import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi } from '@/lib/api';

interface Activity {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [isAuthenticated]);

  const loadFeed = async () => {
    try {
      if (isAuthenticated) {
        const response = await socialApi.getFeed({ limit: 20 });
        setActivities(response.data);
      } else {
        const response = await socialApi.getPublicFeed({ limit: 20 });
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="restaurant-outline" size={64} color="#f97316" />
        <Text className="text-2xl font-bold mt-6 text-center">Welcome to TasteBuddy</Text>
        <Text className="text-gray-500 mt-2 text-center">
          Discover, rate, and share your favorite dishes with friends.
        </Text>
        
        <TouchableOpacity
          onPress={() => router.push('/auth/register')}
          className="bg-primary-500 w-full py-3 rounded-xl mt-8"
        >
          <Text className="text-white text-center font-semibold text-lg">Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="w-full py-3 rounded-xl mt-3 border border-gray-200"
        >
          <Text className="text-gray-700 text-center font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/explore')}
          className="mt-6"
        >
          <Text className="text-primary-500 font-medium">Explore without account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
      }
    >
      {/* Welcome Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-gray-500">Welcome back,</Text>
        <Text className="text-xl font-bold text-gray-900">{user?.displayName}</Text>
      </View>

      {/* Quick Actions */}
      <View className="flex-row px-4 py-4 gap-3">
        <TouchableOpacity
          onPress={() => router.push('/nearby')}
          className="flex-1 bg-primary-50 rounded-xl p-4 items-center"
        >
          <Ionicons name="location" size={24} color="#f97316" />
          <Text className="text-primary-600 font-medium mt-2">Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/explore')}
          className="flex-1 bg-blue-50 rounded-xl p-4 items-center"
        >
          <Ionicons name="search" size={24} color="#3b82f6" />
          <Text className="text-blue-600 font-medium mt-2">Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/saved')}
          className="flex-1 bg-red-50 rounded-xl p-4 items-center"
        >
          <Ionicons name="heart" size={24} color="#ef4444" />
          <Text className="text-red-600 font-medium mt-2">Saved</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Feed */}
      <View className="px-4 py-2">
        <Text className="text-lg font-bold text-gray-900 mb-4">Recent Activity</Text>
        
        {isLoading ? (
          <View className="items-center py-8">
            <Text className="text-gray-500">Loading...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-gray-500">No activity yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/explore')}
              className="mt-4 bg-primary-500 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Start Exploring</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const getActivityText = () => {
    switch (activity.type) {
      case 'ITEM_REVIEW':
        return `reviewed ${activity.data.itemName || 'an item'}`;
      case 'VENUE_REVIEW':
        return `reviewed ${activity.data.venueName || 'a venue'}`;
      case 'NEW_FRIEND':
        return 'made a new friend';
      default:
        return 'did something';
    }
  };

  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        {activity.user.avatarUrl ? (
          <Image
            source={{ uri: activity.user.avatarUrl }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={20} color="#9ca3af" />
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-gray-900">
          <Text className="font-semibold">{activity.user.displayName}</Text>
          {' '}{getActivityText()}
        </Text>
        
        {activity.data.rating && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-gray-600 ml-1">{activity.data.rating}</Text>
          </View>
        )}
        
        {activity.data.comment && (
          <Text className="text-gray-500 mt-1" numberOfLines={2}>
            "{activity.data.comment}"
          </Text>
        )}
        
        <Text className="text-gray-400 text-xs mt-2">
          {new Date(activity.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}
