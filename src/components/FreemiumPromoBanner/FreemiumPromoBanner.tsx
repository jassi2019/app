import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FreemiumPromoBannerProps {
  userName: string;
  onExplorePress: () => void;
}

const BANNER_DISMISSED_KEY = '@freemium_promo_banner_dismissed';

export const FreemiumPromoBanner = ({ userName, onExplorePress }: FreemiumPromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkBannerStatus();
  }, []);

  const checkBannerStatus = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(BANNER_DISMISSED_KEY);
      setIsVisible(dismissed !== 'true');
    } catch (error) {
      console.error('Error checking banner status:', error);
      setIsVisible(true);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(BANNER_DISMISSED_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <View className="mx-4 mb-6">
      <View className="bg-gradient-to-br from-[#F1BB3E]/20 to-[#F1BB3E]/5 rounded-3xl p-5 border-2 border-[#F1BB3E]/30 relative overflow-hidden">
        {/* Background decoration */}
        <View className="absolute top-0 right-0 w-32 h-32 bg-[#F1BB3E]/10 rounded-full -mr-16 -mt-16" />
        <View className="absolute bottom-0 left-0 w-24 h-24 bg-[#F1BB3E]/10 rounded-full -ml-12 -mb-12" />

        {/* Close button */}
        <TouchableOpacity
          onPress={handleDismiss}
          className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="#666" />
        </TouchableOpacity>

        {/* Content */}
        <View className="relative z-10">
          {/* Main message */}
          <View className="flex-row items-center mb-3">
            <Sparkles size={20} color="#F1BB3E" />
            <Text className="text-xl font-bold text-[#1e1e1e] ml-2 flex-1">
              Great news — Freemium access is now available!
            </Text>
          </View>

          {/* Features list */}
          <View className="bg-white/90 rounded-2xl p-4 mb-3">
            <Text className="text-base font-semibold text-[#1e1e1e] mb-3">
              Start your NEET preparation with:
            </Text>
            <View className="space-y-2">
              <FeatureItem text="Personalized study material" />
              <FeatureItem text="Revision Recall Station to strengthen your memory" />
              <FeatureItem text="Free Botany topics like 'Hybrid DNA seen after the first replication generation'" />
            </View>
          </View>

          {/* CTA Badge */}
          <View className="bg-[#588157] rounded-2xl px-4 py-2.5 mb-3">
            <Text className="text-white text-center font-medium text-sm">
              Dive in now and enjoy many Free Topics specially curated for you! 🎉
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity
            onPress={onExplorePress}
            className="bg-[#F1BB3E] rounded-2xl py-3.5 px-6 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base mr-2">Explore Free Topics</Text>
            <Text className="text-white text-lg">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Feature item component
const FeatureItem = ({ text }: { text: string }) => (
  <View className="flex-row items-start">
    <View className="bg-[#588157] rounded-full w-1.5 h-1.5 mt-2 mr-2.5" />
    <Text className="text-[#1e1e1e] text-sm flex-1 leading-5">{text}</Text>
  </View>
);

export default FreemiumPromoBanner;
