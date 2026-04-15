import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { spacing } from '../../theme';

// NOTE: This is a placeholder. In production, use:
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


const AD_UNIT_BANNER = Platform.select({
  ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
  android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
}) || '';

interface AdBannerProps {
  placement?: 'dashboard' | 'breathe' | 'detox';
}

export function AdBanner({ placement = 'dashboard' }: AdBannerProps) {
  const { showAds } = useSubscription();

  if (!showAds) return null;

  // Placeholder for actual AdMob banner
  // In production, replace with:
  // <BannerAd unitId={__DEV__ ? TestIds.BANNER : AD_UNIT_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />

  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        {/* AdMob banner will render here */}
      </View>
    </View>
  );
}

// Interstitial ad helper
// In production, use InterstitialAd from react-native-google-mobile-ads
export async function showInterstitialAd(): Promise<boolean> {
  // Placeholder — return true if ad was shown
  // Real implementation would load and show interstitial
  return false;
}

// Rewarded video helper
export async function showRewardedAd(): Promise<boolean> {
  // Placeholder — return true if user completed reward
  // Real implementation would load and show rewarded video
  return false;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  placeholder: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
  },
});
