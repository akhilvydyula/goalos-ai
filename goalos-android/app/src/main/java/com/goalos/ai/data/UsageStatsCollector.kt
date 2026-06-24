package com.goalos.ai.data

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import com.goalos.ai.domain.AppClassification
import com.goalos.ai.domain.GoalOSConstants
import com.goalos.ai.domain.TrackedApp
import java.util.Calendar

class UsageStatsCollector(private val context: Context) {

    fun hasUsagePermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun usageSettingsIntent(): Intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)

    fun collectTodayApps(existing: List<TrackedApp>): List<TrackedApp> {
        if (!hasUsagePermission()) return existing.ifEmpty { com.goalos.ai.domain.DemoData.generateApps() }

        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val start = cal.timeInMillis
        val end = System.currentTimeMillis()

        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)
            ?.filter { it.totalTimeInForeground > 0 && it.packageName != context.packageName }
            ?: return existing.ifEmpty { com.goalos.ai.domain.DemoData.generateApps() }

        val pm = context.packageManager
        val classificationMap = existing.associateBy({ it.packageName }, { it.classification })
            .ifEmpty { GoalOSConstants.DEFAULT_APP_DEFS.associate { it.second to it.third } }

        val events = usm.queryEvents(start, end)
        val sessionCounts = mutableMapOf<String, Int>()
        val lastHour = mutableMapOf<String, Int>()
        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                val pkg = event.packageName
                sessionCounts[pkg] = (sessionCounts[pkg] ?: 0) + 1
                val hour = Calendar.getInstance().apply { timeInMillis = event.timeStamp }.get(Calendar.HOUR_OF_DAY)
                lastHour[pkg] = hour
            }
        }

        return stats
            .sortedByDescending { it.totalTimeInForeground }
            .take(20)
            .mapIndexed { index, stat ->
                val label = try {
                    pm.getApplicationLabel(pm.getApplicationInfo(stat.packageName, 0)).toString()
                } catch (_: PackageManager.NameNotFoundException) {
                    stat.packageName.substringAfterLast('.')
                }
                TrackedApp(
                    id = "usage-$index",
                    name = label,
                    packageName = stat.packageName,
                    classification = classificationMap[stat.packageName] ?: AppClassification.NEUTRAL,
                    minutesToday = (stat.totalTimeInForeground / 60000).toInt().coerceAtLeast(1),
                    sessions = sessionCounts[stat.packageName] ?: 1,
                    lastOpenedHour = lastHour[stat.packageName] ?: 12
                )
            }
    }
}
