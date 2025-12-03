import { useState, useEffect, useCallback } from "react";
import { Session } from "@/types/session";
import {
  getSessions,
  getSessionById,
  addSession,
  deleteSession,
} from "@/data/localStorageClient";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(() => {
    setLoading(true);
    const data = getSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const saveSession = useCallback(
    (session: Session) => {
      addSession(session);
      loadSessions();
    },
    [loadSessions]
  );

  const removeSession = useCallback(
    (id: string) => {
      deleteSession(id);
      loadSessions();
    },
    [loadSessions]
  );

  const findSession = useCallback((id: string) => {
    return getSessionById(id);
  }, []);

  return {
    sessions,
    loading,
    saveSession,
    removeSession,
    findSession,
    refresh: loadSessions,
  };
}

export function useSessionStats(sessions: Session[]) {
  const totalSessions = sessions.length;

  const totalMinutes = Math.round(
    sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  const averageFluency =
    sessions.length > 0
      ? (
          sessions.reduce((acc, s) => acc + s.feedback.fluencyScore, 0) /
          sessions.length
        ).toFixed(1)
      : "0";

  // Calculate streak
  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = sessions
      .map((s) => {
        const d = new Date(s.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = today.getTime();

    for (const sessionDate of sessionDates) {
      if (sessionDate === currentDate) {
        streak++;
        currentDate -= 86400000; // Subtract one day
      } else if (sessionDate === currentDate - 86400000) {
        // Allow for yesterday if today hasn't been practiced yet
        streak++;
        currentDate = sessionDate - 86400000;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  const todayMinutes = Math.round(
    sessions
      .filter((s) => {
        const sessionDate = new Date(s.createdAt);
        const today = new Date();
        return sessionDate.toDateString() === today.toDateString();
      })
      .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  return {
    totalSessions,
    totalMinutes,
    averageFluency,
    streak,
    todayMinutes,
  };
}
