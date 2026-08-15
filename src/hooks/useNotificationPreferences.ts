import { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

export function useNotificationPreferences() {
  const preferences = useNotificationStore((state) => state.preferences);
  const isPreferencesOpen = useNotificationStore((state) => state.isPreferencesOpen);
  const fetchPreferences = useNotificationStore((state) => state.fetchPreferences);
  const updatePreferences = useNotificationStore((state) => state.updatePreferences);
  const setPreferencesOpen = useNotificationStore((state) => state.setPreferencesOpen);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isPreferencesOpen,
    fetchPreferences,
    updatePreferences,
    setPreferencesOpen,
  };
}
