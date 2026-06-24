package com.goalos.ai.domain

import com.goalos.ai.domain.CoachMessage
import com.goalos.ai.domain.CoachRole
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.random.Random

object ScoringEngine {
    private const val W_GOAL_TIME = 30
    private const val W_ROADMAP = 20
    private const val W_DEEP = 15
    private const val W_INTENT = 15
    private const val W_WELLNESS = 10
    private const val W_DISTRACTION = 20
    private const val W_LATE_NIGHT = 10
    private const val W_CONTEXT = 10

    fun calculate(state: UserState): ScoreBreakdown {
        val apps = state.apps
        val byClass = apps.groupBy { it.classification }.mapValues { (_, list) -> list.sumOf { it.minutesToday } }
        val total = apps.sumOf { it.minutesToday }.coerceAtLeast(1)

        val goalSupportingTime = ((byClass[AppClassification.GOAL_SUPPORTING] ?: 0) / total.toFloat() * W_GOAL_TIME).roundToInt()
        val roadmapCompletion = (state.roadmapProgress / 100f * W_ROADMAP).roundToInt()

        val completedSprints = state.focusSprints.count { it.completedAt != null }
        val deepWorkMinutes = completedSprints * 25 + (byClass[AppClassification.GOAL_SUPPORTING] ?: 0) * 0.3
        val deepWork = min(W_DEEP, (deepWorkMinutes / 120f * W_DEEP).roundToInt())

        val aligned = state.intentCheckIns.count { it.aligned }
        val intentTotal = state.intentCheckIns.size.coerceAtLeast(1)
        val intentMatch = (aligned / intentTotal.toFloat() * W_INTENT).roundToInt()

        val wellnessBalance = (((state.energyToday + state.moodToday) / 10f) * W_WELLNESS).roundToInt()

        val distractionRatio = ((byClass[AppClassification.DISTRACTING] ?: 0) + (byClass[AppClassification.MIXED] ?: 0) * 0.5f) / total
        val distractionPenalty = (distractionRatio * W_DISTRACTION).roundToInt()

        val lateNight = apps.filter { it.lastOpenedHour >= 22 || it.lastOpenedHour < 5 }.sumOf { it.minutesToday }
        val lateNightPenalty = (lateNight / total.toFloat() * W_LATE_NIGHT).roundToInt()

        val sessions = apps.sumOf { it.sessions }
        val contextPenalty = (min(1f, sessions / 40f) * W_CONTEXT).roundToInt()

        val raw = goalSupportingTime + roadmapCompletion + deepWork + intentMatch + wellnessBalance -
            distractionPenalty - lateNightPenalty - contextPenalty

        return ScoreBreakdown(
            goalSupportingTime = goalSupportingTime,
            roadmapCompletion = roadmapCompletion,
            deepWork = deepWork,
            intentMatch = intentMatch,
            wellnessBalance = wellnessBalance,
            distractionPenalty = -distractionPenalty,
            lateNightPenalty = -lateNightPenalty,
            contextSwitchPenalty = -contextPenalty,
            total = raw.coerceIn(0, 100)
        )
    }

    fun deriveProfile(dna: DnaAnswers): ProductivityProfile {
        val identity = when {
            dna.distractionTime == "Late night" || dna.goalBlocker == "Night scrolling" -> "Night Scroller"
            dna.goalBlocker == "Too much content, not enough action" -> "High Potential, Low Execution"
            dna.goalBlocker == "Context switching" -> "Dopamine Drifter"
            dna.bestFocusTime.startsWith("Early") || dna.bestFocusTime.startsWith("Morning") -> "Focused Creator"
            else -> "Consistent Builder"
        }
        val reminder = when (identity) {
            "Night Scroller" -> "Night guard reminders before 10pm"
            "High Potential, Low Execution" -> "Short 15–25 min focus sprints"
            else -> "Best focus window nudges"
        }
        return ProductivityProfile(identity, dna.distractionTrigger, dna.bestFocusTime, dna.coachingTone, reminder)
    }
}

