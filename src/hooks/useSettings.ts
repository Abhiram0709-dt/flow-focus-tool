import { useState, useEffect, useCallback } from "react";
import { Settings } from "@/types/session";
import {
  getSettings,
  saveSettings as persistSettings,
} from "@/data/localStorageClient";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getSettings();
    setSettings(data);
    setLoading(false);
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    persistSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      const newSettings = { ...settings, [key]: value };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  return {
    settings,
    loading,
    saveSettings,
    updateSetting,
  };
}
