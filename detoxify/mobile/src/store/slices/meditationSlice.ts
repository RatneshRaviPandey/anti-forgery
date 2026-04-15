import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MeditationState, MeditationSession } from '../../types';
import { api } from '../../services/api';

const initialState: MeditationState = {
  categories: ['sleep', 'focus', 'anxiety', 'stress', 'morning', 'digital_detox'],
  sessions: [],
  currentSession: null,
  progress: [],
  favorites: [],
  isPlaying: false,
  isLoading: false,
  error: null,
};

export const fetchMeditations = createAsyncThunk(
  'meditation/fetchSessions',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      return await api.getMeditationSessions(category);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load meditations');
    }
  },
);

export const logMeditationProgress = createAsyncThunk(
  'meditation/logProgress',
  async (
    { sessionId, durationListened, completed }: { sessionId: string; durationListened: number; completed: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await api.logMeditationProgress(sessionId, durationListened, completed);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log progress');
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'meditation/toggleFavorite',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await api.toggleFavorite(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  },
);

const meditationSlice = createSlice({
  name: 'meditation',
  initialState,
  reducers: {
    setCurrentSession(state, action: PayloadAction<MeditationSession | null>) {
      state.currentSession = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMeditations.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMeditations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions = action.payload.sessions || [];
    });
    builder.addCase(fetchMeditations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(logMeditationProgress.fulfilled, (state, action) => {
      state.progress.unshift(action.payload);
    });

    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const sessionId = action.payload;
      if (state.favorites.includes(sessionId)) {
        state.favorites = state.favorites.filter((id) => id !== sessionId);
      } else {
        state.favorites.push(sessionId);
      }
    });
  },
});

export const { setCurrentSession, setIsPlaying } = meditationSlice.actions;
export default meditationSlice.reducer;
