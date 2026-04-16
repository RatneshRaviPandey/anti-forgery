package com.screendetox.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import org.json.JSONObject
import java.util.Calendar

class AppBlockerAccessibilityService : AccessibilityService() {
    companion object { var isRunning = false }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning = true
        val info = AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.notificationTimeout = 500
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return

        // Never block our own app, system UI, or launchers
        if (pkg == "com.screendetox.app" ||
            pkg.startsWith("com.android.systemui") ||
            pkg.startsWith("com.android.launcher") ||
            pkg == "com.google.android.apps.nexuslauncher" ||
            pkg == "android") return

        val prefs = getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
        val mode = prefs.getString("blocking_mode", "none") ?: "none"
        if (mode == "none") return

        // Read per-app goals synced from Flutter via MethodChannel
        val goalsJson = getSharedPreferences("detoxify_blocker", Context.MODE_PRIVATE)
            .getString("app_goals_json", null) ?: return

        var limit: Int? = null
        try {
            val g = JSONObject(goalsJson)
            if (g.has(pkg)) limit = g.getInt(pkg)
        } catch (_: Exception) {}
        if (limit == null) return // No per-app limit set

        val actual = getTodayUsage(pkg)
        if (actual < limit) return // Still within limit

        // Launch block overlay
        val intent = Intent(this, BlockOverlayActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        intent.putExtra("app_name", getAppLabel(pkg))
        intent.putExtra("package_name", pkg)
        intent.putExtra("limit_minutes", limit)
        intent.putExtra("actual_minutes", actual)
        intent.putExtra("blocking_mode", mode)
        startActivity(intent)
    }

    override fun onInterrupt() { isRunning = false }
    override fun onDestroy() { isRunning = false; super.onDestroy() }

    private fun getTodayUsage(pkg: String): Int {
        try {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val cal = Calendar.getInstance()
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                cal.timeInMillis,
                System.currentTimeMillis()
            )
            val appStat = stats.find { it.packageName == pkg }
            return ((appStat?.totalTimeInForeground ?: 0) / 60000).toInt()
        } catch (_: Exception) { return 0 }
    }

    private fun getAppLabel(pkg: String): String {
        return try {
            val ai = packageManager.getApplicationInfo(pkg, 0)
            packageManager.getApplicationLabel(ai).toString()
        } catch (_: Exception) { pkg }
    }
}
