package com.goalos.ai.ui.onboarding

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.goalos.ai.domain.DnaAnswers
import com.goalos.ai.domain.GoalOSConstants
import com.goalos.ai.domain.GoalTemplate
import com.goalos.ai.domain.UserGoal
import com.goalos.ai.ui.components.ActionChip
import com.goalos.ai.ui.components.GoalOSCard
import com.goalos.ai.ui.components.GradientTitle
import com.goalos.ai.ui.components.HeroCard
import com.goalos.ai.ui.components.MetricCard
import com.goalos.ai.ui.components.PrimaryButton
import com.goalos.ai.ui.components.SecondaryButton
import com.goalos.ai.ui.components.SectionLabel
import com.goalos.ai.ui.theme.GoalOSTokens

enum class OnboardStep { WELCOME, GOAL, DNA, PRIVACY }

private val goalIcons = listOf("💻", "⚙️", "🚀", "📵", "📚", "💪")

@Composable
fun OnboardingNav(
    modifier: Modifier = Modifier,
    onGoal: (UserGoal) -> Unit,
    onDna: (DnaAnswers) -> Unit,
    onComplete: () -> Unit
) {
    var step by remember { mutableStateOf(OnboardStep.WELCOME) }
    var pendingGoal by remember { mutableStateOf<UserGoal?>(null) }

    when (step) {
        OnboardStep.WELCOME -> WelcomeScreen(modifier) { step = OnboardStep.GOAL }
        OnboardStep.GOAL -> GoalSetupScreen(modifier, onBack = { step = OnboardStep.WELCOME }) { goal ->
            pendingGoal = goal
            onGoal(goal)
            step = OnboardStep.DNA
        }
        OnboardStep.DNA -> DnaQuizScreen(modifier, onBack = { step = OnboardStep.GOAL }) { dna ->
            onDna(dna)
            step = OnboardStep.PRIVACY
        }
        OnboardStep.PRIVACY -> PrivacyScreen(modifier) { onComplete() }
    }
}

