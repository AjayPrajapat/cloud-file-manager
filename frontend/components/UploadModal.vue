<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
        <div class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Upload files</h3>
            <button class="text-slate-400 hover:text-white" @click="$emit('close')">✕</button>
          </div>
          <div
            class="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 text-center"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileDialog"
            :class="{ 'border-brand-500 bg-brand-500/10': dragging }"
          >
            <p class="text-sm text-slate-300">Drag and drop files here or click to browse</p>
            <p class="text-xs text-slate-500">Up to 200MB per file</p>
          </div>
          <input ref="input" class="hidden" type="file" multiple @change="handleInput" />

          <div v-if="queue.length" class="mt-4 space-y-3">
            <div v-for="item in queue" :key="item.id" class="rounded-lg border border-slate-800 p-3">
              <div class="flex items-center justify-between text-sm text-slate-200">
                <span>{{ item.file.name }}</span>
                <span>{{ Math.round(item.progress) }}%</span>
              </div>
              <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div class="h-full bg-brand-500 transition-all" :style="{ width: item.progress + '%' }" />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200" @click="$emit('close')">
              Cancel
            </button>
            <button
              class="rounded-md bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              :disabled="!queue.length"
              @click="startUpload"
            >
              Start upload
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  close: [];
  upload: [payload: { files: File[]; onProgress: (progress: number, file: File) => void }];
}>();

const input = ref<HTMLInputElement>();
const dragging = ref(false);
const queue = reactive<{ id: string; file: File; progress: number }[]>([]);

watch(
  () => props.open,
  (value) => {
    if (!value) {
      queue.splice(0, queue.length);
    }
  },
);

const triggerFileDialog = () => {
  input.value?.click();
};

const handleDrop = (event: DragEvent) => {
  dragging.value = false;
  if (!event.dataTransfer?.files?.length) return;
  addFiles(Array.from(event.dataTransfer.files));
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  addFiles(Array.from(target.files));
  target.value = '';
};

const addFiles = (files: File[]) => {
  files.forEach((file) => {
    queue.push({ id: crypto.randomUUID(), file, progress: 0 });
  });
};

const updateProgress = (file: File, progress: number) => {
  const item = queue.find((entry) => entry.file === file);
  if (item) {
    item.progress = progress;
  }
};

const startUpload = () => {
  emit('upload', {
    files: queue.map((item) => item.file),
    onProgress: (progress, file) => updateProgress(file, progress),
  });
};
</script>
