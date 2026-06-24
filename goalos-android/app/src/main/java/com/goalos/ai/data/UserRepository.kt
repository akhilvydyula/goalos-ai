package com.goalos.ai.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.goalos.ai.domain.DemoData
import com.goalos.ai.domain.UserState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore("goalos_state")

class UserRepository(private val context: Context) {
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val key = stringPreferencesKey("user_state")

    val state: Flow<UserState> = context.dataStore.data.map { prefs ->
        prefs[key]?.let { json.decodeFromString<UserState>(it) } ?: defaultState()
    }

    suspend fun save(state: UserState) {
        context.dataStore.edit { it[key] = json.encodeToString(state) }
    }

    suspend fun reset() {
        context.dataStore.edit { it.remove(key) }
    }

    private fun defaultState() = UserState(apps = DemoData.generateApps())
}
