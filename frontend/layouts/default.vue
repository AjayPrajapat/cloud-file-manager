<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center gap-2 text-xl font-semibold text-white">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">☁️</span>
          Nimbus Drive
        </NuxtLink>
        <SearchBar v-if="isAuthenticated" class="hidden md:block w-80" />
        <div class="flex items-center gap-3">
          <NuxtLink v-if="!isAuthenticated" to="/login" class="text-sm text-slate-200 hover:text-white">
            Login
          </NuxtLink>
          <button
            v-else
            class="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, logout } = useAuth();
</script>
