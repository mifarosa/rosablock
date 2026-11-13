import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEMES, type ThemeColors } from '../constants/colors';
import { translate, type Translate } from '../i18n/strings';
import { defaultSettings, loadSettings, saveSettings, type Settings } from '../settings/settings';
import { setHapticsEnabled } from '../utils/haptics';
import { setSoundEnabled } from '../utils/sound';

interface AppContextValue {
  settings: Settings;
  /** Changes some settings and saves them. */
  update: (patch: Partial<Settings>) => void;
  theme: ThemeColors;
  t: Translate;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadSettings().then((loaded) => {
      if (!alive) return;
      setSettings(loaded);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // The haptics and sound helpers are plain modules, so they are told about the switches here.
  useEffect(() => {
    setHapticsEnabled(settings.haptics);
    setSoundEnabled(settings.sound);
  }, [settings.haptics, settings.sound]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      update,
      theme: THEMES[settings.theme],
      t: (key, params) => translate(settings.language, key, params),
    }),
    [settings, update],
  );

  // Wait for the saved settings so the first frame already has the right theme and language.
  if (!ready) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
