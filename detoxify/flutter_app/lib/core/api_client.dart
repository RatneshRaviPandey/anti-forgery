import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  // Your laptop's WiFi IP — phone connects here over same WiFi
  // Emulator uses 10.0.2.2 to reach host machine
  static const _lanIp = '192.168.0.107';
  static const _port = '4000';

  static String get _baseUrl {
    if (kIsWeb) return 'http://localhost:$_port/api';
    // On real Android device, use WiFi IP; emulator uses 10.0.2.2
    // ADB reverse also makes 10.0.2.2 work on emulator
    return 'http://$_lanIp:$_port/api';
  }

  static const _keyAccess = 'access_token';
  static const _keyRefresh = 'refresh_token';

  late final Dio _dio;
  final FlutterSecureStorage _storage;

  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage() {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: _keyAccess);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 && !error.requestOptions.extra.containsKey('_retry')) {
          try {
            final newTokens = await _refreshTokens();
            if (newTokens != null) {
              error.requestOptions.extra['_retry'] = true;
              error.requestOptions.headers['Authorization'] = 'Bearer ${newTokens['accessToken']}';
              final response = await _dio.fetch(error.requestOptions);
              return handler.resolve(response);
            }
          } catch (_) {}
        }
        handler.next(error);
      },
    ));
  }

  Future<Map<String, dynamic>?> _refreshTokens() async {
    final refreshToken = await _storage.read(key: _keyRefresh);
    if (refreshToken == null) return null;

    final response = await Dio(BaseOptions(baseUrl: _baseUrl))
        .post('/auth/refresh', data: {'refreshToken': refreshToken});

    final data = response.data as Map<String, dynamic>;
    await storeTokens(data['accessToken'], data['refreshToken']);
    return data;
  }

  Future<void> storeTokens(String access, String refresh) async {
    await _storage.write(key: _keyAccess, value: access);
    await _storage.write(key: _keyRefresh, value: refresh);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: _keyAccess);
    await _storage.delete(key: _keyRefresh);
  }

  Future<bool> hasTokens() async {
    final t = await _storage.read(key: _keyAccess);
    return t != null;
  }

  // ─── Auth ───
  Future<Map<String, dynamic>> register(String email, String password, String displayName) async {
    final r = await _dio.post('/auth/register', data: {
      'email': email, 'password': password, 'displayName': displayName,
    });
    final data = r.data as Map<String, dynamic>;
    await storeTokens(data['accessToken'], data['refreshToken']);
    return data;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final r = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    final data = r.data as Map<String, dynamic>;
    await storeTokens(data['accessToken'], data['refreshToken']);
    return data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final r = await _dio.get('/auth/profile');
    return r.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    try { await _dio.post('/auth/logout'); } catch (_) {}
    await clearTokens();
  }

  // ─── Usage ───
  Future<Map<String, dynamic>> syncUsage(List<Map<String, dynamic>> records) async {
    final r = await _dio.post('/usage/sync', data: {'records': records});
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getUsageSummary(String date) async {
    final r = await _dio.get('/usage/summary', queryParameters: {'date': date});
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getUsageTrend(String period) async {
    final r = await _dio.get('/usage/trend', queryParameters: {'period': period});
    return r.data as Map<String, dynamic>;
  }

  // ─── Detox ───
  Future<Map<String, dynamic>> startDetoxSession(int targetMinutes, List<String> blockedApps) async {
    final r = await _dio.post('/detox/sessions', data: {
      'targetMinutes': targetMinutes, 'blockedApps': blockedApps,
    });
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> endDetoxSession(String id, int actualMinutes) async {
    final r = await _dio.patch('/detox/sessions/$id', data: {'actualMinutes': actualMinutes});
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getChallenges() async {
    final r = await _dio.get('/detox/challenges');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinChallenge(String id) async {
    final r = await _dio.post('/detox/challenges/$id/join');
    return r.data as Map<String, dynamic>;
  }

  // ─── Breathing ───
  Future<Map<String, dynamic>> logBreathingSession(String exerciseId, int duration, int cycles) async {
    final r = await _dio.post('/breathing/sessions', data: {
      'exerciseId': exerciseId, 'durationSeconds': duration, 'cyclesCompleted': cycles,
    });
    return r.data as Map<String, dynamic>;
  }

  // ─── Meditation ───
  Future<Map<String, dynamic>> getMeditations({String? category}) async {
    final r = await _dio.get('/meditation/sessions',
        queryParameters: category != null ? {'category': category} : null);
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> logMeditationProgress(String sessionId, int duration, bool completed) async {
    final r = await _dio.post('/meditation/progress', data: {
      'sessionId': sessionId, 'durationListened': duration, 'completed': completed,
    });
    return r.data as Map<String, dynamic>;
  }

  // ─── Gamification ───
  Future<Map<String, dynamic>> getStreaks() async {
    final r = await _dio.get('/gamification/streaks');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getLeaderboard(String period) async {
    final r = await _dio.get('/gamification/leaderboard', queryParameters: {'period': period});
    return r.data as Map<String, dynamic>;
  }

  // ─── Community ───
  Future<Map<String, dynamic>> getCommunityFeed() async {
    final r = await _dio.get('/community/feed');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addFriend(String inviteCode) async {
    final r = await _dio.post('/community/friends', data: {'inviteCode': inviteCode});
    return r.data as Map<String, dynamic>;
  }
}
