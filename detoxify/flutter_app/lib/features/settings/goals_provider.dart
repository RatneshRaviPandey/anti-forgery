import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/platform_channels.dart';

const defaultDailyGoal = 120;

/// Blocking modes
/// - "none": No blocking, only tracking
/// - "soft": Show warning overlay, user can tap "Continue Anyway"
/// - "hard": Block completely, force user to home screen
const blockingModeNone = 'none';
const blockingModeSoft = 'soft';
const blockingModeHard = 'hard';

class GoalsState {
  final int dailyGoalMinutes;
  final Map<String, int> appGoals; // packageName → max minutes
  final String blockingMode; // none, soft, hard
  final bool isAccessibilityEnabled;

  const GoalsState({
    this.dailyGoalMinutes = defaultDailyGoal,
    this.appGoals = const {},
    this.blockingMode = blockingModeNone,
    this.isAccessibilityEnabled = false,
  });

  GoalsState copyWith({
    int? dailyGoalMinutes,
    Map<String, int>? appGoals,
    String? blockingMode,
    bool? isAccessibilityEnabled,
  }) => GoalsState(
    dailyGoalMinutes: dailyGoalMinutes ?? this.dailyGoalMinutes,
    appGoals: appGoals ?? this.appGoals,
    blockingMode: blockingMode ?? this.blockingMode,
    isAccessibilityEnabled: isAccessibilityEnabled ?? this.isAccessibilityEnabled,
  );

  int? getAppGoal(String pkg) => appGoals[pkg];

  bool isAppOverGoal(String pkg, int mins) {
    final g = appGoals[pkg];
    return g != null && mins > g;
  }

  bool get isBlockingActive => blockingMode != blockingModeNone;
}

class GoalsNotifier extends StateNotifier<GoalsState> {
  final _blocker = AppBlockerService();

  GoalsNotifier() : super(const GoalsState()) { _load(); }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    final daily = p.getInt('daily_goal_minutes') ?? defaultDailyGoal;
    Map<String, int> appGoals = {};
    final j = p.getString('app_goals');
    if (j != null) {
      try {
        final d = json.decode(j) as Map<String, dynamic>;
        appGoals = d.map((k, v) => MapEntry(k, v as int));
      } catch (_) {}
    }

    // Load blocking mode from native side (may fail on web or if channel not ready)
    String mode = blockingModeNone;
    bool accEnabled = false;
    try {
      mode = await _blocker.getBlockingMode();
      accEnabled = await _blocker.isAccessibilityEnabled();
    } catch (_) {}

    state = GoalsState(
      dailyGoalMinutes: daily,
      appGoals: appGoals,
      blockingMode: mode,
      isAccessibilityEnabled: accEnabled,
    );
  }

  Future<void> _save() async {
    final p = await SharedPreferences.getInstance();
    await p.setInt('daily_goal_minutes', state.dailyGoalMinutes);
    final goalsJson = json.encode(state.appGoals);
    await p.setString('app_goals', goalsJson);
    // Sync to native SharedPrefs so AccessibilityService can read them
    try { await _blocker.syncAppGoals(goalsJson); } catch (_) {}
  }

  void setDailyGoal(int mins) {
    state = state.copyWith(dailyGoalMinutes: mins.clamp(15, 720));
    _save();
  }

  void setAppGoal(String pkg, int mins) {
    final u = Map<String, int>.from(state.appGoals);
    u[pkg] = mins.clamp(5, 480);
    state = state.copyWith(appGoals: u);
    _save();
  }

  void removeAppGoal(String pkg) {
    final u = Map<String, int>.from(state.appGoals);
    u.remove(pkg);
    state = state.copyWith(appGoals: u);
    _save();
  }

  Future<void> setBlockingMode(String mode) async {
    state = state.copyWith(blockingMode: mode);
    try { await _blocker.setBlockingMode(mode); } catch (_) {}
  }

  Future<void> openAccessibilitySettings() async {
    try { await _blocker.openAccessibilitySettings(); } catch (_) {}
  }

  Future<void> recheckAccessibility() async {
    try {
      final enabled = await _blocker.isAccessibilityEnabled();
      state = state.copyWith(isAccessibilityEnabled: enabled);
    } catch (_) {}
  }
}

final goalsProvider = StateNotifierProvider<GoalsNotifier, GoalsState>((ref) => GoalsNotifier());
