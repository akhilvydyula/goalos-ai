package com.goalos.ai.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.goalos.ai.domain.CoachRole
import com.goalos.ai.domain.ScoreBreakdown
import com.goalos.ai.ui.theme.GoalOSTokens

@Composable
fun GoalOSCard(
    modifier: Modifier = Modifier,
    gradient: Brush? = null,
    content: @Composable () -> Unit
) {
    val shape = RoundedCornerShape(24.dp)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(
                gradient ?: Brush.linearGradient(
                    listOf(Color(0x1FFFFFFF), Color(0x0EFFFFFF))
                )
            )
            .border(1.dp, GoalOSTokens.BorderSoft, shape)
            .padding(16.dp)
    ) { content() }
}

@Composable
fun HeroCard(
    modifier: Modifier = Modifier,
    gradient: Brush? = null,
    content: @Composable () -> Unit
) {
    GoalOSCard(
        modifier = modifier,
        gradient = gradient ?: Brush.linearGradient(
            listOf(
                Color(0x4D2BE7A8),
                Color(0x33FF7AD9),
                Color(0x1AFFFFFF)
            )
        ),
        content = content
    )
}

@Composable
fun ScoreCard(score: ScoreBreakdown, headline: String? = null) {
    GoalOSCard(gradient = GoalOSTokens.scoreCardBrush(score.total)) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Goal Alignment Score", color = GoalOSTokens.TextMuted, style = MaterialTheme.typography.bodySmall)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ScoreRing(score.total)
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    headline?.let {
                        Text(it, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp)
                    }
                    ScoreRow("Goal time", score.goalSupportingTime, 30)
                    ScoreRow("Roadmap", score.roadmapCompletion, 20)
                    ScoreRow("Deep work", score.deepWork, 15)
                    if (score.distractionPenalty < 0) {
                        Text(
                            "Distraction ${score.distractionPenalty} pts",
                            color = GoalOSTokens.Danger,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ScoreRing(total: Int) {
    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(118.dp)) {
        Canvas(Modifier.size(118.dp)) {
            val stroke = 10.dp.toPx()
            drawArc(
                color = Color(0x21FFFFFF),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(stroke, cap = StrokeCap.Round)
            )
            drawArc(
                brush = Brush.sweepGradient(listOf(GoalOSTokens.Primary, GoalOSTokens.Secondary)),
                startAngle = -90f,
                sweepAngle = 360f * (total / 100f),
                useCenter = false,
                style = Stroke(stroke, cap = StrokeCap.Round)
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$total", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = GoalOSTokens.scoreColor(total))
            Text("Goal score", fontSize = 10.sp, color = GoalOSTokens.TextDim)
        }
    }
}

@Composable
private fun ScoreRow(label: String, value: Int, max: Int) {
    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = GoalOSTokens.TextDim, fontSize = 12.sp)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            LinearProgressIndicator(
                progress = { value / max.toFloat() },
                modifier = Modifier
                    .size(width = 56.dp, height = 6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = GoalOSTokens.Primary,
                trackColor = Color(0x1AFFFFFF)
            )
            Text("$value", fontSize = 12.sp)
        }
    }
}

@Composable
fun MetricCard(label: String, value: String, delta: String? = null, positive: Boolean = true, modifier: Modifier = Modifier) {
    GoalOSCard(modifier) {
        Text(label.uppercase(), color = GoalOSTokens.TextDim, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
        Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 6.dp))
        delta?.let {
            Text(
                it,
                color = if (positive) GoalOSTokens.Primary else GoalOSTokens.Danger,
                fontSize = 10.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
fun MobileHeader(title: String, subtitle: String, avatarLabel: String = "AI") {
    Row(
        Modifier.fillMaxWidth().padding(bottom = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, letterSpacing = (-0.5).sp)
            Text(subtitle, color = GoalOSTokens.TextDim, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
        }
        Box(
            Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(GoalOSTokens.CtaGradient),
            contentAlignment = Alignment.Center
        ) {
            Text(avatarLabel, fontWeight = FontWeight.Black, color = GoalOSTokens.Background, fontSize = 14.sp)
        }
    }
}

@Composable
fun GradientTitle(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.headlineLarge.copy(brush = GoalOSTokens.HeroGradient)
    )
}

@Composable
fun SectionLabel(text: String) {
    Text(
        text.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = GoalOSTokens.Primary
    )
}

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = GoalOSTokens.Primary,
            contentColor = GoalOSTokens.Background,
            disabledContainerColor = GoalOSTokens.Primary.copy(alpha = 0.35f),
            disabledContentColor = GoalOSTokens.Background.copy(alpha = 0.6f)
        )
    ) {
        Text(text, modifier = Modifier.padding(vertical = 4.dp), fontWeight = FontWeight.Bold)
    }
}

