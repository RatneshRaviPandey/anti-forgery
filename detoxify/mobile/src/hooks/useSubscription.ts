import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { TIER_FEATURES } from '../utils/constants';
import { SubscriptionTier } from '../types';

export function useSubscription() {
  const { user } = useSelector((state: RootState) => state.auth);
  const tier: SubscriptionTier = user?.tier || 'free';
  const features = TIER_FEATURES[tier];

  const isPro = tier === 'pro' || tier === 'premium';
  const isPremium = tier === 'premium';
  const isFree = tier === 'free';

  function canAccess(requiredTier: SubscriptionTier): boolean {
    const tierLevel = { free: 0, pro: 1, premium: 2 };
    return tierLevel[tier] >= tierLevel[requiredTier];
  }

  return {
    tier,
    features,
    isPro,
    isPremium,
    isFree,
    canAccess,
    showAds: features.hasAds,
  };
}
