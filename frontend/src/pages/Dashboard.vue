<script setup lang="ts">
import { ref, onMounted } from "vue";
import { safeGet } from "../lib/api";
import type { Row, Stats } from "../types";
import KpiCard from "../components/kpi/KpiCard.vue";
import FiltersBar from "../components/dashboard/FiltersBar.vue";
import DataTable from "../components/dashboard/DataTable.vue";
import UrgencyLegend from "../components/common/UrgencyLegend.vue";
import MapInspections from "../components/MapInspections.vue";

const stats = ref<Stats | null>(null);
const rows = ref<Row[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// filtros
const filters = ref({ q:"", status:"", due:"next7d" });

// ordenação e paginação controladas aqui
const sortBy   = ref<'client'|'area'|'equipment'|'type'|'status'|'nextInspection'|'alert'|'urgency'>('nextInspection');
const sortDir  = ref<'asc'|'desc'>('asc');
const page     = ref(1);
const pageSize = ref(10);

async function fetchAll(){
  loading.value = true; error.value = null;
  try{
    const [s, r] = await Promise.all([
      safeGet<Stats>("/api/v1/stats"),
      safeGet<Row[]>("/api/v1/inspections", {
        q: filters.value.q || undefined,
        status: filters.value.status || undefined,
        due: filters.value.due || undefined
      })
    ]);
    stats.value = s.data;
    rows.value  = r.data;
  }catch(e:any){
    error.value = e?.message ?? "Falha ao carregar dados.";
  }finally{
    loading.value = false; page.value = 1;
  }
}

onMounted(fetchAll);

function toggleSort(k: typeof sortBy.value){
  if (sortBy.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortBy.value = k; sortDir.value = 'asc'; }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-8 space-y-8">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-semibold tracking-wide">Dashboard de Inspeções</h2>
        <p class="text-slate-300/80">Priorize pendências e antecipe as próximas visitas.</p>
      </div>
      <button
        :disabled="loading"
        @click="fetchAll"
        class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Atualizar dados">
        Atualizar
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <KpiCard label="Total"         :value="stats?.total"        :loading="loading"/>
      <KpiCard label="Pendentes"     :value="stats?.pendentes"    :loading="loading"/>
      <KpiCard label="Atrasadas"     :value="stats?.atrasadas"    :loading="loading"/>
      <KpiCard label="Próx. 7 dias"  :value="stats?.proximas7d"   :loading="loading"/>
      <KpiCard label="Com alerta"    :value="stats?.comAlerta"    :loading="loading"/>
    </div>

    <!-- FILTROS -->
    <FiltersBar v-model="filters" :loading="loading" @submit="fetchAll">
      <template #legend>
        <div class="mt-3">
          <UrgencyLegend />
        </div>
      </template>
    </FiltersBar>

    <!-- TABELA -->
    <DataTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :sortBy="sortBy"
      :sortDir="sortDir"
      :page="page"
      :pageSize="pageSize"
      @sort="toggleSort"
      @update:page="val => page = val"
      @update:pageSize="val => pageSize = val"
      @open="row => console.log('abrir modal com', row)"
    />

    <!-- MAPA -->
    <MapInspections class="mt-6" :filters="filters" @focus-area="({ area }) => { filters.q = area; fetchAll(); }" />
  </section>
</template>
