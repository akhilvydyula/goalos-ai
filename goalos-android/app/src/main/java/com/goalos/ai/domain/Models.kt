package com.goalos.ai.domain

import kotlinx.serialization.Serializable

@Serializable
enum class AppClassification {
    GOAL_SUPPORTING, MIXED, NEUTRAL, DISTRACTING
}

@Serializable
data class UserGoal(
    val templateId: String,
    val title: String,
    val timelineWeeks: Int = 12,
    val dailyCommitmentMinutes: Int = 60,
    val focusWindow: String = "Morning (9–12pm)",
    val painPoint: String = "",
    val motivation: String = ""
)

@Serializable
data class DnaAnswers(
    val distractionTime: String = "",
    val distractingApps: List<String> = emptyList(),
    val distractionTrigger: String = "",
    val bestFocusTime: String = "",
    val energyLevel: Int = 3,
    val coachingTone: String = "Supportive",
    val goalBlocker: String = ""
)

@Serializable
data class ProductivityProfile(
    val identity: String,
    val distractionTrigger: String,
    val focusWindow: String,
    val coachingTone: String,
    val reminderStrategy: String
)

@Serializable
data class TrackedApp(
    val id: String,
    val name: String,
    val packageName: String,
    val classification: AppClassification,
    val minutesToday: Int,
    val sessions: Int,
    val lastOpenedHour: Int
)

@Serializable
data class IntentCheckIn(
    val appId: String,
    val reason: String,
    val aligned: Boolean,
    val timestamp: String
)

@Serializable
data class FocusSprint(
    val id: String,
    val title: String,
    val durationMinutes: Int,
    val completedAt: String? = null,
    val scoreBoost: Int = 5
)

@Serializable
data class ScoreBreakdown(
    val goalSupportingTime: Int,
    val roadmapCompletion: Int,
    val deepWork: Int,
    val intentMatch: Int,
    val wellnessBalance: Int,
    val distractionPenalty: Int,
    val lateNightPenalty: Int,
    val contextSwitchPenalty: Int,
    val total: Int
)

@Serializable
data class CoachRecommendation(
    val diagnosis: String,
    val nextAction: String,
    val reminder: String,
    val tomorrowPlan: String,
    val scoreContext: Int
)

enum class CoachRole { COACH, USER }

@Serializable
data class CoachMessage(
    val role: CoachRole,
    val text: String,
    val timestamp: String = ""
)

@Serializable
data class WeeklyReport(
    val averageScore: Int,
    val productiveMinutes: Int,
    val distractedMinutes: Int,
    val bestFocusWindow: String,
    val riskWindow: String,
    val identity: String,
    val nextWeekGoal: String,
    val distractionReductionPercent: Int
)

@Serializable
data class UserState(
    val onboarded: Boolean = false,
    val privacyAccepted: Boolean = false,
    val usagePermissionGranted: Boolean = false,
    val goal: UserGoal? = null,
    val dna: DnaAnswers? = null,
    val profile: ProductivityProfile? = null,
    val apps: List<TrackedApp> = emptyList(),
    val intentCheckIns: List<IntentCheckIn> = emptyList(),
    val focusSprints: List<FocusSprint> = emptyList(),
    val roadmapProgress: Int = 35,
    val energyToday: Int = 3,
    val moodToday: Int = 3,
    val weeklyHistory: List<Int> = listOf(68, 72, 75, 71, 78, 74, 72)
)

data class GoalTemplate(
    val id: String,
    val title: String,
    val description: String
)

data class IntentOption(val id: String, val label: String, val aligned: Boolean)

data class DnaQuestion(
    val id: String,
    val question: String,
    val options: List<String> = emptyList(),
    val multiSelect: Boolean = false,
    val isScale: Boolean = false
)
