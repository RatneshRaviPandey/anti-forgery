import 'dart:convert';
import 'package:flutter/services.dart';

/// Platform channel service for native screen time tracking.
/// Android: UsageStatsManager  |  iOS: FamilyControls/DeviceActivityMonitor
class UsageTrackerService {
  static const _channel = MethodChannel('com.screendetox.app/usage_stats');

  /// Get daily app usage stats for a given date (YYYY-MM-DD)
  Future<List<Map<String, dynamic>>> getUsageStats(String date) async {
    try {
      final result = await _channel.invokeMethod('getUsageStats', {'date': date});
      if (result == null) return [];
      return (result as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } on PlatformException {
      return [];
    }
  }

  /// Check if the app has usage stats permission
  Future<bool> hasPermission() async {
    try {
      final result = await _channel.invokeMethod('hasPermission');
      return result as bool? ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Open the system settings to grant usage access permission
  Future<void> requestPermission() async {
    try {
      await _channel.invokeMethod('requestPermission');
    } on PlatformException {
      // ignore
    }
  }

  /// Start background usage tracking foreground service
  Future<void> startBackgroundTracking() async {
    try {
      await _channel.invokeMethod('startTracking');
    } on PlatformException {
      // ignore
    }
  }

  /// Stop background usage tracking foreground service
  Future<void> stopBackgroundTracking() async {
    try {
      await _channel.invokeMethod('stopTracking');
    } on PlatformException {
      // ignore
    }
  }

  /// Read locally cached usage data from native SharedPreferences
  Future<List<Map<String, dynamic>>> getLocalUsageData() async {
    try {
      final result = await _channel.invokeMethod('getLocalUsage');
      if (result == null || result == '[]') return [];
      final List<dynamic> decoded = json.decode(result as String);
      return decoded.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } on PlatformException {
      return [];
    } on FormatException {
      return [];
    }
  }
}

/// Platform channel for app blocking (Android overlay / iOS Screen Time)
class AppBlockerService {
  static const _channel = MethodChannel('com.screendetox.app/app_blocker');

  Future<bool> isAccessibilityEnabled() async {
    try {
      return await _channel.invokeMethod('isAccessibilityEnabled') as bool? ?? false;
    } on PlatformException {
      return false;
    }
  }

  Future<void> openAccessibilitySettings() async {
    try {
      await _channel.invokeMethod('openAccessibilitySettings');
    } on PlatformException {
      // ignore
    }
  }

  /// Set blocking mode: "none", "soft", or "hard"
  Future<void> setBlockingMode(String mode) async {
    try {
      await _channel.invokeMethod('setBlockingMode', {'mode': mode});
    } on PlatformException {
      // ignore
    }
  }

  /// Get current blocking mode
  Future<String> getBlockingMode() async {
    try {
      final result = await _channel.invokeMethod('getBlockingMode');
      return result as String? ?? 'none';
    } on PlatformException {
      return 'none';
    }
  }

  /// Sync per-app goals to native SharedPrefs for AccessibilityService
  Future<void> syncAppGoals(String goalsJson) async {
    try {
      await _channel.invokeMethod('syncAppGoals', {'goalsJson': goalsJson});
    } on PlatformException {
      // ignore
    }
  }

  /// Sync tracked apps list to native SharedPrefs
  Future<void> syncTrackedApps(String appsJson) async {
    try {
      await _channel.invokeMethod('syncTrackedApps', {'appsJson': appsJson});
    } on PlatformException {
      // ignore
    }
  }

  /// Sync daily goal to native SharedPrefs
  Future<void> syncDailyGoal(int minutes) async {
    try {
      await _channel.invokeMethod('syncDailyGoal', {'minutes': minutes});
    } on PlatformException {
      // ignore
    }
  }

  Future<void> setBlockedApps(List<String> packageNames) async {
    try {
      await _channel.invokeMethod('setBlockedApps', {'packages': packageNames});
    } on PlatformException {
      // ignore
    }
  }

  Future<void> clearBlockedApps() async {
    try {
      await _channel.invokeMethod('clearBlockedApps');
    } on PlatformException {
      // ignore
    }
  }
}
