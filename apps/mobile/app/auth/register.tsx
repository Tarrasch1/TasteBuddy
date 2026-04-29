import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@tastebuddy/shared';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      displayName: '',
      password: '',
    },
  });

  const password = watch('password', '');
  
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.tokens);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Header */}
        <View className="items-center mb-6">
          <Ionicons name="restaurant-outline" size={48} color="#f97316" />
          <Text className="text-xl font-bold mt-4">Create account</Text>
          <Text className="text-gray-500 mt-1">Start your food journey</Text>
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

          {/* Username */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-gray-100 rounded-xl px-4 py-3 text-base ${
                    errors.username ? 'border border-red-500' : ''
                  }`}
                  placeholder="foodlover123"
                  autoCapitalize="none"
                  autoComplete="username"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.username && (
              <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>
            )}
          </View>

          {/* Display Name */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Display Name</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-gray-100 rounded-xl px-4 py-3 text-base ${
                    errors.displayName ? 'border border-red-500' : ''
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.displayName && (
              <Text className="text-red-500 text-sm mt-1">{errors.displayName.message}</Text>
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
                    autoComplete="password-new"
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
            
            {/* Password Strength */}
            {password.length > 0 && (
              <View className="mt-2 gap-1">
                <PasswordCheck passed={passwordChecks.length} text="At least 8 characters" />
                <PasswordCheck passed={passwordChecks.uppercase} text="One uppercase letter" />
                <PasswordCheck passed={passwordChecks.lowercase} text="One lowercase letter" />
                <PasswordCheck passed={passwordChecks.number} text="One number" />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`bg-primary-500 py-4 rounded-xl mt-4 ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-gray-500 text-center text-sm mt-2">
            By signing up, you agree to our{' '}
            <Text className="text-primary-500">Terms of Service</Text> and{' '}
            <Text className="text-primary-500">Privacy Policy</Text>
          </Text>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="text-primary-500 font-medium">Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordCheck({ passed, text }: { passed: boolean; text: string }) {
  return (
    <View className="flex-row items-center">
      <Ionicons
        name={passed ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={passed ? '#22c55e' : '#9ca3af'}
      />
      <Text className={`ml-2 text-sm ${passed ? 'text-green-600' : 'text-gray-400'}`}>
        {text}
      </Text>
    </View>
  );
}
