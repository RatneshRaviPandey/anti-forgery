import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    // TODO: Integrate with API
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              Check your email for a password reset link.
            </Text>
          </View>
        ) : (
          <>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Send Reset Link"
              onPress={handleReset}
              disabled={!email.trim()}
              fullWidth
            />
          </>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { flex: 1, paddingHorizontal: spacing['2xl'], paddingTop: spacing['5xl'] },
  title: { ...typography.h1, color: colors.neutral[900], marginBottom: spacing.md },
  subtitle: { ...typography.body, color: colors.neutral[500], marginBottom: spacing['3xl'] },
  successBanner: {
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  successText: { ...typography.body, color: colors.secondary[700], textAlign: 'center' },
  backButton: { alignSelf: 'center', marginTop: spacing['3xl'], padding: spacing.sm },
  backText: { ...typography.label, color: colors.primary[600] },
});
