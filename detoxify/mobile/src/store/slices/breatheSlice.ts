import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BreathingState, BreathingExercise, BreathingPhase, BreathingSession } from '../../types';
import { api } from '../../services/api';
import { BREATHING_EXERCISES } from '../../utils/constants';

const initialState: BreathingState = {
  exercises: Object.values(BREATHING_EXERCISES),
  activeExercise: null,
  currentPhase: null,
  currentStep: 0,
  isActive: false,
  history: [],
  isLoading: false,
  error: null,
};

export const logBreathingSession = createAsyncThunk(
  'breathe/logSession',
  async (
    { exerciseId, durationSeconds, cycles }: { exerciseId: string; durationSeconds: number; cycles: number },
    { rejectWithValue },
  ) => {
    try {
      return await api.logBreathingSession(exerciseId, durationSeconds, cycles);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log session');
    }
  },
);

const breatheSlice = createSlice({
  name: 'breathe',
  initialState,
  reducers: {
    startExercise(state, action: PayloadAction<BreathingExercise>) {
      state.activeExercise = action.payload;
      state.isActive = true;
      state.currentStep = 0;
      state.currentPhase = action.payload.steps[0].phase;
    },
    nextStep(state) {
      if (!state.activeExercise) return;
      const nextIdx = state.currentStep + 1;
      if (nextIdx < state.activeExercise.steps.length) {
        state.currentStep = nextIdx;
        state.currentPhase = state.activeExercise.steps[nextIdx].phase;
      } else {
        // Cycle back to first step
        state.currentStep = 0;
        state.currentPhase = state.activeExercise.steps[0].phase;
      }
    },
    stopExercise(state) {
      state.activeExercise = null;
      state.isActive = false;
      state.currentStep = 0;
      state.currentPhase = null;
    },
    setPhase(state, action: PayloadAction<BreathingPhase>) {
      state.currentPhase = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logBreathingSession.fulfilled, (state, action) => {
      state.history.unshift(action.payload);
    });
  },
});

export const { startExercise, nextStep, stopExercise, setPhase } = breatheSlice.actions;
export default breatheSlice.reducer;
