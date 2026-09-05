const SESSIONS_KEY = "communicationCoach:sessions";
const SETTINGS_KEY = "communicationCoach:settings";

const DEFAULT_SETTINGS = {
  dailyGoalMinutes: 20,
  focusArea: "overall",
  showMotivation: true,
};

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to parse settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function getSessions() {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to parse sessions:", error);
  }
  return [];
}

export function getSessionById(id) {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id);
}

export function addSession(session) {
  try {
    const sessions = getSessions();
    sessions.unshift(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

export function deleteSession(id) {
  try {
    const sessions = getSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
}

