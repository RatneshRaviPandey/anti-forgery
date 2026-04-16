package com.screendetox.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Space
import android.widget.TextView

/**
 * Full-screen overlay shown when a blocked app is opened past its time limit.
 *
 * Soft mode: Warning + "Continue Anyway" option
 * Hard mode: Blocks completely, only "Go Home" or "Open Screen Detox"
 */
class BlockOverlayActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val appName = intent.getStringExtra("app_name") ?: "This app"
        val limitMins = intent.getIntExtra("limit_minutes", 0)
        val actualMins = intent.getIntExtra("actual_minutes", 0)
        val mode = intent.getStringExtra("blocking_mode") ?: "soft"
        val isHard = mode == "hard"

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#111827"))
            setPadding(80, 120, 80, 80)
        }

        // Emoji icon
        layout.addView(TextView(this).apply {
            text = if (isHard) "\u26D4" else "\u26A0\uFE0F"
            textSize = 52f
            gravity = Gravity.CENTER
        })

        layout.addView(Space(this).apply { minimumHeight = 32 })

        // Title
        layout.addView(TextView(this).apply {
            text = if (isHard) "App Blocked" else "Time Limit Reached"
            textSize = 26f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        })

        layout.addView(Space(this).apply { minimumHeight = 20 })

        // Usage info
        layout.addView(TextView(this).apply {
            text = "You\u2019ve used $appName for ${actualMins} min today.\nYour limit is ${limitMins} min."
            textSize = 15f
            setTextColor(Color.parseColor("#9CA3AF"))
            gravity = Gravity.CENTER
            setLineSpacing(6f, 1f)
        })

        layout.addView(Space(this).apply { minimumHeight = 16 })

        // Motivational message
        layout.addView(TextView(this).apply {
            text = if (isHard)
                "This app is blocked for the rest of today.\nTake a break and do something meaningful! \uD83C\uDF1F"
            else
                "Consider taking a break.\nYour screen time goal has been exceeded."
            textSize = 13f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
            setLineSpacing(4f, 1f)
        })

        layout.addView(Space(this).apply { minimumHeight = 48 })

        // Go Home button (primary action)
        layout.addView(Button(this).apply {
            text = "\uD83C\uDFE0  Go Home"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#3B82F6"))
            setPadding(48, 28, 48, 28)
            isAllCaps = false
            setOnClickListener { goHome() }
        })

        layout.addView(Space(this).apply { minimumHeight = 16 })

        // Continue Anyway — SOFT MODE ONLY
        if (!isHard) {
            layout.addView(Button(this).apply {
                text = "Continue Anyway (5 more min)"
                textSize = 14f
                setTextColor(Color.parseColor("#9CA3AF"))
                setBackgroundColor(Color.TRANSPARENT)
                isAllCaps = false
                setOnClickListener {
                    // Grant 5-minute cooldown before re-blocking
                    val pkg = intent.getStringExtra("package_name") ?: ""
                    if (pkg.isNotEmpty()) {
                        AppBlockerAccessibilityService.continueAllowedUntil[pkg] =
                            System.currentTimeMillis() + AppBlockerAccessibilityService.CONTINUE_COOLDOWN_MS
                    }
                    finish()
                }
            })
        }

        layout.addView(Space(this).apply { minimumHeight = 8 })

        // Open Screen Detox
        layout.addView(Button(this).apply {
            text = "\uD83E\uDDD8  Open Screen Detox"
            textSize = 14f
            setTextColor(Color.parseColor("#10B981"))
            setBackgroundColor(Color.TRANSPARENT)
            isAllCaps = false
            setOnClickListener {
                packageManager.getLaunchIntentForPackage("com.screendetox.app")?.let { startActivity(it) }
                finish()
            }
        })

        setContentView(layout)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val mode = intent.getStringExtra("blocking_mode") ?: "soft"
        if (mode == "hard") {
            goHome()
        }
        finish()
    }

    private fun goHome() {
        val home = Intent(Intent.ACTION_MAIN)
        home.addCategory(Intent.CATEGORY_HOME)
        home.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(home)
        finish()
    }
}
