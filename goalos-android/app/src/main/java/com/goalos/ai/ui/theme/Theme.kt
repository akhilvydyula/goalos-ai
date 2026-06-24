package com.goalos.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private val GoalOSColors = darkColorScheme(
    primary = GoalOSTokens.Primary,
    onPrimary = GoalOSTokens.Background,
    secondary = GoalOSTokens.Secondary,
    background = GoalOSTokens.Background,
    surface = GoalOSTokens.Surface,
    onBackground = GoalOSTokens.TextPrimary,
    onSurface = GoalOSTokens.TextPrimary,
    surfaceVariant = Color(0xFF1A1D2E),
    outline = GoalOSTokens.Border
)

private val GoalOSTypography = Typography(
    headlineLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 32.sp, letterSpacing = (-0.5).sp),
    titleLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 22.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 18.sp),
    labelSmall = TextStyle(fontWeight = FontWeight.Medium, fontSize = 11.sp, letterSpacing = 1.5.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontSize = 13.sp, lineHeight = 18.sp)
)

@Composable
fun GoalOSTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = GoalOSColors,
        typography = GoalOSTypography,
        content = content
    )
}
