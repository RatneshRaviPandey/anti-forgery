import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../models/user.dart';

final apiProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;

  AuthNotifier(this._api) : super(const AuthState()) {
    _tryRestoreSession();
  }

  Future<void> _tryRestoreSession() async {
    state = state.copyWith(isLoading: true);
    try {
      if (await _api.hasTokens()) {
        final data = await _api.getProfile();
        state = AuthState(
          user: User.fromJson(data['user']),
          isAuthenticated: true,
        );
      } else {
        state = const AuthState();
      }
    } catch (_) {
      // Stale/invalid tokens — clear them so login screen shows cleanly
      await _api.clearTokens();
      state = const AuthState();
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.login(email, password);
      state = AuthState(
        user: User.fromJson(data['user']),
        isAuthenticated: true,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
    }
  }

  Future<void> register(String email, String password, String displayName) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.register(email, password, displayName);
      state = AuthState(
        user: User.fromJson(data['user']),
        isAuthenticated: true,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
    }
  }

  Future<void> logout() async {
    await _api.logout();
    state = const AuthState();
  }

  void markOnboarded() {
    if (state.user != null) {
      state = state.copyWith(user: state.user!.copyWith(onboarded: true));
    }
  }

  void clearError() => state = state.copyWith(error: null);

  String _extractError(dynamic e) {
    if (e is DioException) {
      // Try to get server error message
      final data = e.response?.data;
      if (data is Map && data.containsKey('message')) {
        return data['message'] as String;
      }
      // Fallback to status-based messages
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
