import { create } from 'zustand';
import type { User, DoctorSettings } from '../types';

interface UserState {
  user: User | null;
  doctorSettings: DoctorSettings | null;
  setUser: (user: User | null) => void;
  setDoctorSettings: (settings: DoctorSettings) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  doctorSettings: null,
  setUser: (user) => set({ user }),
  setDoctorSettings: (settings) => set({ doctorSettings: settings }),
}));