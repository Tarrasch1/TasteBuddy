import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@tastebuddy/shared';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.tokens);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Ionicons name="restaurant-outline" size={48} color="#f97316" />
          <Text className="text-xl font-bold mt-4">Welcome back</Text>
          <Text className="text-gray-500 mt-1">Sign in to continue</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Email */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-gray-100 rounded-xl px-4 py-3 text-base ${
                    errors.email ? 'border border-red-500' : ''
                  }`}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-100 rounded-xl px-4 py-3 pr-12 text-base ${
                      errors.password ? 'border border-red-500' : ''
                    }`}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end">
            <Text className="text-primary-500 font-medium">Forgot password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`bg-primary-500 py-4 rounded-xl mt-4 ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text className="text-primary-500 font-medium">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
