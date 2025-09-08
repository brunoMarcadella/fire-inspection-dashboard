<script setup lang="ts">
defineProps<{ class?: string }>();
</script>

<template>
  <div
    :class="['animate-pulse rounded-lg bg-white/10 bg-gradient-to-r from-white/[.06] via-white/[.12] to-white/[.06]', $props.class]"
    role="status" aria-label="Carregando"
  />
</template>
