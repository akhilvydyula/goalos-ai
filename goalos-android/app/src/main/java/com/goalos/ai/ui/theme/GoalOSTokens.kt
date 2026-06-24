package com.goalos.ai.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/**
 * GoalOS AI design tokens — aligned with preview.html v2 prototype.
 */
object GoalOSTokens {
    val Background = Color(0xFF061018)
    val BackgroundDeep = Color(0xFF05070B)
    val Surface = Color(0xFF0A1222)
    val SurfaceGlass = Color(0x14FFFFFF)
    val Border = Color(0x24FFFFFF)
    val BorderSoft = Color(0x14FFFFFF)

    val Primary = Color(0xFF2BE7A8)
    val PrimarySoft = Color(0xFF68A7FF)
    val Secondary = Color(0xFF68A7FF)
    val Violet = Color(0xFFA78BFA)
    val Pink = Color(0xFFFF7AD9)
    val Orange = Color(0xFFFFC46B)

    val TextPrimary = Color(0xFFF6FBFF)
    val TextMuted = Color(0xADF6FBFF)
    val TextDim = Color(0x75F6FBFF)

    val ScoreHigh = Color(0xFF2BE7A8)
    val ScoreMid = Color(0xFFFFC46B)
    val ScoreLow = Color(0xFFFF6B6B)
    val Warning = Color(0xFFFFC46B)
    val Danger = Color(0xFFFF6B6B)

    val HeroGradient = Brush.linearGradient(listOf(Color(0xFFFFFFFF), Primary, Secondary, Pink))
    val CtaGradient = Brush.linearGradient(listOf(Primary, Secondary))
    val CoachBubbleGradient = Brush.linearGradient(
        listOf(Color(0x292BE7A8), Color(0x1F68A7FF))
    )
    val ScoreGradient = Brush.sweepGradient(listOf(Primary, Secondary, Violet, Primary))
    val CardGradientHigh = Brush.linearGradient(listOf(Color(0x332BE7A8), Color(0x110A1222)))
    val CardGradientMid = Brush.linearGradient(listOf(Color(0x33FFC46B), Color(0x110A1222)))
    val CardGradientLow = Brush.linearGradient(listOf(Color(0x33FF6B6B), Color(0x110A1222)))
    val WeeklyGradient = Brush.linearGradient(listOf(Color(0x332BE7A8), Color(0x1168A7FF)))
    val ScreenGradient = Brush.verticalGradient(
        listOf(Color(0x33081C2E), Background, BackgroundDeep)
    )

    fun scoreColor(total: Int) = when {
        total >= 80 -> ScoreHigh
        total >= 60 -> ScoreMid
        else -> ScoreLow
    }

    fun scoreCardBrush(total: Int) = when {
        total >= 80 -> CardGradientHigh
        total >= 60 -> CardGradientMid
        else -> CardGradientLow
    }
}
