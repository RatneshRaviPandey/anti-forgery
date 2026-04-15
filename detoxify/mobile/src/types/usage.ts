export interface UsageRecord {
  id: string;
  appName: string;
  packageName: string;
  durationSeconds: number;
  date: string; // YYYY-MM-DD
}

export interface DailyUsageSummary {
  date: string;
  totalMinutes: number;
  goalMinutes: number;
  apps: AppUsage[];
  savedMinutes: number; // vs baseline
}

export interface AppUsage {
  appName: string;
  packageName: string;
  iconUrl?: string;
  durationMinutes: number;
  percentOfTotal: number;
  category: AppCategory;
}

export type AppCategory =
  | 'social_media'
  | 'messaging'
  | 'entertainment'
  | 'productivity'
  | 'other';

export interface UsageTrend {
  period: 'week' | 'month';
  data: { date: string; minutes: number }[];
  averageMinutes: number;
  changePercent: number; // vs previous period
}

export interface UsageState {
  today: DailyUsageSummary | null;
  weeklyTrend: UsageTrend | null;
  monthlyTrend: UsageTrend | null;
  isTracking: boolean;
  lastSyncAt: string | null;
  isLoading: boolean;
  error: string | null;
}
