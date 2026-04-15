import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/platform_channels.dart';
import '../settings/tracked_apps_provider.dart';
import '../../core/utils.dart';

class AppUsageLocal {
  final String appName;
  final String packageName;
  final int durationSeconds;

  const AppUsageLocal({
    required this.appName,
    required this.packageName,
    required this.durationSeconds,
  });

  int get durationMinutes => (durationSeconds / 60).round();
}

class UsageTrackingState {
  final bool isTracking;
  final bool hasPermission;
  final List<AppUsageLocal> todayUsage;
  final int totalMinutes;
  final DateTime? lastUpdated;
  final bool isLoading;

  const UsageTrackingState({
    this.isTracking = false,
    this.hasPermission = false,
    this.todayUsage = const [],
    this.totalMinutes = 0,
    this.lastUpdated,
    this.isLoading = true,
  });

  UsageTrackingState copyWith({
    bool? isTracking,
    bool? hasPermission,
    List<AppUsageLocal>? todayUsage,
    int? totalMinutes,
    DateTime? lastUpdated,
    bool? isLoading,
  }) {
    return UsageTrackingState(
      isTracking: isTracking ?? this.isTracking,
      hasPermission: hasPermission ?? this.hasPermission,
      todayUsage: todayUsage ?? this.todayUsage,
      totalMinutes: totalMinutes ?? this.totalMinutes,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class UsageTrackingNotifier extends StateNotifier<UsageTrackingState> {
  final UsageTrackerService _service = UsageTrackerService();
  final Ref _ref;

  UsageTrackingNotifier(this._ref) : super(const UsageTrackingState()) {
    _init();
  }

  Future<void> _init() async {
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

    // Try locally cached data from the foreground service first
    var rawData = await _service.getLocalUsageData();

    // Fallback to direct query
    if (rawData.isEmpty) {
      rawData = await _service.getUsageStats(getDateString());
    }

    // Filter by tracked apps (if any selected)
    final filtered = trackedApps.isEmpty
        ? rawData
        : rawData.where((e) => trackedApps.contains(e['packageName'] as String)).toList();

    final usage = filtered
        .map((e) => AppUsageLocal(
              appName: e['appName'] as String? ?? 'Unknown',
              packageName: e['packageName'] as String? ?? '',
              durationSeconds: e['durationSeconds'] as int? ?? 0,
            ))
        .where((e) => e.durationSeconds > 0)
        .toList()
      ..sort((a, b) => b.durationSeconds.compareTo(a.durationSeconds));

    final totalSec = usage.fold<int>(0, (sum, e) => sum + e.durationSeconds);

    state = state.copyWith(
      todayUsage: usage,
      totalMinutes: (totalSec / 60).round(),
      lastUpdated: DateTime.now(),
    );
  }
}

final usageTrackingProvider =
    StateNotifierProvider<UsageTrackingNotifier, UsageTrackingState>((ref) {
  return UsageTrackingNotifier(ref);
});
