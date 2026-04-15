import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function useStreak() {
  const { streaks } = useSelector((state: RootState) => state.gamification);

  const detoxStreak = streaks.find((s) => s.type === 'daily_detox');
  const meditationStreak = streaks.find((s) => s.type === 'meditation');
  const breathingStreak = streaks.find((s) => s.type === 'breathing');

  return {
    detox: {
      current: detoxStreak?.currentCount || 0,
      longest: detoxStreak?.longestCount || 0,
      lastDate: detoxStreak?.lastActivityDate,
    },
    meditation: {
      current: meditationStreak?.currentCount || 0,
      longest: meditationStreak?.longestCount || 0,
      lastDate: meditationStreak?.lastActivityDate,
    },
    breathing: {
      current: breathingStreak?.currentCount || 0,
      longest: breathingStreak?.longestCount || 0,
      lastDate: breathingStreak?.lastActivityDate,
    },
    totalStreak: (detoxStreak?.currentCount || 0) + (meditationStreak?.currentCount || 0) + (breathingStreak?.currentCount || 0),
  };
}
