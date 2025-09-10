<script setup lang="ts"></script>

<template>
  <div class="text-xs text-slate-300/70 flex flex-wrap gap-4">
    <span class="inline-flex items-center gap-2">
      <i class="h-2.5 w-2.5 rounded-full bg-red-500"></i> Critical
    </span>
    <span class="inline-flex items-center gap-2">
      <i class="h-2.5 w-2.5 rounded-full bg-orange-500"></i> Overdue
    </span>
    <span class="inline-flex items-center gap-2">
      <i class="h-2.5 w-2.5 rounded-full bg-yellow-400"></i> Soon
    </span>
    <span class="inline-flex items-center gap-2">
      <i class="h-2.5 w-2.5 rounded-full bg-teal-500/60"></i> Normal
    </span>
  </div>
</template>
