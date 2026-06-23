import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import type { UserProfile } from '../types/index.js';
import api from '../api/axios.js';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isTeacher: () => get().profile?.role === 'teacher',
  isStudent: () => get().profile?.role === 'student',

  setFirebaseUser: (user) => set({
    firebaseUser: user,
    isAuthenticated: !!user
  }),

  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),

  loadProfile: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ profile: data as UserProfile });
    } catch (error: any) {
      // Игнорируем 404 ошибку в консоли, так как она ожидаема в момент регистрации
      if (error.response?.status !== 404) {
        console.error('Ошибка загрузки профиля:', error);
      }
      set({ profile: null });
    }
  },

  logout: async () => {
    await auth.signOut();
    set({ firebaseUser: null, profile: null, isAuthenticated: false });
  }
}));

// Подписка на изменения авторизации
onAuthStateChanged(auth, async (user) => {
  const store = useAuthStore.getState();
  store.setFirebaseUser(user);

  if (user) {
    await store.loadProfile();
  } else {
    store.setProfile(null);
  }

  store.setLoading(false);
});