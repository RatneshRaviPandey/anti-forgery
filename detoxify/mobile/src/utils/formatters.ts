import { SubscriptionTier } from '../types';
import { TIER_FEATURES } from './constants';

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof (typeof TIER_FEATURES)['free'],
): boolean {
  const tierConfig = TIER_FEATURES[tier];
  const value = tierConfig[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value === 'all';
  return false;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateLevel(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  let level = 1;
  let requiredXp = 100;
  let totalRequired = 0;

  while (xp >= totalRequired + requiredXp) {
    totalRequired += requiredXp;
    level++;
    requiredXp = Math.floor(100 * Math.pow(1.2, level - 1));
  }

  return {
    level,
    xpInLevel: xp - totalRequired,
    xpToNext: requiredXp,
  };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getMotivationalQuote(): string {
  const quotes = [
    "Every moment offline is a moment invested in yourself.",
    "Your mind deserves a break from the scroll.",
    "Real connections happen when you look up from the screen.",
    "Progress, not perfection. You're doing great.",
    "The best things in life aren't on a screen.",
    "Be present. The world is beautiful right here.",
    "Your attention is your most valuable resource.",
    "Small steps lead to big changes.",
    "You're stronger than the urge to scroll.",
    "This moment of stillness is a gift to yourself.",
    "Breathe in calm, breathe out stress.",
    "Your peace of mind is worth more than any notification.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
