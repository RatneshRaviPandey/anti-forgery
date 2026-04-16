import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/platform_channels.dart';
import '../settings/tracked_apps_provider.dart';
import '../../core/utils.dart';

class AppUsageLocal {
  final String appName;
  final String packageName;
  final int durationSeconds; // Raw OS value
  final int offsetSeconds;   // Subtracted on reset

  const AppUsageLocal({
    required this.appName,
    required this.packageName,
    required this.durationSeconds,
    this.offsetSeconds = 0,
  });

  /// Effective seconds after reset offset applied
  int get effectiveSeconds => (durationSeconds - offsetSeconds).clamp(0, 999999);

  /// Floor division — consistent with total calculation
  int get effectiveMinutes => effectiveSeconds ~/ 60;
}

class UsageTrackingState {
  final bool isTracking;
  final bool hasPermission;
  final List<AppUsageLocal> todayUsage;
  final int totalMinutes;
  final int totalSeconds;
  final DateTime? lastUpdated;
  final bool isLoading;
  final String? todayDate;

  const UsageTrackingState({
    this.isTracking = false,
    this.hasPermission = false,
    this.todayUsage = const [],
    this.totalMinutes = 0,
    this.totalSeconds = 0,
    this.lastUpdated,
    this.isLoading = true,
    this.todayDate,
  });

  UsageTrackingState copyWith({
    bool? isTracking,
    bool? hasPermission,
    List<AppUsageLocal>? todayUsage,
    int? totalMinutes,
    int? totalSeconds,
    DateTime? lastUpdated,
    bool? isLoading,
    String? todayDate,
  }) {
    return UsageTrackingState(
      isTracking: isTracking ?? this.isTracking,
      hasPermission: hasPermission ?? this.hasPermission,
      todayUsage: todayUsage ?? this.todayUsage,
      totalMinutes: totalMinutes ?? this.totalMinutes,
      totalSeconds: totalSeconds ?? this.totalSeconds,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isLoading: isLoading ?? this.isLoading,
      todayDate: todayDate ?? this.todayDate,
    );
  }
}

class UsageTrackingNotifier extends StateNotifier<UsageTrackingState> {
  final UsageTrackerService _service = UsageTrackerService();
  final Ref _ref;

  /// Stored offsets: packageName → seconds at time of last reset
  Map<String, int> _resetOffsets = {};
  String _resetDate = '';

  UsageTrackingNotifier(this._ref) : super(const UsageTrackingState()) {
    _init();
  }

  Future<void> _init() async {
    await _loadResetOffsets();
    try {
      final hasPerm = await _service.hasPermission();
      state = state.copyWith(hasPermission: hasPerm);
      if (hasPerm) {
        try { await startTracking(); } catch (_) {}
        try { await fetchUsage(); } catch (_) {}
      }
    } catch (_) {}
    state = state.copyWith(isLoading: false);
  }

  /// Load saved reset offsets from SharedPreferences
  Future<void> _loadResetOffsets() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _resetDate = prefs.getString('reset_date') ?? '';
      final j = prefs.getString('reset_offsets');
      if (j != null) {
        final decoded = json.decode(j) as Map<String, dynamic>;
        _resetOffsets = decoded.map((k, v) => MapEntry(k, v as int));
      }
      // New day → clear offsets (automatic daily reset)
      if (_resetDate != getDateString()) {
        _resetOffsets = {};
        _resetDate = getDateString();
        await _saveResetOffsets();
      }
    } catch (_) {}
  }

  Future<void> _saveResetOffsets() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('reset_offsets', json.encode(_resetOffsets));
      await prefs.setString('reset_date', _resetDate);
    } catch (_) {}
  }

  Future<void> checkAndRequestPermission() async {
    final hasPerm = await _service.hasPermission();
    if (hasPerm) {
      state = state.copyWith(hasPermission: true);
      await startTracking();
      await fetchUsage();
    } else {
      await _service.requestPermission();
    }
  }

  Future<void> recheckPermission() async {
    try {
      final hasPerm = await _service.hasPermission();
      state = state.copyWith(hasPermission: hasPerm);
      if (hasPerm && !state.isTracking) {
        try { await startTracking(); } catch (_) {}
        try { await fetchUsage(); } catch (_) {}
      }
    } catch (_) {}
  }

  Future<void> startTracking() async {
    await _service.startBackgroundTracking();
    state = state.copyWith(isTracking: true);
  }

  Future<void> stopTracking() async {
    await _service.stopBackgroundTracking();
    state = state.copyWith(isTracking: false);
  }

  Future<void> fetchUsage() async {
    final trackedApps = _ref.read(trackedAppsProvider);
    final today = getDateString();

    // Auto daily reset of offsets at midnight
    if (_resetDate != today) {
      _resetOffsets = {};
      _resetDate = today;
      await _saveResetOffsets();
    }

    // Direct query from UsageStatsManager (most accurate real-time)
    var rawData = await _service.getUsageStats(today);
    if (rawData.isEmpty) {
      rawData = await _service.getLocalUsageData();
    }

    // Filter by tracked apps
    final filtered = trackedApps.isEmpty
        ? rawData
        : rawData.where((e) => trackedApps.contains(e['packageName'] as String)).toList();

    // Build usage list with reset offsets applied
    final usage = filtered.map((e) {
      final pkg = e['packageName'] as String? ?? '';
      final rawSec = e['durationSeconds'] as int? ?? 0;
      final offset = _resetOffsets[pkg] ?? 0;
      return AppUsageLocal(
        appName: e['appName'] as String? ?? 'Unknown',
        packageName: pkg,
        durationSeconds: rawSec,
        offsetSeconds: offset,
      );
    }).where((e) => e.effectiveSeconds > 0).toList()
      ..sort((a, b) => b.effectiveSeconds.compareTo(a.effectiveSeconds));

    // Total from effective values — sum THEN divide (no rounding mismatch)
    final totalEffSec = usage.fold<int>(0, (s, e) => s + e.effectiveSeconds);

    state = state.copyWith(
      todayUsage: usage,
      totalSeconds: totalEffSec,
      totalMinutes: totalEffSec ~/ 60, // floor — matches per-app effectiveMinutes
      lastUpdated: DateTime.now(),
      todayDate: today,
    );
  }

  /// Reset ALL apps: saves current OS values as offsets → next fetch shows 0
  Future<void> resetToday() async {
    for (final app in state.todayUsage) {
      _resetOffsets[app.packageName] = app.durationSeconds;
    }
    _resetDate = getDateString();
    await _saveResetOffsets();
    state = state.copyWith(
      todayUsage: [],
      totalMinutes: 0,
      totalSeconds: 0,
      lastUpdated: DateTime.now(),
      todayDate: getDateString(),
    );
  }

  /// Reset a single app's timer
  Future<void> resetApp(String packageName) async {
    final app = state.todayUsage.where((a) => a.packageName == packageName).firstOrNull;
    if (app != null) {
      _resetOffsets[packageName] = app.durationSeconds;
      await _saveResetOffsets();
      await fetchUsage();
    }
  }
}

final usageTrackingProvider =
    StateNotifierProvider<UsageTrackingNotifier, UsageTrackingState>((ref) {
  return UsageTrackingNotifier(ref);
});
