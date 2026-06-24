package com.goalos.ai.ui.screens

import android.content.Intent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.goalos.ai.domain.AppClassification
import com.goalos.ai.domain.CoachMessage
import com.goalos.ai.domain.CoachRecommendation
import com.goalos.ai.domain.CoachEngine
import com.goalos.ai.domain.DemoData
import com.goalos.ai.domain.ScoreBreakdown
import com.goalos.ai.domain.TrackedApp
import com.goalos.ai.domain.UserState
import com.goalos.ai.domain.WeeklyReport
import com.goalos.ai.ui.components.ActionChip
import com.goalos.ai.ui.components.ChatMessageBubble
import com.goalos.ai.ui.components.CoachInputBar
import com.goalos.ai.ui.components.GoalOSCard
import com.goalos.ai.ui.components.HeroCard
import com.goalos.ai.ui.components.MetricCard
import com.goalos.ai.ui.components.MobileHeader
import com.goalos.ai.ui.components.PrimaryButton
import com.goalos.ai.ui.components.ScoreCard
import com.goalos.ai.ui.components.SectionLabel
import com.goalos.ai.ui.components.SuggestionChips
import com.goalos.ai.ui.components.WeeklyIdentityCard
import com.goalos.ai.ui.theme.GoalOSTokens

@Composable
fun TodayScreen(
    modifier: Modifier,
    state: UserState,
    score: ScoreBreakdown?,
    coach: CoachRecommendation?,
    onSprint: () -> Unit,
    onIntent: (TrackedApp) -> Unit,
    onRefreshUsage: () -> Unit,
    hasPermission: Boolean,
    onRequestPermission: () -> Unit
) {
    val context = LocalContext.current
    val productive = state.apps.filter { it.classification == AppClassification.GOAL_SUPPORTING }.sumOf { it.minutesToday }
    val distracted = state.apps.filter { it.classification == AppClassification.DISTRACTING }.sumOf { it.minutesToday }
    val riskApp = state.apps.filter { it.classification == AppClassification.DISTRACTING || it.classification == AppClassification.MIXED }
        .maxByOrNull { it.minutesToday }

    val scoreHeadline = when {
        score == null -> null
        score.lateNightPenalty < -5 -> "You are aligned, but night scrolling is hurting momentum."
        score.total >= 80 -> "Strong alignment — keep protecting your focus window."
        else -> "You're making progress. One focused sprint can push you to 80+."
    }

    Column(
        modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 12.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        MobileHeader(
            title = "Today",
            subtitle = "${state.goal?.title ?: "Your Goal"} · Day ${(state.roadmapProgress / 3).coerceAtLeast(1)} of ${state.goal?.timelineWeeks ?: 90}",
            avatarLabel = "A"
        )

        if (!hasPermission) {
            GoalOSCard {
                Text("Enable Usage Access", fontWeight = FontWeight.SemiBold)
                Text("See real app usage — no message or content reading.", color = GoalOSTokens.TextMuted, fontSize = 13.sp)
                PrimaryButton("Open Usage Settings", onClick = {
                    context.startActivity(context.packageManager.getLaunchIntentForPackage("com.android.settings")?.apply {
                        action = android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    } ?: Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS))
                    onRefreshUsage()
                }, modifier = Modifier.padding(top = 12.dp))
            }
        } else {
            Text("Real usage data active", color = GoalOSTokens.Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }

        score?.let { ScoreCard(it, headline = scoreHeadline) }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MetricCard("Goal time", DemoData.formatMinutes(productive), "+38m vs yesterday", modifier = Modifier.weight(1f))
            MetricCard("Distracted", DemoData.formatMinutes(distracted), "+18m late night", positive = false, modifier = Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MetricCard("Deep work", "${state.focusSprints.count { it.completedAt != null } * 25}m", "best streak", modifier = Modifier.weight(1f))
            MetricCard("Energy", "${state.energyToday}.${state.moodToday}", "stable", modifier = Modifier.weight(1f))
        }

        coach?.let { c ->
            HeroCard {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
                    Icon(Icons.Default.Bolt, null, tint = GoalOSTokens.Primary)
                    Column {
                        SectionLabel("AI next best action")
                        Text(c.nextAction, modifier = Modifier.padding(top = 8.dp), fontSize = 14.sp, lineHeight = 20.sp)
                        PrimaryButton("Start 25-min sprint", onSprint, modifier = Modifier.padding(top = 12.dp))
                    }
                }
            }
        }

        riskApp?.let { app ->
            GoalOSCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Warning, null, tint = GoalOSTokens.Warning)
                    Text(" Risk window", color = GoalOSTokens.Warning, fontWeight = FontWeight.Medium)
                }
                Text(
                    "${app.name} used ${DemoData.formatMinutes(app.minutesToday)} today.",
                    color = GoalOSTokens.TextMuted,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
                Text(
                    "Open Intent Gate →",
                    color = GoalOSTokens.Secondary,
                    modifier = Modifier.padding(top = 8.dp).clickable { onIntent(app) }
                )
            }
        }

        state.profile?.let {
            GoalOSCard {
                Text("Identity: ${it.identity}", fontWeight = FontWeight.SemiBold, color = GoalOSTokens.Violet)
                Text(it.reminderStrategy, color = GoalOSTokens.TextDim, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
    }
}

@Composable
fun GoalScreen(
    modifier: Modifier,
    state: UserState,
    onClassify: (String, AppClassification) -> Unit,
    onIntent: (TrackedApp) -> Unit,
    hasPermission: Boolean,
    usageIntent: Intent
) {
    Column(modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        MobileHeader(state.goal?.title ?: "Goal", "Roadmap & app classification", "🎯")
        HeroCard {
            Text(state.goal?.title ?: "", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
            Text("Roadmap ${state.roadmapProgress}%", color = GoalOSTokens.Secondary, modifier = Modifier.padding(top = 4.dp))
            LinearProgressIndicator(
                state.roadmapProgress / 100f,
                Modifier.fillMaxWidth().padding(top = 10.dp),
                color = GoalOSTokens.Primary,
                trackColor = Color(0x1AFFFFFF)
            )
        }
        SectionLabel("Classify your apps")
        state.apps.forEach { app ->
            GoalOSCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text(app.name, fontWeight = FontWeight.Medium)
                        Text(DemoData.formatMinutes(app.minutesToday), color = GoalOSTokens.TextDim, fontSize = 12.sp)
                    }
                    if (app.classification == AppClassification.MIXED || app.classification == AppClassification.DISTRACTING) {
                        Text("Intent Gate", color = GoalOSTokens.Secondary, modifier = Modifier.clickable { onIntent(app) })
                    }
                }
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    AppClassification.entries.forEach { cls ->
                        FilterChip(
                            selected = app.classification == cls,
                            onClick = { onClassify(app.id, cls) },
                            label = { Text(cls.name.take(5), fontSize = 10.sp) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CoachScreen(
    modifier: Modifier,
    state: UserState,
    coach: CoachRecommendation?,
    messages: List<CoachMessage>,
    onSend: (String) -> Unit,
    onAction: (String) -> Unit,
    onSprint: () -> Unit,
    onRefresh: () -> Unit
) {
    var input by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.lastIndex)
    }

    LaunchedEffect(Unit) {
        if (messages.isEmpty()) onRefresh()
    }

    Column(modifier.fillMaxSize().imePadding()) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            MobileHeader("AI Coach", "Supportive, not judgmental.", "AI")
        }

        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (messages.isEmpty() && coach != null) {
                item { ChatMessageBubble(com.goalos.ai.domain.CoachRole.COACH, coach.diagnosis) }
            }
            items(messages) { msg -> ChatMessageBubble(msg.role, msg.text) }
            item {
                coach?.let { c ->
                    GoalOSCard {
                        Text("Suggested actions", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        Row(
                            Modifier.padding(top = 10.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CoachEngine.suggestedActions(state, c).take(3).forEach { action ->
                                ActionChip(action, onClick = { onAction(action) })
                            }
                        }
                        PrimaryButton("Start Focus Sprint", onSprint, modifier = Modifier.padding(top = 12.dp))
                    }
                }
            }
        }

        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SuggestionChips(CoachEngine.suggestedPrompts(state)) { prompt ->
                onSend(prompt)
            }
            CoachInputBar(
                value = input,
                onValueChange = { input = it },
                onSend = {
                    onSend(input)
                    input = ""
                }
            )
        }
    }
}

@Composable
fun InsightsScreen(modifier: Modifier, state: UserState, score: ScoreBreakdown?, weekly: WeeklyReport?) {
    Column(modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        MobileHeader("Insights", "Patterns and risk windows", "◌")
        weekly?.let { w ->
            WeeklyIdentityCard(
                goalTitle = state.goal?.title ?: "Your Goal",
                identity = w.identity,
                averageScore = w.averageScore,
                productiveLabel = DemoData.formatMinutes(w.productiveMinutes),
                reductionPercent = w.distractionReductionPercent
            )
        }
        score?.let { s ->
            GoalOSCard {
                Text("Score breakdown", fontWeight = FontWeight.SemiBold)
                Text("Goal time +${s.goalSupportingTime}", modifier = Modifier.padding(top = 8.dp))
                Text("Roadmap +${s.roadmapCompletion}")
                if (s.distractionPenalty < 0) Text("Distraction ${s.distractionPenalty}", color = GoalOSTokens.Danger)
            }
        }
        GoalOSCard {
            SectionLabel("Risk insight")
            Text(
                "Night usage on mixed apps is your biggest score leak. Use Intent Gate before opening YouTube or Instagram after 9 PM.",
                color = GoalOSTokens.TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

@Composable
fun ProfileScreen(modifier: Modifier, state: UserState, weekly: WeeklyReport?, onReset: () -> Unit) {
    Column(modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        MobileHeader("You", "Privacy & identity", "☻")
        HeroCard {
            Text(state.profile?.identity ?: "Your Identity", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text("Tone: ${state.profile?.coachingTone ?: "Supportive"}", color = GoalOSTokens.TextMuted, modifier = Modifier.padding(top = 6.dp))
        }
        weekly?.let {
            WeeklyIdentityCard(
                goalTitle = state.goal?.title ?: "Your Goal",
                identity = it.identity,
                averageScore = it.averageScore,
                productiveLabel = DemoData.formatMinutes(it.productiveMinutes),
                reductionPercent = it.distractionReductionPercent
            )
        }
        GoalOSCard {
            SectionLabel("Privacy promise")
            Text(
                "We do not read messages, typed text, photos, or calls. Usage insights stay for your productivity.",
                color = GoalOSTokens.TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
        PrimaryButton("Delete all data & restart", onReset)
    }
}
