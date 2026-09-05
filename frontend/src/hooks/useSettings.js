import { useState, useEffect, useCallback } from "react";
import { fetchSettings, updateSettingsApi } from "@/api/serverApi.js";

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const saveSettings = useCallback(async (newSettings) => {
    const updated = await updateSettingsApi(newSettings);
    setSettings(updated);
  }, []);

  const updateSetting = useCallback(
    async (key, value) => {
      if (!settings) return;
      const newSettings = { ...settings, [key]: value };
      // Optimistically update UI immediately
      setSettings(newSettings);
      // Then save to backend
      try {
        await saveSettings(newSettings);
      } catch (error) {
        // Revert on error
        setSettings(settings);
        throw error;
      }
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