object CoachEngine {
    fun recommend(state: UserState, score: ScoreBreakdown): CoachRecommendation {
        val topDistractor = state.apps
            .filter { it.classification == AppClassification.DISTRACTING || it.classification == AppClassification.MIXED }
            .maxByOrNull { it.minutesToday }
        val goalTitle = state.goal?.title ?: "your goal"
        val pointsTo80 = (80 - score.total).coerceAtLeast(0)

        val sprintType = when (state.goal?.templateId) {
            "data-engineering-job" -> "SQL"
            "software-interview" -> "DSA"
            "founder-mode" -> "build"
            else -> "focus"
        }

        val diagnosis = buildString {
            append("Your Goal Alignment Score is ${score.total}. ")
            when {
                score.total >= 80 -> append("Strong alignment today — you're moving closer to your goal.")
                score.distractionPenalty < -8 -> append("Distraction time reduced your score by ${kotlin.math.abs(score.distractionPenalty)} points.")
                score.lateNightPenalty < -5 -> append("Late-night usage is pulling your score down.")
                else -> append("You're making progress, but there's room to align more time with your goal.")
            }
        }

        val nextAction = if (pointsTo80 > 0) {
            "Complete one $sprintType sprint (${if (pointsTo80 <= 10) 15 else 25} min) before opening ${topDistractor?.name ?: "distracting apps"} to reach 80+."
        } else {
            "Protect your momentum with a $sprintType deep work block."
        }

        val reminder = when {
            state.profile?.identity == "Night Scroller" -> "Night scrolling has reduced your morning focus — set a 10pm guard tonight."
            pointsTo80 > 0 -> "You're ${if (pointsTo80 <= 10) "one sprint" else "$pointsTo80 points"} away from an 80+ score."
            else -> "Your best focus window starts now — capitalize on today's momentum."
        }

        return CoachRecommendation(
            diagnosis = diagnosis,
            nextAction = nextAction,
            reminder = reminder,
            tomorrowPlan = "Morning: 25-min $sprintType sprint. Afternoon: classify ${topDistractor?.name ?: "mixed apps"} intent before opening. Evening: review score for $goalTitle.",
            scoreContext = score.total
        )
    }

    fun weeklyReport(state: UserState): WeeklyReport {
        val avg = if (state.weeklyHistory.isEmpty()) 72 else state.weeklyHistory.average().roundToInt()
        val productive = state.apps.filter { it.classification == AppClassification.GOAL_SUPPORTING }.sumOf { it.minutesToday }
        val distracted = state.apps.filter { it.classification == AppClassification.DISTRACTING }.sumOf { it.minutesToday }
        return WeeklyReport(
            averageScore = avg,
            productiveMinutes = productive * 7,
            distractedMinutes = distracted * 7,
            bestFocusWindow = state.profile?.focusWindow?.substringBefore("(")?.trim() ?: "8–10 AM",
            riskWindow = if (state.profile?.identity == "Night Scroller") "10pm – 12am" else "9pm – 11pm",
            identity = state.profile?.identity ?: "Consistent Builder",
            nextWeekGoal = "Reach 85+ average score for ${state.goal?.title ?: "your goal"}",
            distractionReductionPercent = 22
        )
    }

    fun openingMessages(state: UserState, score: ScoreBreakdown, coach: CoachRecommendation): List<CoachMessage> {
        val identity = state.profile?.identity ?: "Consistent Builder"
        val topDistractor = state.apps
            .filter { it.classification == AppClassification.DISTRACTING || it.classification == AppClassification.MIXED }
            .maxByOrNull { it.minutesToday }

        val opener = when {
            identity == "Night Scroller" || score.lateNightPenalty < -5 ->
                "You are not lazy. Your learning intent is strong, but your phone environment is still winning after 9 PM. Let's redesign that moment."
            identity == "High Potential, Low Execution" ->
                "You consume strong learning content — the gap is converting it into daily execution blocks. That's fixable with one sprint at a time."
            score.total >= 80 ->
                "Strong alignment today. You're moving closer to ${state.goal?.title ?: "your goal"} — let's protect this momentum."
            else ->
                coach.diagnosis
        }

        return listOf(
            CoachMessage(CoachRole.COACH, opener),
            CoachMessage(
                CoachRole.COACH,
                "Next best action: ${coach.nextAction}"
            ),
            if (topDistractor != null) {
                CoachMessage(
                    CoachRole.COACH,
                    "Watch ${topDistractor.name} — it used ${DemoData.formatMinutes(topDistractor.minutesToday)} today. Use Intent Gate before opening it."
                )
            } else null
        ).filterNotNull()
    }

