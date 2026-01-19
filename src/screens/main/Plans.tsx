import { useGetAllPlans } from '@/hooks/api/plan';
import { TPlan } from '@/types/Plan';
import { Check, ChevronRight, AlertCircle } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

type TPlanCardProps = {
  plan: TPlan;
  onSelect: (plan: TPlan) => void;
  isSelected: boolean;
};

const PlanCard = ({ plan, onSelect, isSelected }: TPlanCardProps) => {
  const features = plan.description
    .split('-')
    .filter((item) => item.trim())
    .map((item) => item.trim());

  return (
    <TouchableOpacity
      onPress={() => onSelect(plan)}
      style={[
        styles.planCard,
        isSelected ? styles.planCardSelected : styles.planCardDefault,
      ]}
    >
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planValidity}>
            Valid until{' '}
            {new Date(plan.validUntil).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.planPricing}>
          <Text style={styles.planAmount}>₹{plan.amount}</Text>
          <Text style={styles.planGst}>+ {plan.gstRate}% GST</Text>
        </View>
      </View>

      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Check size={16} color="#F1BB3E" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export const PlansScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = React.useState<TPlan | null>(null);
  const { data, error, isLoading } = useGetAllPlans();

  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  const handlePlanSelect = (plan: TPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      navigation.navigate('Payment', { plan: selectedPlan });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.innerContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose your plan</Text>
            <Text style={styles.subtitle}>
              Select the perfect plan for your NEET preparation journey
            </Text>
          </View>

          {/* Development Build Notice for Expo Go users */}
          {isExpoGo && (
            <View style={styles.noticeCard}>
              <AlertCircle size={20} color="#F59E0B" />
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Development Build Required</Text>
                <Text style={styles.noticeText}>
                  Payment requires a development build. See RAZORPAY_DEVELOPMENT_BUILD_GUIDE.md for instructions.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.plansContainer}>
            {isLoading ? (
              <View style={styles.centerMessage}>
                <Text style={styles.messageText}>Loading plans...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerMessage}>
                <Text style={styles.errorText}>
                  Failed to load plans. Please try again later.
                </Text>
              </View>
            ) : data?.data?.length === 0 ? (
              <View style={styles.centerMessage}>
                <Text style={styles.messageText}>No plans available at the moment.</Text>
              </View>
            ) : (
              data?.data?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handlePlanSelect}
                  isSelected={selectedPlan?.id === plan.id}
                />
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedPlan}
            style={[
              styles.continueButton,
              selectedPlan ? styles.continueButtonActive : styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    marginVertical: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  plansContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  planCardDefault: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#F1BB3E',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  planValidity: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F1BB3E',
  },
  planGst: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  messageText: {
    fontSize: 18,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  continueButtonActive: {
    backgroundColor: '#F1BB3E',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});

export default PlansScreen;
