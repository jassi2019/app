import { useSendLogReport } from '@/hooks/api/log';
import { initiateRazorpayPayment, useCreateOrder } from '@/hooks/api/payment';
import { useCreateSubscription } from '@/hooks/api/subscription';
import { TPlan } from '@/types/Plan';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentScreenProps = {
  navigation: any;
  route: {
    params: {
      plan: TPlan;
    };
  };
};

export const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
  const { plan } = route.params;
  const { mutateAsync: createOrderAsync, isPending: isCreatingOrder } = useCreateOrder();
  const { mutate: createSubscription, isPending: isCreatingSubscription } =
    useCreateSubscription();
  const sendLogReport = useSendLogReport();

  const handlePayment = async () => {
    try {
      // Create order
      const order = await createOrderAsync(plan.id);

      if (!order || !order.data) {
        throw new Error('Order creation failed. Please try again.');
      }

      // Initiate Razorpay payment
      const paymentResult = await initiateRazorpayPayment({
        order: order.data,
        plan,
      });

      if (!paymentResult) {
        throw new Error('Payment was cancelled or failed.');
      }

      // Create subscription
      createSubscription(
        {
          ...paymentResult,
          planId: plan.id,
        },
        {
          onSuccess: () => {
            navigation.navigate('SubscriptionMessage', {
              success: true,
              plan,
            });
          },
          onError: (error: any) => {
            console.error('Subscription creation error:', error);
            Alert.alert(
              'Subscription Error',
              error?.message || 'Failed to create subscription. Please contact support.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('SubscriptionMessage', {
                      success: false,
                      plan,
                    });
                  },
                },
              ]
            );
          },
        }
      );
    } catch (error: any) {
      console.error('Payment error:', error);

      // Send log report
      try {
        await sendLogReport.mutateAsync({
          error: error.message || 'Payment failed',
        });
      } catch (logError) {
        console.error('Failed to send log report:', logError);
      }

      // Check if it's a Razorpay unavailability error
      if (error?.message?.includes('Razorpay is not available')) {
        Alert.alert(
          '⚠️ Development Build Required',
          'Razorpay payment requires a development build.\n\n' +
          '📱 You are currently using Expo Go, which does not support Razorpay.\n\n' +
          '✅ To enable payments:\n' +
          '1. Run: eas build --profile development --platform android\n' +
          '2. Install the APK on your device\n' +
          '3. Run: npx expo start --dev-client\n\n' +
          '📖 See RAZORPAY_DEVELOPMENT_BUILD_GUIDE.md for detailed instructions.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // Show generic error alert for other errors
        Alert.alert(
          'Payment Error',
          error?.message || 'Payment failed. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Stay on payment screen
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={styles.summaryValue}>{plan.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>
              Valid until{' '}
              {new Date(plan.validUntil).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>₹{Math.round(plan.amount)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST ({plan.gstRate}%)</Text>
            <Text style={styles.summaryValue}>
              ₹{Math.round((plan.amount * plan.gstRate) / 100)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{Math.round(plan.amount + (plan.amount * plan.gstRate) / 100)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handlePayment}
          disabled={isCreatingOrder || isCreatingSubscription}
          style={[
            styles.payButton,
            (isCreatingOrder || isCreatingSubscription) && styles.payButtonDisabled,
          ]}
        >
          {isCreatingOrder || isCreatingSubscription ? (
            <View style={styles.payButtonContent}>
              <ActivityIndicator color="white" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1BB3E',
  },
  payButton: {
    backgroundColor: '#F1BB3E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
