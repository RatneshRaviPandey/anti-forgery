import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL } from '../utils/constants';
import { AuthTokens } from '../types';

const KEYCHAIN_SERVICE = 'detoxify-auth';

class ApiService {
  private client: AxiosInstance;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use(this.attachToken);
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError,
    );
  }

  private attachToken = async (config: InternalAxiosRequestConfig) => {
    const tokens = await this.getStoredTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  };

  private handleError = async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await this.refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return this.client(originalRequest);
      } catch {
        await this.clearTokens();
        throw error;
      }
    }
    throw error;
  };

  private async refreshTokens(): Promise<AuthTokens> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const stored = await this.getStoredTokens();
      if (!stored?.refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: stored.refreshToken,
      });

      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      await this.storeTokens(tokens);
      return tokens;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async storeTokens(tokens: AuthTokens): Promise<void> {
    await Keychain.setGenericPassword(
      'tokens',
      JSON.stringify(tokens),
      { service: KEYCHAIN_SERVICE },
    );
  }

  async getStoredTokens(): Promise<AuthTokens | null> {
    const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!credentials) return null;
    return JSON.parse(credentials.password);
  }

  async clearTokens(): Promise<void> {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    await this.storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  }

  async register(email: string, password: string, displayName: string) {
    const { data } = await this.client.post('/auth/register', { email, password, displayName });
    await this.storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async getProfile() {
    const { data } = await this.client.get('/auth/profile');
    return data;
  }

  // Usage endpoints
  async syncUsageData(records: any[]) {
    const { data } = await this.client.post('/usage/sync', { records });
    return data;
  }

  async getUsageSummary(date: string) {
    const { data } = await this.client.get(`/usage/summary?date=${date}`);
    return data;
  }

  async getUsageTrend(period: 'week' | 'month') {
    const { data } = await this.client.get(`/usage/trend?period=${period}`);
    return data;
  }

  // Detox endpoints
  async startDetoxSession(targetMinutes: number, blockedApps: string[]) {
    const { data } = await this.client.post('/detox/sessions', { targetMinutes, blockedApps });
    return data;
  }

  async endDetoxSession(sessionId: string, actualMinutes: number) {
    const { data } = await this.client.patch(`/detox/sessions/${sessionId}`, { actualMinutes });
    return data;
  }

  async getDetoxHistory() {
    const { data } = await this.client.get('/detox/sessions');
    return data;
  }

  async getChallenges() {
    const { data } = await this.client.get('/detox/challenges');
    return data;
  }

  async joinChallenge(challengeId: string) {
    const { data } = await this.client.post(`/detox/challenges/${challengeId}/join`);
    return data;
  }

  // Breathing endpoints
  async getBreathingExercises() {
    const { data } = await this.client.get('/breathing/exercises');
    return data;
  }

  async logBreathingSession(exerciseId: string, durationSeconds: number, cycles: number) {
    const { data } = await this.client.post('/breathing/sessions', { exerciseId, durationSeconds, cyclesCompleted: cycles });
    return data;
  }

  // Meditation endpoints
  async getMeditationSessions(category?: string) {
    const params = category ? `?category=${category}` : '';
    const { data } = await this.client.get(`/meditation/sessions${params}`);
    return data;
  }

  async logMeditationProgress(sessionId: string, durationListened: number, completed: boolean) {
    const { data } = await this.client.post('/meditation/progress', { sessionId, durationListened, completed });
    return data;
  }

  async toggleFavorite(sessionId: string) {
    const { data } = await this.client.post(`/meditation/sessions/${sessionId}/favorite`);
    return data;
  }

  // Gamification endpoints
  async getStreaks() {
    const { data } = await this.client.get('/gamification/streaks');
    return data;
  }

  async getBadges() {
    const { data } = await this.client.get('/gamification/badges');
    return data;
  }

  async getLeaderboard(period: 'week' | 'month') {
    const { data } = await this.client.get(`/gamification/leaderboard?period=${period}`);
    return data;
  }

  // Community endpoints
  async getCommunityFeed() {
    const { data } = await this.client.get('/community/feed');
    return data;
  }

  async addFriend(inviteCode: string) {
    const { data } = await this.client.post('/community/friends', { inviteCode });
    return data;
  }
}

export const api = new ApiService();