@Composable
fun SecondaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0x14FFFFFF),
            contentColor = GoalOSTokens.TextPrimary
        )
    ) {
        Text(text, modifier = Modifier.padding(vertical = 4.dp), fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun CoachBubble(text: String) {
    Box(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp, 22.dp, 22.dp, 8.dp))
            .background(GoalOSTokens.CoachBubbleGradient)
            .border(1.dp, Color(0x332BE7A8), RoundedCornerShape(22.dp, 22.dp, 22.dp, 8.dp))
            .padding(14.dp)
    ) {
        Text(text, color = Color(0xE0FFFFFF), fontSize = 13.sp, lineHeight = 19.sp)
    }
}

@Composable
fun UserBubble(text: String) {
    Box(
        Modifier
            .fillMaxWidth(0.85f)
            .clip(RoundedCornerShape(22.dp, 22.dp, 8.dp, 22.dp))
            .background(Color(0x1AFFFFFF))
            .border(1.dp, GoalOSTokens.BorderSoft, RoundedCornerShape(22.dp, 22.dp, 8.dp, 22.dp))
            .padding(12.dp)
    ) {
        Text(text, color = Color(0xDBFFFFFF), fontSize = 12.sp, lineHeight = 18.sp)
    }
}

@Composable
fun ChatMessageBubble(role: CoachRole, text: String) {
    when (role) {
        CoachRole.COACH -> CoachBubble(text)
        CoachRole.USER -> Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
            UserBubble(text)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SuggestionChips(labels: List<String>, onSelect: (String) -> Unit) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(top = 8.dp)
    ) {
        labels.forEach { label ->
            Box(
                Modifier
                    .clip(CircleShape)
                    .background(Color(0x14FFFFFF))
                    .border(1.dp, GoalOSTokens.BorderSoft, CircleShape)
                    .clickable { onSelect(label) }
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoalOSTokens.TextMuted)
            }
        }
    }
}

@Composable
fun ActionChip(label: String, selected: Boolean = false, onClick: () -> Unit) {
    val bg = if (selected) GoalOSTokens.CtaGradient else Brush.linearGradient(listOf(Color(0x14FFFFFF), Color(0x14FFFFFF)))
    Box(
        Modifier
            .clip(CircleShape)
            .background(bg)
            .border(1.dp, if (selected) Color.Transparent else GoalOSTokens.BorderSoft, CircleShape)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Text(
            label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = if (selected) GoalOSTokens.Background else GoalOSTokens.TextMuted
        )
    }
}

@Composable
fun CoachInputBar(
    value: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    placeholder: String = "Ask your coach..."
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0x14FFFFFF))
            .border(1.dp, GoalOSTokens.BorderSoft, RoundedCornerShape(20.dp))
            .padding(horizontal = 14.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.weight(1f).padding(vertical = 10.dp),
            textStyle = MaterialTheme.typography.bodyMedium.copy(color = GoalOSTokens.TextPrimary),
            cursorBrush = SolidColor(GoalOSTokens.Primary),
            singleLine = true,
            decorationBox = { inner ->
                if (value.isEmpty()) {
                    Text(placeholder, color = GoalOSTokens.TextDim, fontSize = 14.sp)
                }
                inner()
            }
        )
        Box(
            Modifier
                .clip(CircleShape)
                .background(GoalOSTokens.CtaGradient)
                .clickable(enabled = value.isNotBlank(), onClick = onSend)
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Text("Send", fontWeight = FontWeight.Bold, color = GoalOSTokens.Background, fontSize = 12.sp)
        }
    }
}

@Composable
fun WeeklyIdentityCard(
    goalTitle: String,
    identity: String,
    averageScore: Int,
    productiveLabel: String,
    reductionPercent: Int
) {
    GoalOSCard(gradient = GoalOSTokens.WeeklyGradient) {
        SectionLabel("This Week")
        Text(identity, fontSize = 28.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
        Text("Goal: $goalTitle", color = GoalOSTokens.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
        Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MetricCard("Score", "$averageScore", modifier = Modifier.weight(1f))
            MetricCard("Goal time", productiveLabel, "+$reductionPercent%", modifier = Modifier.weight(1f))
        }
        Text(
            "Turn screen time into goal time.",
            color = GoalOSTokens.TextDim,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 12.dp)
        )
    }
}
