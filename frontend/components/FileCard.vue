<template>
  <div
    class="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-brand-500 hover:bg-slate-900"
  >
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-2xl">
        <slot name="icon">📄</slot>
      </div>
      <div>
        <p class="text-sm font-semibold text-white">{{ file.name }}</p>
        <p class="text-xs text-slate-400">{{ formattedSize }} · v{{ file.currentVersion?.versionNumber ?? 1 }}</p>
        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="tag in file.tags || []"
            :key="tag"
            class="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-100"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ file: any }>();

const formattedSize = computed(() => {
  const bytes = props.file.size || props.file.currentVersion?.size || 0;
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, exponent)).toFixed(1)} ${units[exponent]}`;
});
</script>
