import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: config.public.apiBase,
  });

  api.interceptors.request.use((request) => {
    const token = process.client ? localStorage.getItem('token') : undefined;
    if (token) {
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (process.client) {
          localStorage.removeItem('token');
          nuxtApp.$auth?.logout();
          navigateTo('/login');
        }
      }
      return Promise.reject(error);
    },
  );

  return {
    provide: {
      api,
    },
  };
});
