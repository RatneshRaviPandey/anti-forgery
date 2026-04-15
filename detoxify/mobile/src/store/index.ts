import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usageReducer from './slices/usageSlice';
import detoxReducer from './slices/detoxSlice';
import breatheReducer from './slices/breatheSlice';
import meditationReducer from './slices/meditationSlice';
import gamificationReducer from './slices/gamificationSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    usage: usageReducer,
    detox: detoxReducer,
    breathe: breatheReducer,
    meditation: meditationReducer,
    gamification: gamificationReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
