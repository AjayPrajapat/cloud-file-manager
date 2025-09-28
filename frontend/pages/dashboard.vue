<template>
  <div class="mx-auto max-w-6xl px-6 py-10">
    <section class="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8">
      <h1 class="text-3xl font-semibold text-white">Good to see you, {{ auth.user.value?.name || 'Explorer' }} 👋</h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-400">
        Manage your documents securely in the cloud, collaborate effortlessly, and keep track of every change across your
        workspace.
      </p>
      <div class="mt-8 grid gap-6 md:grid-cols-3">
        <div v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p class="text-xs uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
          <p class="mt-2 text-3xl font-semibold text-white">{{ stat.value }}</p>
        </div>
      </div>
    </section>

    <section class="mt-10 grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 class="text-lg font-semibold text-white">Recent activity</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="entry in auditLog" :key="entry.id" class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p class="text-sm text-slate-200">{{ entry.action }}</p>
            <p class="text-xs text-slate-500">{{ new Date(entry.createdAt).toLocaleString() }}</p>
          </li>
        </ul>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 class="text-lg font-semibold text-white">Shared with you</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="share in shared" :key="share.id" class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p class="text-sm text-slate-200">{{ share.file.name }}</p>
            <p class="text-xs text-slate-500">Permission: {{ share.permission }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const auth = useAuth();
const { $api } = useApi();

const stats = ref([
  { label: 'Storage Used', value: '—' },
  { label: 'Files Uploaded', value: '—' },
  { label: 'Items Shared', value: '—' },
]);
const auditLog = ref<any[]>([]);
const shared = ref<any[]>([]);

onMounted(async () => {
  const [filesResponse, auditResponse, sharedResponse] = await Promise.all([
    $api.get('/files'),
    $api.get('/files/audit/logs'),
    $api.get('/files/shared-with-me'),
  ]);
  const files = filesResponse.data || [];
  auditLog.value = auditResponse.data || [];
  shared.value = sharedResponse.data || [];

  stats.value = [
    {
      label: 'Storage Used',
      value: files.reduce((total: number, file: any) => total + (file.size || 0), 0) / (1024 * 1024) < 1
        ? `${files.reduce((total: number, file: any) => total + (file.size || 0), 0)} B`
        : `${(files.reduce((total: number, file: any) => total + (file.size || 0), 0) / (1024 * 1024)).toFixed(1)} MB`,
    },
    { label: 'Files Uploaded', value: files.length },
    { label: 'Items Shared', value: shared.value.length },
  ];
});
</script>
