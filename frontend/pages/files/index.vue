<template>
  <div class="mx-auto max-w-6xl px-6 py-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-white">My files</h1>
        <p class="text-sm text-slate-400">Organize your content with folders, tags, and version history.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-brand-500"
          @click="createFolder"
        >
          New Folder
        </button>
        <button class="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600" @click="openUpload">
          Upload
        </button>
      </div>
    </div>

    <div class="mt-6 flex items-center gap-2 text-xs text-slate-400">
      <button class="text-brand-300 hover:text-brand-200" @click="selectFolder(null)">Root</button>
      <span v-for="crumb in breadcrumbs" :key="crumb.id" class="flex items-center gap-2">
        <span>/</span>
        <button class="text-brand-300 hover:text-brand-200" @click="selectFolder(crumb.id)">{{ crumb.name }}</button>
      </span>
    </div>

    <div class="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <FileList :files="files" title="Files" @preview="previewFile" @download="downloadFile">
          <template #toolbar>
            <button
              class="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-brand-500"
              @click="loadFiles"
            >
              Refresh
            </button>
          </template>
          <template #empty>
            Drop files or use the upload button to populate your workspace.
          </template>
        </FileList>
      </div>
      <aside class="space-y-6">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 class="text-sm font-semibold text-white">Folders</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="folder in folders" :key="folder.id" class="flex items-center justify-between text-sm text-slate-200">
              <button class="hover:text-brand-300" @click="selectFolder(folder.id)">{{ folder.name }}</button>
              <span class="text-xs text-slate-500">{{ new Date(folder.createdAt).toLocaleDateString() }}</span>
            </li>
            <li v-if="!folders.length" class="text-xs text-slate-500">No subfolders.</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 class="text-sm font-semibold text-white">Version history</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="version in versionHistory" :key="version.id" class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p class="text-sm text-slate-200">v{{ version.versionNumber }} — {{ version.size }} bytes</p>
              <p class="text-xs text-slate-500">Uploaded {{ new Date(version.createdAt).toLocaleString() }}</p>
            </li>
            <li v-if="!versionHistory.length" class="text-xs text-slate-500">Select a file to inspect its history.</li>
          </ul>
        </div>
      </aside>
    </div>

    <UploadModal :open="uploadOpen" @close="uploadOpen = false" @upload="handleUpload" />
    <PreviewModal :open="previewOpen" :file="selectedFile" @close="closePreview" @download="downloadFile" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { $api } = useApi();

const files = ref<any[]>([]);
const folders = ref<any[]>([]);
const breadcrumbs = ref<any[]>([]);
const versionHistory = ref<any[]>([]);
const selectedFolder = ref<string | null>(null);
const selectedFile = ref<any | null>(null);
const uploadOpen = ref(false);
const previewOpen = ref(false);

const loadFiles = async () => {
  const [{ data: fileData }, { data: folderData }] = await Promise.all([
    $api.get('/files', { params: { folderId: selectedFolder.value ?? undefined } }),
    $api.get('/files/folders', { params: { parentId: selectedFolder.value ?? undefined } }),
  ]);
  files.value = fileData || [];
  folders.value = folderData || [];
  if (selectedFolder.value) {
    const { data } = await $api.get(`/files/folders/${selectedFolder.value}/breadcrumbs`);
    breadcrumbs.value = data || [];
  } else {
    breadcrumbs.value = [];
  }
};

const selectFolder = (id: string | null) => {
  selectedFolder.value = id;
  versionHistory.value = [];
  loadFiles();
};

const createFolder = async () => {
  const name = prompt('Folder name');
  if (!name) return;
  await $api.post('/files/folders', { name, parentId: selectedFolder.value ?? undefined });
  loadFiles();
};

const openUpload = () => {
  uploadOpen.value = true;
};

const handleUpload = async ({ files: uploadFiles, onProgress }: { files: File[]; onProgress: (progress: number, file: File) => void }) => {
  for (const file of uploadFiles) {
    const formData = new FormData();
    formData.append('file', file);
    if (selectedFolder.value) {
      formData.append('folderId', selectedFolder.value);
    }
    await $api.post('/files', formData, {
      onUploadProgress: (event) => {
        if (!event.total) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress, file);
      },
    });
  }
  loadFiles();
  uploadOpen.value = false;
};

const previewFile = async (file: any) => {
  const { data } = await $api.get(`/files/${file.id}`);
  selectedFile.value = data;
  previewOpen.value = true;
  const historyResponse = await $api.get(`/files/${file.id}/versions`);
  versionHistory.value = historyResponse.data || [];
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

onMounted(() => {
  loadFiles();
});
</script>
