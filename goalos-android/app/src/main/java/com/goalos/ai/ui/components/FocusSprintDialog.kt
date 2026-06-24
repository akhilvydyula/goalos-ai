package com.goalos.ai.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun FocusSprintDialog(
    goalTemplate: String?,
    onComplete: (title: String, durationMinutes: Int) -> Unit,
    onDismiss: () -> Unit
) {
    val sprintTitle = when (goalTemplate) {
        "data-engineering-job" -> "SQL Sprint"
        "software-interview" -> "DSA Sprint"
        "founder-mode" -> "Build Sprint"
        else -> "Focus Sprint"
    }
    var duration by remember { mutableIntStateOf(25) }
    var running by remember { mutableStateOf(false) }
    var secondsLeft by remember { mutableIntStateOf(25 * 60) }
    var done by remember { mutableStateOf(false) }

    LaunchedEffect(running, done) {
        if (!running || done) return@LaunchedEffect
        while (secondsLeft > 0 && running) {
            delay(1000)
            secondsLeft--
        }
        if (secondsLeft <= 0) {
            done = true
            running = false
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (done) "Sprint Complete!" else sprintTitle) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                when {
                    done -> Text("+5 to your Goal Alignment Score")
                    running -> Text(
                        "%02d:%02d".format(secondsLeft / 60, secondsLeft % 60),
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                    else -> {
                        Text("Time-boxed goal action. Complete to boost your score.")
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(15, 25, 45, 60).forEach { d ->
                                FilterChip(
                                    selected = duration == d,
                                    onClick = { duration = d },
                                    label = { Text("${d}m") }
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            when {
                done -> TextButton(onClick = { onComplete(sprintTitle, duration) }) { Text("Done") }
                running -> TextButton(onClick = onDismiss) { Text("Minimize") }
                else -> TextButton(onClick = {
                    secondsLeft = duration * 60
                    running = true
                }) { Text("Start Sprint") }
            }
        },
        dismissButton = {
            if (!running && !done) TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
