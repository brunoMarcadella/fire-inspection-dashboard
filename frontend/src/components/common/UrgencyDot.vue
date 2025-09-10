<script setup lang="ts">
import type { Urgency } from '../../types';

const props = defineProps<{ value: Urgency }>();

const color = {
  critical: 'bg-red-500',
  overdue: 'bg-orange-500',
  soon: 'bg-yellow-400',
  normal: 'bg-teal-500/60',
}[props.value];
</script>

<template>
  <span class="inline-block h-2.5 w-2.5 rounded-full" :class="color"></span>
</template>
