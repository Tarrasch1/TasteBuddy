import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi } from '@/lib/api';

interface SavedVenue {
  savedAt: string;
  note?: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    averageRating: number;
    photos: { url: string }[];
    category: { name: string; icon: string };
  };
}

interface SavedItem {
  savedAt: string;
  note?: string;
  item: {
    id: string;
    name: string;
    averageRating: number;
    photos: { url: string }[];
    venue: { id: string; name: string };
    category: { name: string };
  };
}

export default function SavedScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'venues' | 'items'>('venues');
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSaved();
    }
  }, [isAuthenticated]);

  const loadSaved = async () => {
    try {
      const [venuesRes, itemsRes] = await Promise.all([
        socialApi.getSavedVenues({ limit: 50 }),
        socialApi.getSavedItems({ limit: 50 }),
      ]);
      setSavedVenues(venuesRes.data);
      setSavedItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to load saved:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, []);

  const handleUnsaveVenue = async (venueId: string) => {
    try {
      await socialApi.unsaveVenue(venueId);
      setSavedVenues(prev => prev.filter(v => v.venue.id !== venueId));
    } catch (error) {
      console.error('Failed to unsave:', error);
    }
  };

  const handleUnsaveItem = async (itemId: string) => {
    try {
      await socialApi.unsaveItem(itemId);
      setSavedItems(prev => prev.filter(i => i.item.id !== itemId));
    } catch (error) {
      console.error('Failed to unsave:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="heart-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-500 text-center mt-4">
          Sign in to save your favorite venues and dishes
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
    <View className="flex-1 bg-white">
      {/* Tabs */}
      <View className="flex-row border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab('venues')}
          className={`flex-1 py-3 ${activeTab === 'venues' ? 'border-b-2 border-primary-500' : ''}`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'venues' ? 'text-primary-500' : 'text-gray-500'
            }`}
          >
            Venues ({savedVenues.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('items')}
          className={`flex-1 py-3 ${activeTab === 'items' ? 'border-b-2 border-primary-500' : ''}`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'items' ? 'text-primary-500' : 'text-gray-500'
            }`}
          >
            Dishes ({savedItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'venues' ? (
        <FlatList
          data={savedVenues}
          keyExtractor={(item) => item.venue.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-500">
                {isLoading ? 'Loading...' : 'No saved venues yet'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/venue/${item.venue.id}`)}
              className="flex-row bg-white border border-gray-100 rounded-xl mb-3 overflow-hidden"
            >
              <View className="w-20 h-20 bg-gray-100">
                {item.venue.photos?.[0] ? (
                  <Image
                    source={{ uri: item.venue.photos[0].url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-2xl">{item.venue.category?.icon || '🍽️'}</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1 p-3">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {item.venue.name}
                </Text>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  {item.venue.city}
                </Text>
                {item.note && (
                  <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                    Note: {item.note}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                onPress={() => handleUnsaveVenue(item.venue.id)}
                className="p-3 justify-center"
              >
                <Ionicons name="heart" size={24} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-500">
                {isLoading ? 'Loading...' : 'No saved dishes yet'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/item/${item.item.id}`)}
              className="flex-row bg-white border border-gray-100 rounded-xl mb-3 overflow-hidden"
            >
              <View className="w-20 h-20 bg-gray-100">
                {item.item.photos?.[0] ? (
                  <Image
                    source={{ uri: item.item.photos[0].url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-2xl">🍴</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1 p-3">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {item.item.name}
                </Text>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  at {item.item.venue.name}
                </Text>
                {item.note && (
                  <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                    Note: {item.note}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                onPress={() => handleUnsaveItem(item.item.id)}
                className="p-3 justify-center"
              >
                <Ionicons name="heart" size={24} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
