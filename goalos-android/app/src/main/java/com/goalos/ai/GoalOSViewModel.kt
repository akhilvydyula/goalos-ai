package com.goalos.ai

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.goalos.ai.data.UsageStatsCollector
import com.goalos.ai.data.UserRepository
import com.goalos.ai.domain.AppClassification
import com.goalos.ai.domain.CoachEngine
import com.goalos.ai.domain.CoachMessage
import com.goalos.ai.domain.CoachRecommendation
import com.goalos.ai.domain.CoachRole
import com.goalos.ai.domain.DnaAnswers
import com.goalos.ai.domain.FocusSprint
import com.goalos.ai.domain.IntentCheckIn
import com.goalos.ai.domain.ScoreBreakdown
import com.goalos.ai.domain.ScoringEngine
import com.goalos.ai.domain.TrackedApp
import com.goalos.ai.domain.UserGoal
import com.goalos.ai.domain.UserState
import com.goalos.ai.domain.WeeklyReport
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Instant

enum class MainTab { TODAY, GOAL, COACH, INSIGHTS, YOU }

class GoalOSViewModel(app: Application) : AndroidViewModel(app) {
    private val repository = UserRepository(app)
    private val usageCollector = UsageStatsCollector(app)

    val userState = repository.state.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        UserState()
    )

    private val _activeTab = MutableStateFlow(MainTab.TODAY)
    val activeTab: StateFlow<MainTab> = _activeTab.asStateFlow()

    private val _intentApp = MutableStateFlow<TrackedApp?>(null)
    val intentApp: StateFlow<TrackedApp?> = _intentApp.asStateFlow()

    private val _showFocusSprint = MutableStateFlow(false)
    val showFocusSprint: StateFlow<Boolean> = _showFocusSprint.asStateFlow()

    private val _score = MutableStateFlow<ScoreBreakdown?>(null)
    val score: StateFlow<ScoreBreakdown?> = _score.asStateFlow()

    private val _coach = MutableStateFlow<CoachRecommendation?>(null)
    val coach: StateFlow<CoachRecommendation?> = _coach.asStateFlow()

    private val _weekly = MutableStateFlow<WeeklyReport?>(null)
    val weekly: StateFlow<WeeklyReport?> = _weekly.asStateFlow()

    private val _coachMessages = MutableStateFlow<List<CoachMessage>>(emptyList())
    val coachMessages: StateFlow<List<CoachMessage>> = _coachMessages.asStateFlow()

    private var coachInitialized = false

    init {
        viewModelScope.launch {
            userState.collect { state ->
                val s = ScoringEngine.calculate(state)
                val c = CoachEngine.recommend(state, s)
                _score.value = s
                _coach.value = c
                _weekly.value = CoachEngine.weeklyReport(state)
                if (state.onboarded && !coachInitialized) {
                    _coachMessages.value = CoachEngine.openingMessages(state, s, c)
                    coachInitialized = true
                }
            }
        }
    }

    fun sendCoachMessage(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return
        val state = userState.value
        val s = _score.value ?: ScoringEngine.calculate(state)
        val c = _coach.value ?: CoachEngine.recommend(state, s)

        _coachMessages.value = _coachMessages.value + CoachMessage(CoachRole.USER, trimmed)
        val reply = CoachEngine.replyTo(trimmed, state, s, c)
        _coachMessages.value = _coachMessages.value + CoachMessage(CoachRole.COACH, reply)
    }

    fun handleCoachAction(action: String, onSprint: () -> Unit) {
        when {
            action.contains("sprint", ignoreCase = true) -> onSprint()
            action.contains("tomorrow plan", ignoreCase = true) || action.contains("Show tomorrow", ignoreCase = true) ->
                sendCoachMessage("show tomorrow plan")
            action.contains("Block", ignoreCase = true) ->
                sendCoachMessage("help me block distracting apps at night")
            else -> sendCoachMessage(action)
        }
    }

    fun refreshCoachChat() {
        val state = userState.value
        val s = ScoringEngine.calculate(state)
        val c = CoachEngine.recommend(state, s)
        _coachMessages.value = CoachEngine.openingMessages(state, s, c)
        coachInitialized = true
    }

    fun setTab(tab: MainTab) { _activeTab.value = tab }

    fun saveGoal(goal: UserGoal) = update { it.copy(goal = goal) }

    fun saveDna(dna: DnaAnswers) = update {
        val profile = ScoringEngine.deriveProfile(dna)
        it.copy(dna = dna, profile = profile, energyToday = dna.energyLevel, moodToday = (dna.energyLevel + 1).coerceAtMost(5))
    }

    fun completeOnboarding() = update {
        it.copy(onboarded = true, privacyAccepted = true, apps = it.apps.ifEmpty { com.goalos.ai.domain.DemoData.generateApps() })
    }

    fun classifyApp(appId: String, classification: AppClassification) = update {
        it.copy(apps = it.apps.map { app -> if (app.id == appId) app.copy(classification = classification) else app })
    }

    fun openIntentGate(app: TrackedApp) { _intentApp.value = app }

    fun closeIntentGate() { _intentApp.value = null }

    fun recordIntent(appId: String, reason: String, aligned: Boolean) {
        update {
            it.copy(intentCheckIns = it.intentCheckIns + IntentCheckIn(appId, reason, aligned, Instant.now().toString()))
        }
        closeIntentGate()
    }

    fun openFocusSprint() { _showFocusSprint.value = true }

    fun closeFocusSprint() { _showFocusSprint.value = false }

    fun completeFocusSprint(title: String, durationMinutes: Int) {
        update {
            it.copy(
                focusSprints = it.focusSprints + FocusSprint(
                    id = "sprint-${System.currentTimeMillis()}",
                    title = title,
                    durationMinutes = durationMinutes,
                    completedAt = Instant.now().toString(),
                    scoreBoost = if (durationMinutes >= 45) 8 else if (durationMinutes >= 25) 5 else 3
                ),
                roadmapProgress = (it.roadmapProgress + 5).coerceAtMost(100)
            )
        }
        closeFocusSprint()
    }

    fun hasUsagePermission() = usageCollector.hasUsagePermission()

    fun usageSettingsIntent(): Intent = usageCollector.usageSettingsIntent()

    fun refreshUsage() = viewModelScope.launch {
        val current = userState.value
        val apps = usageCollector.collectTodayApps(current.apps)
        update { it.copy(apps = apps, usagePermissionGranted = usageCollector.hasUsagePermission()) }
    }

    fun markUsagePermissionGranted() = update { it.copy(usagePermissionGranted = usageCollector.hasUsagePermission()) }

    fun resetAll() = viewModelScope.launch {
        coachInitialized = false
        _coachMessages.value = emptyList()
        repository.reset()
    }

    private fun update(transform: (UserState) -> UserState) {
        viewModelScope.launch {
            repository.save(transform(userState.value))
        }
    }
}
