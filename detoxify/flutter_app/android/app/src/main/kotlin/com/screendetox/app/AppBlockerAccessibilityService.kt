package com.screendetox.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

class AppBlockerAccessibilityService : AccessibilityService() {
    companion object {
        var isRunning = false
        // Cooldown map: pkg → timestamp when "Continue Anyway" expires
        val continueAllowedUntil = mutableMapOf<String, Long>()
        const val CONTINUE_COOLDOWN_MS = 5L * 60 * 1000 // 5 minutes
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning = true
        val info = AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.notificationTimeout = 300
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return

        // Never block our own app, system UI, launchers, settings
        if (pkg == "com.screendetox.app" ||
            pkg.startsWith("com.android.systemui") ||
            pkg.startsWith("com.android.launcher") ||
            pkg.startsWith("com.android.settings") ||
            pkg == "com.google.android.apps.nexuslauncher" ||
            pkg == "com.google.android.permissioncontroller" ||
            pkg == "android") return

        val prefs = getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
        val mode = prefs.getString("blocking_mode", "none") ?: "none"
        if (mode == "none") return

        // Check cooldown from "Continue Anyway"
        val allowedUntil = continueAllowedUntil[pkg] ?: 0L
        if (allowedUntil > System.currentTimeMillis()) return

        // Read tracked apps list
        val trackedApps = readTrackedApps(prefs)
        // Only block tracked apps (if list exists)
        if (trackedApps.isNotEmpty() && pkg !in trackedApps) return

        // Read per-app goals
        val goalsJson = prefs.getString("app_goals_json", null)
        var appLimit: Int? = null
        if (goalsJson != null) {
            try {
                val g = JSONObject(goalsJson)
                if (g.has(pkg)) appLimit = g.getInt(pkg)
            } catch (_: Exception) {}
        }

        val actualMinutes = getTodayUsage(pkg)
        var shouldBlock = false
        var blockReason = ""
        var limitValue = 0

        // Check 1: Per-app limit
        if (appLimit != null && actualMinutes >= appLimit) {
            shouldBlock = true
            blockReason = "App limit reached"
            limitValue = appLimit
        }

        // Check 2: Daily total goal (applies to ALL tracked apps collectively)
        if (!shouldBlock) {
            val dailyGoal = prefs.getInt("daily_goal_minutes", 120)
            val totalUsage = getTotalTrackedUsage(trackedApps)
            if (totalUsage >= dailyGoal) {
                shouldBlock = true
                blockReason = "Daily total limit reached"
                limitValue = dailyGoal
            }
        }

        if (!shouldBlock) return

        // Launch block overlay
        val intent = Intent(this, BlockOverlayActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_ANIMATION)
        intent.putExtra("app_name", getAppLabel(pkg))
        intent.putExtra("package_name", pkg)
        intent.putExtra("limit_minutes", limitValue)
        intent.putExtra("actual_minutes", actualMinutes)
        intent.putExtra("blocking_mode", mode)
        intent.putExtra("block_reason", blockReason)
        startActivity(intent)
    }

    override fun onInterrupt() { isRunning = false }
    override fun onDestroy() { isRunning = false; super.onDestroy() }

    private fun readTrackedApps(prefs: android.content.SharedPreferences): Set<String> {
        val json = prefs.getString("tracked_apps_json", null) ?: return emptySet()
        val set = mutableSetOf<String>()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) set.add(arr.getString(i))
        } catch (_: Exception) {}
        return set
    }

    private fun getTodayUsage(pkg: String): Int {
        try {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val cal = todayMidnight()
            val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, cal.timeInMillis, System.currentTimeMillis())
            return ((stats.find { it.packageName == pkg }?.totalTimeInForeground ?: 0) / 60000).toInt()
        } catch (_: Exception) { return 0 }
    }

    private fun getTotalTrackedUsage(tracked: Set<String>): Int {
        try {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val cal = todayMidnight()
            val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, cal.timeInMillis, System.currentTimeMillis())
            var total = 0L
            for (s in stats) {
                if (tracked.isEmpty() || s.packageName in tracked) total += s.totalTimeInForeground
            }
            return (total / 60000).toInt()
        } catch (_: Exception) { return 0 }
    }

    private fun todayMidnight(): Calendar {
        val c = Calendar.getInstance()
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0)
        c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0)
        return c
    }

    private fun getAppLabel(pkg: String): String {
        return try {
            val ai = packageManager.getApplicationInfo(pkg, 0)
            packageManager.getApplicationLabel(ai).toString()
        } catch (_: Exception) { pkg }
    }
}
