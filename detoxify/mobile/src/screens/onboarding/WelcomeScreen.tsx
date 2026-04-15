import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

export function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🧘</Text>
          <Text style={styles.title}>Welcome to{'\n'}Detoxify</Text>
          <Text style={styles.subtitle}>
            Take back control of your screen time.{'\n'}
            Build healthier digital habits.{'\n'}
            Find your calm.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem emoji="⏱️" text="Track & reduce screen time" />
          <FeatureItem emoji="🌬️" text="Guided breathing exercises" />
          <FeatureItem emoji="🧘‍♀️" text="Meditation sessions for focus & sleep" />
          <FeatureItem emoji="🏆" text="Earn streaks, badges & rewards" />
        </View>

        <View style={styles.cta}>
          <Button
            title="Let's Get Started"
            onPress={() => navigation.navigate('SelectApps')}
            fullWidth
            size="lg"
          />
          <Text style={styles.privacy}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 72, marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.primary[700], textAlign: 'center', fontSize: 36, lineHeight: 44 },
  subtitle: { ...typography.bodyLarge, color: colors.neutral[500], textAlign: 'center', marginTop: spacing.lg, lineHeight: 24 },
  features: { paddingBottom: spacing['3xl'] },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  featureEmoji: { fontSize: 24, width: 40 },
  featureText: { ...typography.body, color: colors.neutral[700], flex: 1 },
  cta: { paddingBottom: spacing['3xl'] },
  privacy: { ...typography.caption, color: colors.neutral[400], textAlign: 'center', marginTop: spacing.lg },
});
