import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DetoxState, DetoxSession, DetoxChallenge, BlockRule } from '../../types';
import { api } from '../../services/api';

const initialState: DetoxState = {
  activeSession: null,
  sessionHistory: [],
  blockRules: [],
  challenges: [],
  userChallenges: [],
  isLoading: false,
  error: null,
};

export const startSession = createAsyncThunk(
  'detox/startSession',
  async (
    { targetMinutes, blockedApps }: { targetMinutes: number; blockedApps: string[] },
    { rejectWithValue },
  ) => {
    try {
      return await api.startDetoxSession(targetMinutes, blockedApps);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start session');
    }
  },
);

export const endSession = createAsyncThunk(
  'detox/endSession',
  async (
    { sessionId, actualMinutes }: { sessionId: string; actualMinutes: number },
    { rejectWithValue },
  ) => {
    try {
      return await api.endDetoxSession(sessionId, actualMinutes);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end session');
    }
  },
);

export const fetchChallenges = createAsyncThunk(
  'detox/fetchChallenges',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getChallenges();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load challenges');
    }
  },
);

export const joinChallenge = createAsyncThunk(
  'detox/joinChallenge',
  async (challengeId: string, { rejectWithValue }) => {
    try {
      return await api.joinChallenge(challengeId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join challenge');
    }
  },
);

const detoxSlice = createSlice({
  name: 'detox',
  initialState,
  reducers: {
    updateActiveSession(state, action: PayloadAction<Partial<DetoxSession>>) {
      if (state.activeSession) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },
    setBlockRules(state, action: PayloadAction<BlockRule[]>) {
      state.blockRules = action.payload;
    },
    addBlockRule(state, action: PayloadAction<BlockRule>) {
      state.blockRules.push(action.payload);
    },
    removeBlockRule(state, action: PayloadAction<string>) {
      state.blockRules = state.blockRules.filter((r) => r.id !== action.payload);
    },
    toggleBlockRule(state, action: PayloadAction<string>) {
      const rule = state.blockRules.find((r) => r.id === action.payload);
      if (rule) rule.enabled = !rule.enabled;
    },
    cancelSession(state) {
      if (state.activeSession) {
        state.activeSession.status = 'cancelled';
        state.sessionHistory.unshift(state.activeSession);
        state.activeSession = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(startSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeSession = action.payload;
    });
    builder.addCase(startSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(endSession.fulfilled, (state, action) => {
      state.activeSession = null;
      state.sessionHistory.unshift(action.payload);
    });

    builder.addCase(fetchChallenges.fulfilled, (state, action) => {
      state.challenges = action.payload.challenges || [];
      state.userChallenges = action.payload.userChallenges || [];
    });

    builder.addCase(joinChallenge.fulfilled, (state, action) => {
      state.userChallenges.push(action.payload);
    });
  },
});

export const {
  updateActiveSession,
  setBlockRules,
  addBlockRule,
  removeBlockRule,
  toggleBlockRule,
  cancelSession,
} = detoxSlice.actions;
export default detoxSlice.reducer;
