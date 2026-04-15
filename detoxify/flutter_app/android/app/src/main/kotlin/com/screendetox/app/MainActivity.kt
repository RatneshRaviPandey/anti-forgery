package com.screendetox.app

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.util.Calendar

class MainActivity : FlutterActivity() {
    private val USAGE_CHANNEL = "com.detoxify.app/usage_stats"
    private val BLOCKER_CHANNEL = "com.detoxify.app/app_blocker"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Usage Stats Channel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, USAGE_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "hasPermission" -> result.success(hasUsageStatsPermission())
                "requestPermission" -> {
                    startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                    result.success(null)
                }
                "getUsageStats" -> {
                    val date = call.argument<String>("date") ?: ""
                    result.success(getUsageStatsForDate(date))
                }
                "startTracking" -> {
                    UsageTrackingService.start(this@MainActivity)
                    result.success(null)
                }
                "stopTracking" -> {
                    UsageTrackingService.stop(this@MainActivity)
                    result.success(null)
                }
                "getLocalUsage" -> {
                    val prefs = getSharedPreferences("detoxify_usage", Context.MODE_PRIVATE)
                    val json = prefs.getString("usage_today", "[]")
                    result.success(json)
                }
                else -> result.notImplemented()
            }
        }

        // App Blocker Channel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, BLOCKER_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "isAccessibilityEnabled" -> {
                    result.success(AppBlockerAccessibilityService.isRunning)
                }
                "openAccessibilitySettings" -> {
                    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    result.success(null)
                }
                "setBlockingMode" -> {
                    val mode = call.argument<String>("mode") ?: "none"
                    getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
                        .edit().putString("blocking_mode", mode).apply()
                    result.success(null)
                }
                "getBlockingMode" -> {
                    val mode = getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
                        .getString("blocking_mode", "none")
                    result.success(mode)
                }
                "setBlockedApps" -> {
                    val packages = call.argument<List<String>>("packages") ?: emptyList()
                    getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
                        .edit().putStringSet("blocked_apps", packages.toSet()).apply()
                    result.success(null)
                }
                "clearBlockedApps" -> {
                    getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
                        .edit().remove("blocked_apps").apply()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName)
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName)
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun getUsageStatsForDate(dateStr: String): List<Map<String, Any>> {
        if (!hasUsageStatsPermission()) return emptyList()
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val cal = Calendar.getInstance()
        if (dateStr.isNotEmpty()) {
            try {
                val parts = dateStr.split("-")
                cal.set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt(), 0, 0, 0)
            } catch (_: Exception) {}
        } else {
            cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0)
        }
        cal.set(Calendar.MILLISECOND, 0)
        val startTime = cal.timeInMillis
        val endTime = startTime + 86_400_000L
        return usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
            .filter { it.totalTimeInForeground > 60_000 }
            .sortedByDescending { it.totalTimeInForeground }
            .take(20)
            .map { stat ->
                val appName = try {
                    val appInfo = packageManager.getApplicationInfo(stat.packageName, 0)
                    packageManager.getApplicationLabel(appInfo).toString()
                } catch (_: Exception) { stat.packageName }
                mapOf("appName" to appName, "packageName" to stat.packageName, "durationSeconds" to (stat.totalTimeInForeground / 1000).toInt())
            }
    }
}
