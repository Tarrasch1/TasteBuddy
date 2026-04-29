import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { venueApi } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  photos: { url: string }[];
  category: { name: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadVenues();
  }, []);

  useEffect(() => {
    loadVenues();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await venueApi.categories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const response = await venueApi.list({
        page: 1,
        limit: 20,
        categoryId: selectedCategory || undefined,
      });
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVenues();
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await venueApi.search(searchQuery);
      setVenues(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadVenues(); }}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'All', icon: '🍽️' }, ...categories]}
        keyExtractor={(item) => item.id?.toString() || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item.id)}
            className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
              (selectedCategory === item.id) || (!selectedCategory && !item.id)
                ? 'bg-primary-500'
                : 'bg-gray-100'
            }`}
          >
            <Text className="mr-1">{item.icon}</Text>
            <Text
              className={
                (selectedCategory === item.id) || (!selectedCategory && !item.id)
                  ? 'text-white font-medium'
                  : 'text-gray-700'
              }
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Venues List */}
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-500">
              {isLoading ? 'Loading...' : 'No venues found'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/venue/${item.id}`)}
            className="flex-row bg-white border border-gray-100 rounded-xl mb-3 overflow-hidden"
          >
            {/* Image */}
            <View className="w-24 h-24 bg-gray-100">
              {item.photos?.[0] ? (
                <Image
                  source={{ uri: item.photos[0].url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-3xl">{item.category?.icon || '🍽️'}</Text>
                </View>
              )}
            </View>
            
            {/* Details */}
            <View className="flex-1 p-3">
              <View className="flex-row items-start justify-between">
                <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <View className="flex-row items-center ml-2">
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text className="text-gray-600 ml-1">
                    {item.averageRating?.toFixed(1) || '-'}
                  </Text>
                </View>
              </View>
              
              <Text className="text-gray-500 text-sm mt-1">
                {item.category?.name} • {'$'.repeat(item.priceLevel || 1)}
              </Text>
              
              <View className="flex-row items-center mt-2">
                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>
                  {item.city}
                </Text>
              </View>
              
              <Text className="text-gray-400 text-xs mt-1">
                {item.reviewCount} reviews
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
