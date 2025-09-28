export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth();
  if (process.server) {
    return;
  }
  if (!auth.isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login');
  }
  if (auth.isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});
