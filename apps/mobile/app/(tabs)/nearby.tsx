import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { venueApi } from '@/lib/api';

interface NearbyVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  distance: number;
  photos: { url: string }[];
  category: { name: string; icon: string };
}

export default function NearbyScreen() {
  const router = useRouter();
  const [venues, setVenues] = useState<NearbyVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getLocationAndLoadVenues();
  }, []);

  const getLocationAndLoadVenues = async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable it in settings.');
        setIsLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(coords);

      // Load nearby venues
      const data = await venueApi.nearby(coords.latitude, coords.longitude, 5);
      setVenues(data);
    } catch (error) {
      console.error('Failed to get location or load venues:', error);
      setLocationError('Failed to get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (locationError) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="location-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-500 text-center mt-4">{locationError}</Text>
        <TouchableOpacity
          onPress={getLocationAndLoadVenues}
          className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-500 mt-4">Finding venues near you...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Location Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="location" size={18} color="#f97316" />
          <Text className="text-gray-600 ml-2">
            {location ? 'Showing venues within 5km' : 'Location not available'}
          </Text>
          <TouchableOpacity onPress={getLocationAndLoadVenues} className="ml-auto">
            <Ionicons name="refresh" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Venues List */}
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="restaurant-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-center">
              No venues found nearby.{'\n'}Try expanding your search area.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/venue/${item.id}`)}
            className="flex-row bg-white border border-gray-100 rounded-xl mb-3 overflow-hidden shadow-sm"
          >
            {/* Image */}
            <View className="w-28 h-28 bg-gray-100">
              {item.photos?.[0] ? (
                <Image
                  source={{ uri: item.photos[0].url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-4xl">{item.category?.icon || '🍽️'}</Text>
                </View>
              )}
            </View>
            
            {/* Details */}
            <View className="flex-1 p-3 justify-between">
              <View>
                <View className="flex-row items-start justify-between">
                  <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center ml-2">
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text className="text-gray-600 ml-1 font-medium">
                      {item.averageRating?.toFixed(1) || '-'}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-500 text-sm mt-1">
                  {item.category?.name} • {'$'.repeat(item.priceLevel || 1)}
                </Text>
                
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
              
              {/* Distance Badge */}
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-400 text-xs">{item.reviewCount} reviews</Text>
                <View className="bg-primary-50 px-2 py-1 rounded-full">
                  <Text className="text-primary-600 text-xs font-medium">
                    {formatDistance(item.distance)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
