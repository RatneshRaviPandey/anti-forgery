package com.screendetox.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

class UsageTrackingService : Service() {

    companion object {
        private const val CHANNEL_ID = "detoxify_tracking"
        private const val NOTIFICATION_ID = 1001
        private const val POLL_INTERVAL_MS = 15L * 60 * 1000 // 15 minutes

        fun start(context: Context) {
            val intent = Intent(context, UsageTrackingService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, UsageTrackingService::class.java))
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private val pollRunnable = object : Runnable {
        override fun run() {
            pollUsage()
            handler.postDelayed(this, POLL_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.removeCallbacks(pollRunnable)
        handler.post(pollRunnable)
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(pollRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Screen Time Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent notification while Screen Detox tracks your screen time"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Screen Detox")
            .setContentText("Tracking your screen time")
            .setSmallIcon(android.R.drawable.ic_menu_recent_history)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun pollUsage() {
        try {
            val trackedApps = readTrackedApps()

            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val cal = Calendar.getInstance()
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val startTime = cal.timeInMillis
            val endTime = System.currentTimeMillis()

            val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
                .filter { it.totalTimeInForeground > 0 }
                .filter { trackedApps.isEmpty() || it.packageName in trackedApps }
                .sortedByDescending { it.totalTimeInForeground }

            val jsonArray = JSONArray()
            for (stat in stats) {
                val appName = try {
                    val appInfo = packageManager.getApplicationInfo(stat.packageName, 0)
                    packageManager.getApplicationLabel(appInfo).toString()
                } catch (_: Exception) { stat.packageName }

                val obj = JSONObject()
                obj.put("appName", appName)
                obj.put("packageName", stat.packageName)
                obj.put("durationSeconds", (stat.totalTimeInForeground / 1000).toInt())
                jsonArray.put(obj)
            }

            val dateStr = "${cal.get(Calendar.YEAR)}-${String.format("%02d", cal.get(Calendar.MONTH)+1)}-${String.format("%02d", cal.get(Calendar.DAY_OF_MONTH))}"

            getSharedPreferences("detoxify_usage", Context.MODE_PRIVATE).edit()
                .putString("usage_today", jsonArray.toString())
                .putString("usage_date", dateStr)
                .putLong("last_poll", System.currentTimeMillis())
                .apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun readTrackedApps(): Set<String> {
        val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val raw = prefs.getStringSet("flutter.tracked_apps", null)
        if (raw != null) return raw
        val jsonStr = prefs.getString("flutter.tracked_apps", null)
        if (jsonStr != null) {
            try {
                val arr = JSONArray(jsonStr)
                val set = mutableSetOf<String>()
                for (i in 0 until arr.length()) set.add(arr.getString(i))
                return set
            } catch (_: Exception) {}
        }
        return emptySet()
    }
}
