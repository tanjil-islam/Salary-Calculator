// src/storage/history.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "salary_history_v1";

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) =>
      (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1
    );
  } catch (e) {
    console.warn("getHistory error", e);
    return [];
  }
}

export async function addHistoryEntry(entry) {
  try {
    const existing = await getHistory();
    const withId = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...entry,
    };
    const next = [withId, ...existing];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return withId;
  } catch (e) {
    console.warn("addHistoryEntry error", e);
    throw e;
  }
}

// ✅ NEW: delete by id
export async function deleteHistoryEntry(id) {
  try {
    const existing = await getHistory();
    const next = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("deleteHistoryEntry error", e);
  }
}

// (optional) clear all
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn("clearHistory error", e);
  }
}
