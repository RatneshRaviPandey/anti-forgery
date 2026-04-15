import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:mm
  streakReminder: boolean;
  challengeUpdates: boolean;
  darkMode: 'system' | 'light' | 'dark';
  hapticFeedback: boolean;
  soundEnabled: boolean;
  trackedApps: string[]; // package names
}

const initialState: SettingsState = {
  dailyGoalMinutes: 120,
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  streakReminder: true,
  challengeUpdates: true,
  darkMode: 'system',
  hapticFeedback: true,
  soundEnabled: true,
  trackedApps: [],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDailyGoal(state, action: PayloadAction<number>) {
      state.dailyGoalMinutes = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setDailyReminderTime(state, action: PayloadAction<string>) {
      state.dailyReminderTime = action.payload;
    },
    setStreakReminder(state, action: PayloadAction<boolean>) {
      state.streakReminder = action.payload;
    },
    setChallengeUpdates(state, action: PayloadAction<boolean>) {
      state.challengeUpdates = action.payload;
    },
    setDarkMode(state, action: PayloadAction<'system' | 'light' | 'dark'>) {
      state.darkMode = action.payload;
    },
    setHapticFeedback(state, action: PayloadAction<boolean>) {
      state.hapticFeedback = action.payload;
    },
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },
    setTrackedApps(state, action: PayloadAction<string[]>) {
      state.trackedApps = action.payload;
    },
    toggleTrackedApp(state, action: PayloadAction<string>) {
      const pkg = action.payload;
      if (state.trackedApps.includes(pkg)) {
        state.trackedApps = state.trackedApps.filter((p) => p !== pkg);
      } else {
        state.trackedApps.push(pkg);
      }
    },
  },
});

export const {
  setDailyGoal,
  setNotificationsEnabled,
  setDailyReminderTime,
  setStreakReminder,
  setChallengeUpdates,
  setDarkMode,
  setHapticFeedback,
  setSoundEnabled,
  setTrackedApps,
  toggleTrackedApp,
} = settingsSlice.actions;
export default settingsSlice.reducer;
