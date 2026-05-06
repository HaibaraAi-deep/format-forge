import { create } from 'zustand';

interface SettingsState {
  autoConvert: boolean;
  setAutoConvert: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  autoConvert: true,
  setAutoConvert: (value) => set({ autoConvert: value }),
}));
