import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import type { SettingsContextType, SettingsType } from '../../../types';
import api from '../api';
import defaultSettings from '../utils/defaultSettings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        api.getSettings().then((res) => {
          setSettings(res.data);
        });
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings().catch();
  }, []);

  const updateField = (newSetting: Partial<SettingsType>) => {
    setSettings((prevSettings: SettingsType) => ({
      ...prevSettings,
      ...newSetting,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      api.setSettings(settings).catch();
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateField, saveSettings, loading, saving }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