    fun suggestedPrompts(state: UserState): List<String> = listOf(
        "What should I do tomorrow to improve my score?",
        "Why is my score ${state.weeklyHistory.lastOrNull() ?: 72} today?",
        "Help me reduce night scrolling",
        "Start a focus sprint plan"
    )

    fun suggestedActions(state: UserState, coach: CoachRecommendation): List<String> {
        val focusWindow = state.profile?.focusWindow?.substringBefore("(")?.trim() ?: "8 AM"
        val topDistractor = state.apps
            .filter { it.classification == AppClassification.DISTRACTING }
            .maxByOrNull { it.minutesToday }
        return listOfNotNull(
            "Create $focusWindow sprint",
            topDistractor?.let { "Block ${it.name} after 10 PM" },
            "Add learning timer",
            "Show tomorrow plan"
        )
    }

    fun replyTo(
        userMessage: String,
        state: UserState,
        score: ScoreBreakdown,
        coach: CoachRecommendation
    ): String {
        val msg = userMessage.lowercase().trim()
        val topDistractor = state.apps
            .filter { it.classification == AppClassification.DISTRACTING || it.classification == AppClassification.MIXED }
            .maxByOrNull { it.minutesToday }
        val focusWindow = state.profile?.focusWindow ?: "Morning (9–12pm)"
        val sprintType = when (state.goal?.templateId) {
            "data-engineering-job" -> "SQL"
            "software-interview" -> "DSA"
            "founder-mode" -> "build"
            else -> "focus"
        }
        val pointsTo80 = (80 - score.total).coerceAtLeast(0)

        return when {
            msg.contains("tomorrow") || msg.contains("improve") && msg.contains("score") ->
                "Start with your strongest window: $focusWindow. Do 1 $sprintType sprint + 1 learning block before opening ${topDistractor?.name ?: "distracting apps"}. I'll unlock entertainment after the sprint."

            msg.contains("night") || msg.contains("scroll") ->
                "Late scrolling is your biggest score leak. Set a 10 PM guard on ${topDistractor?.name ?: "social apps"}, and replace the first 5 minutes with a 2-minute reset or ${sprintType} review."

            msg.contains("score") || msg.contains("why") || msg.contains("low") ->
                "Your score is ${score.total}/100. ${coach.diagnosis} ${if (pointsTo80 > 0) "You're $pointsTo80 points from 80+ — one ${if (pointsTo80 <= 10) 15 else 25}-minute sprint gets you there." else "Keep protecting today's momentum."}"

            msg.contains("sprint") || msg.contains("focus") || msg.contains("start") ->
                "Start a ${if (pointsTo80 <= 10) 15 else 25}-minute $sprintType sprint now. ${coach.nextAction}"

            msg.contains("plan") || msg.contains("tomorrow plan") ->
                coach.tomorrowPlan

            msg.contains("remind") ->
                coach.reminder

            msg.contains("block") || msg.contains("instagram") || msg.contains("youtube") ->
                "Use Intent Gate before ${topDistractor?.name ?: "mixed apps"} — classify each session as learning or entertainment. I'll nudge you when risk is high after 9 PM."

            msg.contains("hello") || msg.contains("hi") || msg.contains("hey") ->
                "Hey — I'm your GoalOS coach. Ask me about your score, tomorrow's plan, night scrolling, or tap a suggested action below."

            else ->
                "${coach.nextAction}\n\n${coach.reminder}"
        }
    }
}

object DemoData {
    fun generateApps(): List<TrackedApp> = GoalOSConstants.DEFAULT_APP_DEFS.mapIndexed { i, (name, pkg, cls) ->
        val distracting = cls == AppClassification.DISTRACTING
        val supporting = cls == AppClassification.GOAL_SUPPORTING
        TrackedApp(
            id = "app-$i",
            name = name,
            packageName = pkg,
            classification = cls,
            minutesToday = when {
                distracting -> Random.nextInt(25, 91)
                supporting -> Random.nextInt(30, 121)
                else -> Random.nextInt(10, 61)
            },
            sessions = Random.nextInt(2, if (distracting) 16 else 9),
            lastOpenedHour = if (distracting) Random.nextInt(20, 24) else Random.nextInt(8, 19)
        )
    }

    fun formatMinutes(minutes: Int): String {
        if (minutes < 60) return "${minutes}m"
        val h = minutes / 60
        val m = minutes % 60
        return if (m > 0) "${h}h ${m}m" else "${h}h"
    }
}
