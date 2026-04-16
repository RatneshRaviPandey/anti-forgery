import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants.dart';
import '../../services/platform_channels.dart';

const _key = 'tracked_apps';

/// Holds the list of tracked app package names, persisted to SharedPreferences.
final trackedAppsProvider = StateNotifierProvider<TrackedAppsNotifier, Set<String>>((ref) {
  return TrackedAppsNotifier();
});

class TrackedAppsNotifier extends StateNotifier<Set<String>> {
  TrackedAppsNotifier() : super({}) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_key);
    if (list != null && list.isNotEmpty) {
      state = list.toSet();
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_key, state.toList());
    // Sync to native for AccessibilityService blocking
    try { await AppBlockerService().syncTrackedApps(json.encode(state.toList())); } catch (_) {}
  }

  void toggle(String packageName) {
    if (state.contains(packageName)) {
      state = {...state}..remove(packageName);
    } else {
      state = {...state, packageName};
    }
    _save();
  }

  void setAll(Set<String> packages) {
    state = packages;
    _save();
  }

  void clear() {
    state = {};
    _save();
  }

  /// Get display info for tracked apps
  List<Map<String, String>> get trackedAppInfos {
    return socialMediaApps
        .where((app) => state.contains(app['package']))
        .toList();
  }
}
