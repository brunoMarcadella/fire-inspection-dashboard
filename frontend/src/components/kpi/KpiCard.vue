<script setup lang="ts">
defineProps<{ label: string; value?: number | string; loading?: boolean }>();
</script>

<template>
  <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
    <div class="text-xs text-slate-300/70">{{ label }}</div>
    <div class="text-2xl font-bold mt-1">
      <span v-if="loading" class="inline-block h-6 w-16 animate-pulse bg-white/10 rounded"></span>
      <span v-else>{{ value ?? '—' }}</span>
    </div>
  </div>
</template>
