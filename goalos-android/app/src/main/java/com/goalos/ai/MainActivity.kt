package com.goalos.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.goalos.ai.ui.GoalOSApp
import com.goalos.ai.ui.theme.GoalOSTheme

class MainActivity : ComponentActivity() {
    private val viewModel: GoalOSViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GoalOSTheme {
                GoalOSApp(vm = viewModel, modifier = Modifier.fillMaxSize())
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.markUsagePermissionGranted()
        viewModel.refreshUsage()
    }
}
