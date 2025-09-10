<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: { q: string; status: string; due: string };
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: { q: string; status: string; due: string }): void;
  (e: 'submit'): void;
}>();

const local = ref({ ...props.modelValue });
watch(() => props.modelValue, v => { local.value = { ...v }; });

function submit() { emit('update:modelValue', local.value); emit('submit'); }
</script>

<template>
  <div class="bg-petrol border border-navy-800 rounded-xxl p-4 shadow-soft">
    <div class="flex flex-col md:flex-row gap-3">
      <input
        v-model="local.q"
        id="search"
        placeholder="Buscar (ex.: Extintor, Hospital...)"
        class="border rounded-xxl px-3 py-2 w-full md:w-80 placeholder:text-slate-300/60
               focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Campo de busca"
      />
      <select v-model="local.status"
        class="border rounded-xxl px-3 py-2 w-full md:w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Filtrar por status">
        <option value="">Status (todos)</option>
        <option value="pendente">Pendente</option>
        <option value="concluida">Concluída</option>
      </select>
      <select v-model="local.due"
        class="border rounded-xxl px-3 py-2 w-full md:w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Filtrar por prazo">
        <option value="">Prazo (todos)</option>
        <option value="overdue">Atrasadas</option>
        <option value="next7d">Próx. 7 dias</option>
      </select>

      <button
        :disabled="loading"
        @click="submit"
        class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition
               disabled:opacity-50 disabled:cursor-not-allowed">
        Filtrar
      </button>
    </div>
    <slot name="legend" />
  </div>
</template>
