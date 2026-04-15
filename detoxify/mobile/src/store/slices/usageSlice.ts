import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UsageState, DailyUsageSummary, UsageTrend } from '../../types';
import { api } from '../../services/api';
import { getDateString } from '../../utils';

const initialState: UsageState = {
  today: null,
  weeklyTrend: null,
  monthlyTrend: null,
  isTracking: false,
  lastSyncAt: null,
  isLoading: false,
  error: null,
};

export const fetchTodaySummary = createAsyncThunk(
  'usage/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getUsageSummary(getDateString());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch usage');
    }
  },
);

export const fetchWeeklyTrend = createAsyncThunk(
  'usage/fetchWeekly',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getUsageTrend('week');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trend');
    }
  },
);

export const syncUsageData = createAsyncThunk(
  'usage/sync',
  async (records: any[], { rejectWithValue }) => {
    try {
      const data = await api.syncUsageData(records);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sync failed');
    }
  },
);

const usageSlice = createSlice({
  name: 'usage',
  initialState,
  reducers: {
    setTracking(state, action: PayloadAction<boolean>) {
      state.isTracking = action.payload;
    },
    updateTodayLocal(state, action: PayloadAction<DailyUsageSummary>) {
      state.today = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTodaySummary.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTodaySummary.fulfilled, (state, action) => {
      state.isLoading = false;
      state.today = action.payload;
    });
    builder.addCase(fetchTodaySummary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchWeeklyTrend.fulfilled, (state, action) => {
      state.weeklyTrend = action.payload;
    });

    builder.addCase(syncUsageData.fulfilled, (state) => {
      state.lastSyncAt = new Date().toISOString();
    });
  },
});

export const { setTracking, updateTodayLocal } = usageSlice.actions;
export default usageSlice.reducer;
