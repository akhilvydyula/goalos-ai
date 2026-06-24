package com.goalos.ai.domain

object GoalOSConstants {
    const val TAGLINE = "Turn screen time into goal time."
    const val PRIVACY_PROMISE =
        "We do not read your messages, typed text, photos, calls, or private app content. " +
            "We only analyze approved usage patterns to help you reach your goals."

    val GOAL_TEMPLATES = listOf(
        GoalTemplate("data-engineering-job", "Get Data Engineering Job", "Build SQL, PySpark, and portfolio skills."),
        GoalTemplate("software-interview", "Crack Software Engineering Interview", "DSA, system design, and mock prep."),
        GoalTemplate("learn-ai-de", "Learn AI / Data Engineering", "Structured learning for data & AI skills."),
        GoalTemplate("reduce-social-media", "Reduce Social Media Distraction", "Reclaim focus from scrolling."),
        GoalTemplate("founder-mode", "Build Startup / Founder Mode", "Convert consumption into execution.")
    )

    val DNA_QUESTIONS = listOf(
        DnaQuestion("distractionTime", "When do you get distracted most?", listOf("Morning", "Afternoon", "Evening", "Late night")),
        DnaQuestion("distractingApps", "Which apps distract you most?", listOf("YouTube", "Instagram", "TikTok", "LinkedIn", "Reddit", "Twitter/X"), multiSelect = true),
        DnaQuestion("distractionTrigger", "What is your main distraction trigger?", listOf("Boredom", "Stress", "Notifications", "Habit", "Procrastination")),
        DnaQuestion("bestFocusTime", "What time do you focus best?", listOf("Early morning (5–9am)", "Morning (9–12pm)", "Afternoon", "Evening", "Late night")),
        DnaQuestion("energyLevel", "What is your energy level today?", isScale = true),
        DnaQuestion("coachingTone", "What coaching tone do you prefer?", listOf("Supportive", "Direct", "Motivational", "Calm & analytical")),
        DnaQuestion("goalBlocker", "What is your biggest goal blocker?", listOf(
            "Too much content, not enough action", "Night scrolling", "Context switching", "Low energy", "Unclear next step"
        ))
    )

    val INTENT_OPTIONS = listOf(
        IntentOption("learning", "Learning", true),
        IntentOption("work", "Work", true),
        IntentOption("interview-prep", "Interview preparation", true),
        IntentOption("business-research", "Business research", true),
        IntentOption("messaging", "Messaging", true),
        IntentOption("entertainment", "Entertainment", false),
        IntentOption("stress-relief", "Stress relief", false),
        IntentOption("boredom", "Boredom", false),
        IntentOption("no-reason", "No reason", false)
    )

    val DEFAULT_APP_DEFS = listOf(
        Triple("Udemy", "com.udemy.android", AppClassification.GOAL_SUPPORTING),
        Triple("ChatGPT", "com.openai.chatgpt", AppClassification.MIXED),
        Triple("YouTube", "com.google.android.youtube", AppClassification.MIXED),
        Triple("Instagram", "com.instagram.android", AppClassification.DISTRACTING),
        Triple("LinkedIn", "com.linkedin.android", AppClassification.MIXED),
        Triple("LeetCode", "com.leetcode.android", AppClassification.GOAL_SUPPORTING),
        Triple("Notion", "notion.id", AppClassification.GOAL_SUPPORTING),
        Triple("Chrome", "com.android.chrome", AppClassification.NEUTRAL),
        Triple("WhatsApp", "com.whatsapp", AppClassification.NEUTRAL),
        Triple("TikTok", "com.zhiliaoapp.musically", AppClassification.DISTRACTING)
    )
}
