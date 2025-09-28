<template>
  <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6">
    <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
      <h1 class="text-2xl font-semibold text-white">Welcome back</h1>
      <p class="mt-1 text-sm text-slate-400">Sign in to access your cloud workspace.</p>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1">
          <label class="text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div v-if="mode === 'register'" class="space-y-1">
          <label class="text-xs font-medium uppercase tracking-wide text-slate-400">Full name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium uppercase tracking-wide text-slate-400">Password</label>
          <input
            v-model="form.password"
            type="password"
            minlength="8"
            required
            class="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          class="w-full rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-slate-500">
        {{ mode === 'login' ? "New to Nimbus Drive?" : 'Already have an account?' }}
        <button class="font-medium text-brand-300 hover:text-brand-200" @click="toggleMode">
          {{ mode === 'login' ? 'Create an account' : 'Sign in' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const mode = ref<'login' | 'register'>('login');
const form = reactive({ email: '', password: '', name: '' });
const loading = ref(false);
const auth = useAuth();
const router = useRouter();
const toast = useToast();

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (mode.value === 'login') {
      await auth.login({ email: form.email, password: form.password });
    } else {
      await auth.register({ email: form.email, password: form.password, name: form.name });
    }
    router.push('/dashboard');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Authentication failed');
  } finally {
    loading.value = false;
  }
};
</script>