@Composable
private fun WelcomeScreen(modifier: Modifier, onStart: () -> Unit) {
    Column(
        modifier = modifier.fillMaxSize().padding(20.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeroCard(modifier = Modifier.padding(top = 24.dp)) {
            SectionLabel("GoalOS AI")
            GradientTitle(GoalOSConstants.TAGLINE)
            Text(
                "GoalOS AI understands your goals, app behavior, intent, energy, and distractions — then coaches you into the next best action.",
                color = GoalOSTokens.TextMuted,
                fontSize = 14.sp,
                lineHeight = 21.sp,
                modifier = Modifier.padding(top = 12.dp)
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MetricCard("Goal score", "72", "+18% this week", modifier = Modifier.weight(1f))
            MetricCard("Saved", "6.4h", "from distraction", modifier = Modifier.weight(1f))
        }
        PrimaryButton("Start my goal journey", onStart)
        SecondaryButton("How privacy works", onStart)
    }
}

@Composable
private fun GoalSetupScreen(modifier: Modifier, onBack: () -> Unit, onComplete: (UserGoal) -> Unit) {
    var selected by remember { mutableStateOf<GoalTemplate?>(null) }
    var weeks by remember { mutableIntStateOf(12) }
    var minutes by remember { mutableIntStateOf(60) }

    Column(modifier.fillMaxSize().padding(20.dp).verticalScroll(rememberScrollState())) {
        Text("← Back", modifier = Modifier.clickable(onClick = onBack).padding(bottom = 12.dp), color = GoalOSTokens.TextMuted)
        Text("What are you building?", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Choose one serious goal. You can change it later.", color = GoalOSTokens.TextDim, modifier = Modifier.padding(bottom = 12.dp))

        GoalOSConstants.GOAL_TEMPLATES.forEachIndexed { i, g ->
            val active = selected?.id == g.id
            GoalOSCard(
                modifier = Modifier.padding(bottom = 10.dp).clickable { selected = g },
                gradient = if (active) Brush.linearGradient(listOf(Color(0x292BE7A8), Color(0x1F68A7FF))) else null
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(goalIcons.getOrElse(i) { "🎯" }, fontSize = 22.sp)
                    Column {
                        Text(g.title, fontWeight = FontWeight.SemiBold)
                        Text(g.description, color = GoalOSTokens.TextDim, fontSize = 13.sp)
                    }
                }
            }
        }
        if (selected != null) {
            Text("Timeline: $weeks weeks", Modifier.padding(top = 8.dp))
            Slider(weeks.toFloat(), onValueChange = { weeks = it.toInt() }, valueRange = 4f..52f, steps = 47)
            Text("Daily commitment: $minutes min")
            Slider(minutes.toFloat(), onValueChange = { minutes = it.toInt() }, valueRange = 15f..180f, steps = 10)
        }
        PrimaryButton(
            "Continue to Productivity DNA",
            { selected?.let { onComplete(UserGoal(it.id, it.title, weeks, minutes)) } },
            enabled = selected != null,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
private fun DnaQuizScreen(modifier: Modifier, onBack: () -> Unit, onComplete: (DnaAnswers) -> Unit) {
    var index by remember { mutableIntStateOf(0) }
    var distractionTime by remember { mutableStateOf("") }
    val distractingApps = remember { mutableStateListOf<String>() }
    var distractionTrigger by remember { mutableStateOf("") }
    var bestFocusTime by remember { mutableStateOf("") }
    var energy by remember { mutableIntStateOf(3) }
    var coachingTone by remember { mutableStateOf("") }
    var goalBlocker by remember { mutableStateOf("") }

    val q = GoalOSConstants.DNA_QUESTIONS[index]

    Column(modifier.fillMaxSize().padding(20.dp)) {
        Text("← Back", modifier = Modifier.clickable(onClick = onBack), color = GoalOSTokens.TextMuted)
        Text("Productivity DNA · ${index + 1}/${GoalOSConstants.DNA_QUESTIONS.size}", color = GoalOSTokens.Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(q.question, fontSize = 20.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 16.dp))

        when {
            q.isScale -> {
                Slider(energy.toFloat(), onValueChange = { energy = it.toInt() }, valueRange = 1f..5f, steps = 3)
                Text("Energy: $energy/5")
            }
            q.multiSelect -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                q.options.forEach { opt ->
                    ActionChip(opt, distractingApps.contains(opt)) {
                        if (distractingApps.contains(opt)) distractingApps.remove(opt) else distractingApps.add(opt)
                    }
                }
            }
            else -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                q.options.forEach { opt ->
                    val selected = when (q.id) {
                        "distractionTime" -> distractionTime == opt
                        "distractionTrigger" -> distractionTrigger == opt
                        "bestFocusTime" -> bestFocusTime == opt
                        "coachingTone" -> coachingTone == opt
                        "goalBlocker" -> goalBlocker == opt
                        else -> false
                    }
                    ActionChip(opt, selected) {
                        when (q.id) {
                            "distractionTime" -> distractionTime = opt
                            "distractionTrigger" -> distractionTrigger = opt
                            "bestFocusTime" -> bestFocusTime = opt
                            "coachingTone" -> coachingTone = opt
                            "goalBlocker" -> goalBlocker = opt
                        }
                    }
                }
            }
        }

        if (index == GoalOSConstants.DNA_QUESTIONS.lastIndex) {
            HeroCard(modifier = Modifier.padding(vertical = 12.dp)) {
                SectionLabel("AI profile preview")
                Text("High Potential, Low Execution", fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
                Text("You consume strong learning content, but need conversion into daily execution blocks.", color = GoalOSTokens.TextMuted, fontSize = 13.sp)
            }
        }

        val canNext = when (q.id) {
            "distractingApps" -> distractingApps.isNotEmpty()
            "energyLevel" -> true
            else -> when (q.id) {
                "distractionTime" -> distractionTime.isNotEmpty()
                "distractionTrigger" -> distractionTrigger.isNotEmpty()
                "bestFocusTime" -> bestFocusTime.isNotEmpty()
                "coachingTone" -> coachingTone.isNotEmpty()
                "goalBlocker" -> goalBlocker.isNotEmpty()
                else -> false
            }
        }

        PrimaryButton(
            if (index < GoalOSConstants.DNA_QUESTIONS.lastIndex) "Next" else "Generate my roadmap",
            {
                if (index < GoalOSConstants.DNA_QUESTIONS.lastIndex) index++ else {
                    onComplete(DnaAnswers(distractionTime, distractingApps.toList(), distractionTrigger, bestFocusTime, energy, coachingTone, goalBlocker))
                }
            },
            enabled = canNext,
            modifier = Modifier.padding(top = 16.dp)
        )
    }
}

@Composable
private fun PrivacyScreen(modifier: Modifier, onAccept: () -> Unit) {
    Column(modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.SpaceBetween) {
        HeroCard {
            SectionLabel("Trust promise")
            Text("We do not read your private content.", fontSize = 22.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
            Text(GoalOSConstants.PRIVACY_PROMISE, color = GoalOSTokens.TextMuted, modifier = Modifier.padding(top = 12.dp), fontSize = 13.sp, lineHeight = 20.sp)
        }
        GoalOSCard {
            listOf(
                "App usage access" to "Calculate daily screen-time patterns",
                "Notifications" to "Smart reminders and intent gates",
                "Local-first storage" to "Export or delete anytime"
            ).forEach { (title, sub) ->
                Row(Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("✓", color = GoalOSTokens.Primary)
                    Column {
                        Text(title, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        Text(sub, color = GoalOSTokens.TextDim, fontSize = 12.sp)
                    }
                }
            }
        }
        PrimaryButton("Grant safe permissions & continue", onAccept)
    }
}
