import { Session, Settings } from "@/types/session";

const SESSIONS_KEY = "communicationCoach:sessions";
const SETTINGS_KEY = "communicationCoach:settings";

const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 20,
  focusArea: "overall",
  showMotivation: true,
};

export function getSettings(): Settings {
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

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function getSessions(): Session[] {
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

export function getSessionById(id: string): Session | undefined {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id);
}

export function addSession(session: Session): void {
  try {
    const sessions = getSessions();
    sessions.unshift(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

export function deleteSession(id: string): void {
  try {
    const sessions = getSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
}
