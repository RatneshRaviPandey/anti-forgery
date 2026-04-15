import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GamificationState, Streak, Badge, UserBadge, LeaderboardEntry } from '../../types';
import { api } from '../../services/api';
import { calculateLevel } from '../../utils';

const initialState: GamificationState = {
  streaks: [],
  badges: [],
  userBadges: [],
  xp: 0,
  level: 1,
  xpToNextLevel: 100,
  leaderboard: [],
  isLoading: false,
  error: null,
};

export const fetchStreaks = createAsyncThunk(
  'gamification/fetchStreaks',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getStreaks();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load streaks');
    }
  },
);

export const fetchBadges = createAsyncThunk(
  'gamification/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getBadges();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load badges');
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (period: 'week' | 'month', { rejectWithValue }) => {
    try {
      return await api.getLeaderboard(period);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load leaderboard');
    }
  },
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addXp(state, action: PayloadAction<number>) {
      state.xp += action.payload;
      const { level, xpToNext } = calculateLevel(state.xp);
      state.level = level;
      state.xpToNextLevel = xpToNext;
    },
    awardBadge(state, action: PayloadAction<UserBadge>) {
      state.userBadges.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStreaks.fulfilled, (state, action) => {
      state.streaks = action.payload.streaks || [];
      state.xp = action.payload.xp || 0;
      const { level, xpToNext } = calculateLevel(state.xp);
      state.level = level;
      state.xpToNextLevel = xpToNext;
    });

    builder.addCase(fetchBadges.fulfilled, (state, action) => {
      state.badges = action.payload.allBadges || [];
      state.userBadges = action.payload.userBadges || [];
    });

    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboard = action.payload.entries || [];
    });
  },
});

export const { addXp, awardBadge } = gamificationSlice.actions;
export default gamificationSlice.reducer;
