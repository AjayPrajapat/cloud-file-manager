<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
        <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h3 class="text-sm font-semibold text-white">{{ file?.name }}</h3>
              <p class="text-xs text-slate-500">Preview</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-brand-500 hover:text-white"
                @click="$emit('download', file)"
              >
                Download
              </button>
              <button class="text-slate-500 hover:text-white" @click="$emit('close')">✕</button>
            </div>
          </div>

          <div class="max-h-[70vh] overflow-auto bg-slate-950">
            <img
              v-if="file?.mimeType?.startsWith('image/')"
              :src="file?.signedUrl"
              :alt="file?.name"
              class="mx-auto max-h-[70vh] object-contain"
            />
            <iframe
              v-else-if="file?.mimeType === 'application/pdf'"
              :src="file?.signedUrl"
              class="h-[70vh] w-full"
            />
            <pre v-else class="p-6 text-sm text-slate-200 whitespace-pre-wrap">{{ textContent }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; file?: any }>();
const textContent = computed(() => props.file?.previewText || 'Preview not available.');
</script>
