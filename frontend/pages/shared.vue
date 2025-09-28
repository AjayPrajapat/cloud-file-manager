<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-white">Shared workspace</h1>
      <p class="text-sm text-slate-400">Files shared with you and collaborations in progress.</p>
    </header>
    <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <FileList :files="sharedFiles" title="Shared files" @preview="previewFile" @download="downloadFile">
        <template #empty>No shared items yet.</template>
      </FileList>
    </div>
    <PreviewModal :open="previewOpen" :file="selectedFile" @close="closePreview" @download="downloadFile" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { $api } = useApi();
const sharedFiles = ref<any[]>([]);
const previewOpen = ref(false);
const selectedFile = ref<any | null>(null);

const loadShared = async () => {
  const { data } = await $api.get('/files/shared-with-me');
  sharedFiles.value = (data || []).map((entry: any) => entry.file);
};

const previewFile = async (file: any) => {
  const { data } = await $api.get(`/files/${file.id}`);
  selectedFile.value = data;
  previewOpen.value = true;
};

const closePreview = () => {
  previewOpen.value = false;
  selectedFile.value = null;
};

const downloadFile = async (file: any) => {
  const { data } = await $api.get(`/files/${file.id}`);
  if (process.client) {
    window.open(data.signedUrl, '_blank');
  }
};

onMounted(loadShared);
</script>
