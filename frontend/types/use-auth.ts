import type { Ref, ComputedRef } from 'vue';

type User = {
  id: string;
  email: string;
  name: string;
};

export interface UseAuthReturn {
  user: Ref<User | null>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  isAuthenticated: ComputedRef<boolean>;
}
