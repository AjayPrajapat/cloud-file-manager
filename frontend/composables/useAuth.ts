import type { Ref } from 'vue';

type User = {
  id: string;
  email: string;
  name: string;
};

const user = ref<User | null>(null) as Ref<User | null>;
const isReady = ref(false);

export function useAuth() {
  const getApi = () => useNuxtApp().$api;

  const setUserFromStorage = () => {
    if (!process.client) return;
    const stored = localStorage.getItem('user');
    if (stored) {
      user.value = JSON.parse(stored);
    }
    isReady.value = true;
  };

  const login = async (credentials: { email: string; password: string }) => {
    const { data } = await getApi().post('/auth/login', credentials);
    if (process.client) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    user.value = data.user;
    return data.user;
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    await getApi().post('/auth/register', payload);
    return login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    user.value = null;
  };

  const isAuthenticated = computed(() => Boolean(user.value));

  if (!isReady.value) {
    setUserFromStorage();
  }

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated,
  };
}

export function useApi() {
  const nuxtApp = useNuxtApp();
  return {
    $api: nuxtApp.$api,
  };
}
