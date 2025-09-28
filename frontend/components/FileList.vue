<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
      <slot name="toolbar" />
    </div>
    <div v-if="files?.length" class="space-y-3">
      <FileCard v-for="file in files" :key="file.id" :file="file">
        <template #actions>
          <button
            class="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-brand-500 hover:text-white"
            @click="$emit('preview', file)"
          >
            Preview
          </button>
          <button
            class="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-brand-500 hover:text-white"
            @click="$emit('download', file)"
          >
            Download
          </button>
        </template>
      </FileCard>
    </div>
    <p v-else class="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
      <slot name="empty">No files yet. Upload something to get started.</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ files: any[]; title?: string }>();
defineEmits(['preview', 'download']);
</script>
