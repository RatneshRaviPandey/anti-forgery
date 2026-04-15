import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

const TIERS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: colors.neutral[500],
    features: [
      'Basic screen time tracking',
      '7-day analytics history',
      '2 breathing exercises',
      '3 meditation sessions',
      '1 active challenge',
      'Ad-supported',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$6.99',
    period: '/month',
    yearlyPrice: '$49.99/year (save 40%)',
    color: colors.primary[500],
    features: [
      'Everything in Free',
      'Ad-free experience',
      'Unlimited analytics history',
      'All 5 breathing exercises',
      '20 meditation sessions',
      'Unlimited active challenges',
      'Advanced usage analytics',
      'Sync 2 devices',
    ],
    cta: 'Start 7-Day Free Trial',
    recommended: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '$14.99',
    period: '/month',
    yearlyPrice: '$99.99/year (save 44%)',
    color: colors.accent[500],
    features: [
      'Everything in Pro',
      'Full meditation library (100+)',
      'Custom breathing patterns',
      'PDF export reports',
      'Family plan (5 accounts)',
      'Priority support',
      'Unlimited devices',
      'New content monthly',
    ],
    cta: 'Upgrade to Premium',
  },
];

export function PaywallScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>Choose the plan that fits your journey</Text>
        </View>

        {/* Tier Cards */}
        {TIERS.map((tier) => (
          <Card
            key={tier.key}
            style={[
              styles.tierCard,
              tier.recommended && styles.recommendedCard,
            ]}
            variant={tier.recommended ? 'elevated' : 'outlined'}
          >
            {tier.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.tierHeader}>
              <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.tierPrice}>{tier.price}</Text>
                <Text style={styles.tierPeriod}>{tier.period}</Text>
              </View>
              {tier.yearlyPrice && (
                <Text style={styles.yearlyPrice}>{tier.yearlyPrice}</Text>
              )}
            </View>

            <View style={styles.featureList}>
              {tier.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <Button
              title={tier.cta}
              onPress={() => {
                // TODO: Integrate with RevenueCat
                navigation.goBack();
              }}
              variant={tier.recommended ? 'primary' : 'outline'}
              disabled={tier.disabled}
              fullWidth
            />
          </Card>
        ))}

        <Text style={styles.legalText}>
          Subscriptions auto-renew unless cancelled 24 hours before the end of the current period.
          Manage subscriptions in your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing['2xl'] },
  closeBtn: { alignSelf: 'flex-end', padding: spacing.md },
  closeText: { fontSize: 20, color: colors.neutral[500] },
  title: { ...typography.h1, color: colors.neutral[900], textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.neutral[500], marginTop: spacing.sm, textAlign: 'center' },
  tierCard: { marginBottom: spacing.lg, position: 'relative' },
  recommendedCard: { borderWidth: 2, borderColor: colors.primary[400] },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
  recommendedText: { ...typography.caption, color: '#FFF', fontWeight: '700', letterSpacing: 1 },
  tierHeader: { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.sm },
  tierName: { ...typography.h3, marginBottom: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  tierPrice: { ...typography.h1, color: colors.neutral[900] },
  tierPeriod: { ...typography.body, color: colors.neutral[500], marginLeft: 4 },
  yearlyPrice: { ...typography.bodySmall, color: colors.secondary[600], marginTop: spacing.xs },
  featureList: { marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', paddingVertical: spacing.xs },
  featureCheck: { color: colors.secondary[500], fontWeight: '700', marginRight: spacing.md, width: 16 },
  featureText: { ...typography.body, color: colors.neutral[700], flex: 1 },
  legalText: { ...typography.caption, color: colors.neutral[400], textAlign: 'center', marginTop: spacing.md },
});
