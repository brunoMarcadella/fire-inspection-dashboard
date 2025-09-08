<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../lib/api";

type Stat = { total:number; pendentes:number; atrasadas:number; proximas7d:number; comAlerta:number; };
type Row = {
  id:string; status:"pendente"|"concluida"; alert:string|null; nextInspection:string|null;
  equipment:{ name:string; type:string };
  area:{ name:string; latitude:number; longitude:number };
  client:{ name:string; address:string };
  urgency:"critical"|"overdue"|"soon"|"normal";
};

const stats = ref<Stat| null>(null);
const rows = ref<Row[]>([]);
const loading = ref(true);

const f = ref<{ q:string; status:string; due:string; }>(
  { q:"", status:"", due:"next7d" } // default para “próximas 7 dias”
);

async function load(){
  loading.value = true;
  const [s, r] = await Promise.all([
    api.get("/api/v1/stats"),
    api.get("/api/v1/inspections", { params: {
      q: f.value.q || undefined,
      status: f.value.status || undefined,
      due: f.value.due || undefined
    }})
  ]);
  stats.value = s.data;
  rows.value = r.data;
  loading.value = false;
}
onMounted(load);

function badgeClasses(status:string){
  return status === "pendente"
    ? "bg-amber-500/90 text-white"
    : "bg-emerald-600/90 text-white";
}

function urgencyDot(u:Row["urgency"]){
  return ({
    critical:"bg-red-500",
    overdue:"bg-orange-500",
    soon:"bg-yellow-400",
    normal:"bg-teal-500/60",
  }[u]);
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-8 space-y-8">
    <!-- TÍTULO -->
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-semibold tracking-wide">Dashboard de Inspeções</h2>
        <p class="text-slate-300/80">Priorize pendências e antecipe as próximas visitas.</p>
      </div>
      <button @click="load" class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition">
        Atualizar
      </button>
    </div>

    <!-- CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
        <div class="text-xs text-slate-300/70">Total</div>
        <div class="text-2xl font-bold">{{ stats?.total ?? "—" }}</div>
      </div>
      <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
        <div class="text-xs text-slate-300/70">Pendentes</div>
        <div class="text-2xl font-bold">{{ stats?.pendentes ?? "—" }}</div>
      </div>
      <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
        <div class="text-xs text-slate-300/70">Atrasadas</div>
        <div class="text-2xl font-bold">{{ stats?.atrasadas ?? "—" }}</div>
      </div>
      <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
        <div class="text-xs text-slate-300/70">Próx. 7 dias</div>
        <div class="text-2xl font-bold">{{ stats?.proximas7d ?? "—" }}</div>
      </div>
      <div class="p-4 rounded-xxl bg-petrol shadow-soft border border-navy-800">
        <div class="text-xs text-slate-300/70">Com alerta</div>
        <div class="text-2xl font-bold">{{ stats?.comAlerta ?? "—" }}</div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="bg-petrol border border-navy-800 rounded-xxl p-4 shadow-soft">
      <div class="flex flex-col md:flex-row gap-3">
        <input v-model="f.q" @keyup.enter="load" placeholder="Buscar (ex.: Extintor, Hospital...)"
               class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-80 placeholder:text-slate-300/60" />
        <select v-model="f.status" class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-48">
          <option value="">Status (todos)</option>
          <option value="pendente">Pendente</option>
          <option value="concluida">Concluída</option>
        </select>
        <select v-model="f.due" class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-48">
          <option value="">Prazo (todos)</option>
          <option value="overdue">Atrasadas</option>
          <option value="next7d">Próx. 7 dias</option>
        </select>
        <button @click="load" class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition">
          Filtrar
        </button>
      </div>
    </div>

    <!-- TABELA -->
    <div class="bg-petrol border border-navy-800 rounded-xxl shadow-soft overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-navy-900/40 text-left text-slate-300">
            <tr>
              <th class="py-3 px-4">Cliente</th>
              <th class="py-3 px-4">Área</th>
              <th class="py-3 px-4">Equipamento</th>
              <th class="py-3 px-4">Tipo</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Próx. inspeção</th>
              <th class="py-3 px-4">Alerta</th>
              <th class="py-3 px-4">Urgência</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-t border-navy-800/60 hover:bg-navy-900/30 transition">
              <td class="py-3 px-4">{{ r.client.name }}</td>
              <td class="py-3 px-4">{{ r.area.name }}</td>
              <td class="py-3 px-4">{{ r.equipment.name }}</td>
              <td class="py-3 px-4">{{ r.equipment.type }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="badgeClasses(r.status)">
                  {{ r.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                {{ r.nextInspection ? new Date(r.nextInspection).toLocaleDateString() : "—" }}
              </td>
              <td class="py-3 px-4">
                <span v-if="r.alert" class="text-red-400 font-medium">{{ r.alert }}</span>
                <span v-else class="text-slate-300/60">—</span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full" :class="urgencyDot(r.urgency)"></span>
                  <span class="text-slate-300/80 capitalize">{{ r.urgency }}</span>
                </span>
              </td>
            </tr>

            <tr v-if="!rows.length && !loading">
              <td class="py-8 px-4 text-center text-slate-300/70" colspan="8">
                Nenhum resultado para os filtros atuais.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="p-4 text-slate-300/70">Carregando…</div>
    </div>
  </section>
</template>
