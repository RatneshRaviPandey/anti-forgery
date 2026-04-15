import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '../store';
import { RootNavigator } from './navigation/RootNavigator';
import { loadProfile } from '../store/slices/authSlice';
import { api } from '../services/api';

function AppContent() {
  useEffect(() => {
    // Try to restore session on app launch
    async function restoreSession() {
      const tokens = await api.getStoredTokens();
      if (tokens) {
        store.dispatch(loadProfile());
      }
    }
    restoreSession();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
