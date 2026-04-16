import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api_client.dart';
import '../../models/user.dart';

final apiProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;
  static const _cachedUserKey = 'cached_user';

  AuthNotifier(this._api) : super(const AuthState()) {
    _tryRestoreSession();
  }

  Future<void> _tryRestoreSession() async {
    state = state.copyWith(isLoading: true);

    // Step 1: Instantly restore from local cache (no network needed)
    final cachedUser = await _loadCachedUser();
    final hasTokens = await _api.hasTokens();

    if (hasTokens && cachedUser != null) {
      // Fast path: user sees dashboard immediately
      state = AuthState(user: cachedUser, isAuthenticated: true);
      // Refresh from server in background (non-blocking)
      _refreshProfileInBackground();
      return;
    }

    if (hasTokens) {
      // Tokens exist but no cached user — must hit server
      try {
        final data = await _api.getProfile();
        final user = User.fromJson(data['user']);
        await _cacheUser(user);
        state = AuthState(user: user, isAuthenticated: true);
        return;
      } on DioException catch (e) {
        if (e.response?.statusCode == 401) {
          // Token genuinely expired — clear
          await _api.clearTokens();
          await _clearCachedUser();
        }
        // Network error — DON'T clear tokens, keep for next attempt
      } catch (_) {}
    }

    state = const AuthState();
  }

  /// Refresh profile from server without blocking UI
  Future<void> _refreshProfileInBackground() async {
    try {
      final data = await _api.getProfile();
      final user = User.fromJson(data['user']);
      await _cacheUser(user);
      if (mounted) state = state.copyWith(user: user);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Token truly invalid after refresh attempt — force re-login
        await _api.clearTokens();
        await _clearCachedUser();
        if (mounted) state = const AuthState();
      }
      // Network error — keep using cached data silently
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.login(email, password);
      final user = User.fromJson(data['user']);
      await _cacheUser(user);
      state = AuthState(user: user, isAuthenticated: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
    }
  }

  Future<void> register(String email, String password, String displayName) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.register(email, password, displayName);
      final user = User.fromJson(data['user']);
      await _cacheUser(user);
      state = AuthState(user: user, isAuthenticated: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
    }
  }

  Future<void> logout() async {
    await _api.logout();
    await _clearCachedUser();
    state = const AuthState();
  }

  void markOnboarded() {
    if (state.user != null) {
      final updated = state.user!.copyWith(onboarded: true);
      _cacheUser(updated);
      state = state.copyWith(user: updated);
    }
  }

  void clearError() => state = state.copyWith(error: null);

  // ─── Local user cache ───

  Future<void> _cacheUser(User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cachedUserKey, json.encode({
        'id': user.id, 'email': user.email, 'displayName': user.displayName,
        'avatarUrl': user.avatarUrl, 'tier': user.tier,
        'dailyGoalMinutes': user.dailyGoalMinutes, 'timezone': user.timezone,
        'onboarded': user.onboarded, 'xp': user.xp,
        'inviteCode': user.inviteCode, 'createdAt': user.createdAt,
      }));
    } catch (_) {}
  }

  Future<User?> _loadCachedUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final j = prefs.getString(_cachedUserKey);
      if (j == null) return null;
      return User.fromJson(json.decode(j) as Map<String, dynamic>);
    } catch (_) { return null; }
  }

  Future<void> _clearCachedUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cachedUserKey);
    } catch (_) {}
  }

  String _extractError(dynamic e) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map && data.containsKey('message')) {
        return data['message'] as String;
      }
      switch (e.response?.statusCode) {
        case 401: return 'Invalid email or password';
        case 409: return 'Email already registered';
        case 400: return 'Please check your input';
        case 429: return 'Too many attempts. Try again later';
        case null: return 'Cannot connect to server. Check your network';
        default: return 'Server error (${e.response?.statusCode})';
      }
    }
    if (e is Exception) return e.toString().replaceAll('Exception: ', '');
    return 'Something went wrong';
  }
}
