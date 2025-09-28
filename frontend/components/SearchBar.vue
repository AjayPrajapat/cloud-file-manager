<template>
  <div class="relative">
    <input
      v-model="term"
      class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      type="search"
      placeholder="Search files"
      @keyup.enter="performSearch"
    />
    <div v-if="results.length && open" class="absolute top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
      <button
        v-for="item in results"
        :key="item.id"
        class="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-brand-500/20"
        @click="navigateToFile(item.id)"
      >
        <p class="font-medium">{{ item.name }}</p>
        <p class="text-xs text-slate-500">Updated {{ new Date(item.updatedAt).toLocaleString() }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const term = ref('');
const results = ref<any[]>([]);
const open = ref(false);
const router = useRouter();
const { $api } = useApi();

const performSearch = async () => {
  if (!term.value.trim()) {
    results.value = [];
    open.value = false;
    return;
  }
  const { data } = await $api.get('/search', { params: { q: term.value } });
  results.value = data || [];
  open.value = true;
};

const navigateToFile = (id: string) => {
  open.value = false;
  router.push({ path: '/files', query: { fileId: id } });
};
</script>
