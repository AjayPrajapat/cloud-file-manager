import { useAuth } from '~/composables/useAuth';

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth();
  nuxtApp.provide('auth', auth);
  // expose globally for api plugin
  // @ts-expect-error runtime injection
  nuxtApp.$auth = auth;
});
