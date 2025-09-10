<script setup lang="ts">
import { computed } from 'vue';
import type { Row } from '../../types';
import UrgencyDot from '../common/UrgencyDot.vue';

const props = defineProps<{
  rows: Row[];
  loading?: boolean;
  error?: string | null;
  sortBy: 'client'|'area'|'equipment'|'type'|'status'|'nextInspection'|'alert'|'urgency';
  sortDir: 'asc'|'desc';
  page: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (e:'update:page', v:number): void;
  (e:'update:pageSize', v:number): void;
  (e:'sort', k: 'client'|'area'|'equipment'|'type'|'status'|'nextInspection'|'alert'|'urgency'): void;
  (e:'open', row: Row): void;
}>();

function setSort(k: 'client'|'area'|'equipment'|'type'|'status'|'nextInspection'|'alert'|'urgency') { emit('sort', k); }
function badgeClasses(status:string){
  return status === 'pendente' ? 'bg-amber-500/90 text-white' : 'bg-emerald-600/90 text-white';
}

const sorted = computed(()=>{
  const { rows, sortDir } = props;
  const arr = [...rows];
  const dir = sortDir === 'asc' ? 1 : -1;
  const get = (
    r: Row,
    k: 'client' | 'area' | 'equipment' | 'type' | 'status' | 'alert' | 'urgency' | 'nextInspection'
  ): string | number => ({
    client: r.client.name,
    area: r.area.name,
    equipment: r.equipment.name,
    type: r.equipment.type,
    status: r.status,
    alert: r.alert ?? '',
    urgency: r.urgency,
    nextInspection: r.nextInspection ?? '',
  }[k]);
  arr.sort((a,b)=> (get(a,props.sortBy) > get(b,props.sortBy) ? 1 : -1) * dir);
  return arr;
});

const totalPages = computed(()=> Math.max(1, Math.ceil(sorted.value.length / props.pageSize)));
const pageRows   = computed(()=> sorted.value.slice((props.page-1)*props.pageSize, (props.page-1)*props.pageSize + props.pageSize));

</script>

<template>
  <div class="bg-petrol border border-navy-800 rounded-xxl shadow-soft overflow-hidden">
    <div v-if="error" class="p-6 text-red-300">
      {{ error }} — <button class="underline" @click="$emit('update:page', page)">tentar novamente</button>.
    </div>

    <div v-else-if="loading" class="p-4 space-y-2">
      <div class="h-8 bg-white/10 animate-pulse rounded" v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="!rows.length" class="p-6 text-slate-300/70">
      Nenhum resultado para os filtros atuais.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm" role="table" aria-label="Lista de inspeções">
        <thead class="bg-navy-900/40 text-left text-slate-300">
          <tr>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('client')">Cliente</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('area')">Área</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('equipment')">Equipamento</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('type')">Tipo</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('status')">Status</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('nextInspection')">Próx. inspeção</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('alert')">Alerta</th>
            <th class="py-3 px-4 cursor-pointer select-none" @click="setSort('urgency')">Urgência</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in pageRows" :key="r.id"
              class="border-t border-navy-800/60 hover:bg-navy-900/30 transition cursor-pointer"
              @click="$emit('open', r)">
            <td class="py-3 px-4">{{ r.client.name }}</td>
            <td class="py-3 px-4">{{ r.area.name }}</td>
            <td class="py-3 px-4">{{ r.equipment.name }}</td>
            <td class="py-3 px-4">{{ r.equipment.type }}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="badgeClasses(r.status)">{{ r.status }}</span>
            </td>
            <td class="py-3 px-4">{{ r.nextInspection ? new Date(r.nextInspection).toLocaleDateString('pt-BR') : '—' }}</td>
            <td class="py-3 px-4">
              <span v-if="r.alert" class="text-red-400 font-medium">{{ r.alert }}</span>
              <span v-else class="text-slate-300/60">—</span>
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center gap-2">
                <UrgencyDot :value="r.urgency" />
                <span class="text-slate-300/80 capitalize">{{ r.urgency }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- paginação -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-navy-800/60">
        <div class="text-xs text-slate-300/70">
          Página {{ page }} de {{ totalPages }} — mostrando {{ pageRows.length }} de {{ rows.length }}
        </div>
        <div class="flex items-center gap-2">
          <button :disabled="page===1" @click="$emit('update:page', 1)" class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">«</button>
          <button :disabled="page===1" @click="$emit('update:page', page-1)" class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">Anterior</button>
          <button :disabled="page===totalPages" @click="$emit('update:page', page+1)" class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">Próxima</button>
          <button :disabled="page===totalPages" @click="$emit('update:page', totalPages)" class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">»</button>

          <select :value="pageSize" @change="$emit('update:pageSize', +($event.target as HTMLSelectElement).value)" class="ml-3 bg-navy-900/40 rounded-md px-2 py-1">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
