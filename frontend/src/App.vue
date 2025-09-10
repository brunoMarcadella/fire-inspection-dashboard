<script setup lang="ts"></script>

<template>
  <div class="min-h-screen flex flex-col">
    <BaseHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <BaseFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from './components/layout/BaseHeader.vue';
import BaseFooter from './components/layout/BaseFooter.vue';

export default defineComponent({
  components: { BaseHeader, BaseFooter },
});
</script>
