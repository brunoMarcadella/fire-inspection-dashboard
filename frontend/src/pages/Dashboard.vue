<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { api } from "../lib/api";
import Skeleton from "../components/Skeleton.vue";
import { useDebounce } from "../composables/useDebounce";
import MapInspections from '../components/MapInspections.vue';

type Stat = { total:number; pendentes:number; atrasadas:number; proximas7d:number; comAlerta:number; };
type Row = {
  id:string; status:"pendente"|"concluida"; alert:string|null; nextInspection:string|null;
  equipment:{ name:string; type:string };
  area:{ name:string; latitude:number; longitude:number };
  client:{ name:string; address:string };
  urgency:"critical"|"overdue"|"soon"|"normal";
};

const stats = ref<Stat|null>(null);
const rows = ref<Row[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// filtros
const f = ref({ q:"", status:"", due:"next7d" });

// ordenação (client-side)
type ColKey = "client"|"area"|"equipment"|"type"|"status"|"nextInspection"|"alert"|"urgency";
const sortBy = ref<ColKey>("nextInspection");
const sortDir = ref<"asc"|"desc">("asc");

// paginação (client-side)
const page = ref(1);
const pageSize = ref(10);

async function fetchAll(){
  loading.value = true;
  error.value = null;
  try{
    const [s, r] = await Promise.all([
      api.get("/api/v1/stats"),
      api.get("/api/v1/inspections", { params: {
        q: f.value.q || undefined,
        status: f.value.status || undefined,
        due: f.value.due || undefined
      }})
    ]);
    stats.value = s.data;
    rows.value  = r.data;
  }catch(e:any){
    error.value = e?.message ?? "Falha ao carregar dados.";
  }finally{
    loading.value = false;
    page.value = 1; // reset ao aplicar filtros
  }
}
const load = () => fetchAll();
const debouncedSearch = useDebounce(() => fetchAll(), 400);

onMounted(fetchAll);

// computed: ordenar + paginar
const sorted = computed(() => {
  const arr = [...rows.value];
  arr.sort((a,b)=>{
    const dir = sortDir.value === "asc" ? 1 : -1;
    const get = (r:Row, k:ColKey): any => {
      switch(k){
        case "client": return r.client.name;
        case "area": return r.area.name;
        case "equipment": return r.equipment.name;
        case "type": return r.equipment.type;
        case "status": return r.status;
        case "alert": return r.alert ?? "";
        case "urgency": return r.urgency;
        case "nextInspection": return r.nextInspection ?? "";
      }
    };
    const va = get(a, sortBy.value);
    const vb = get(b, sortBy.value);
    if(va === vb) return 0;
    return (va > vb ? 1 : -1) * dir;
  });
  return arr;
});

const totalPages = computed(()=> Math.max(1, Math.ceil(sorted.value.length / pageSize.value)));
const pageRows = computed(()=>{
  const start = (page.value - 1) * pageSize.value;
  return sorted.value.slice(start, start + pageSize.value);
});

function setSort(k:ColKey){
  if (sortBy.value === k) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = k;
    sortDir.value = "asc";
  }
}

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
    <!-- TÍTULO + AÇÕES -->
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-semibold tracking-wide">Dashboard de Inspeções</h2>
        <p class="text-slate-300/80">Priorize pendências e antecipe as próximas visitas.</p>
      </div>
      <button
        @click="load"
        class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Atualizar dados">
        Atualizar
      </button>
    </div>

    <!-- CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4" role="status" :aria-busy="loading ? 'true' : 'false'">
      <template v-if="loading">
        <Skeleton class="h-20" v-for="i in 5" :key="i"/>
      </template>
      <template v-else>
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
      </template>
    </div>

    <!-- FILTROS -->
    <div class="bg-petrol border border-navy-800 rounded-xxl p-4 shadow-soft">
      <div class="flex flex-col md:flex-row gap-3">
        <input
          v-model="f.q"
          @input="debouncedSearch()"
          @keyup.enter="load"
          placeholder="Buscar (ex.: Extintor, Hospital...)"
          class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-80 placeholder:text-slate-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="Campo de busca"
        />
        <select v-model="f.status"
          class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="Filtrar por status">
          <option value="">Status (todos)</option>
          <option value="pendente">Pendente</option>
          <option value="concluida">Concluída</option>
        </select>
        <select v-model="f.due"
          class="border border-navy-800/60 bg-navy-900/40 rounded-xxl px-3 py-2 w-full md:w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="Filtrar por prazo">
          <option value="">Prazo (todos)</option>
          <option value="overdue">Atrasadas</option>
          <option value="next7d">Próx. 7 dias</option>
        </select>

        <button @click="load"
          class="px-4 py-2 rounded-xxl bg-teal-400/90 text-navy-900 font-semibold hover:bg-teal-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
          Filtrar
        </button>
      </div>

      <!-- legenda de urgência -->
      <div class="mt-3 text-xs text-slate-300/70 flex flex-wrap gap-4">
        <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-red-500"></i> Critical</span>
        <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-orange-500"></i> Overdue</span>
        <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-yellow-400"></i> Soon</span>
        <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-teal-500/60"></i> Normal</span>
      </div>
    </div>

    <!-- TABELA / ESTADOS -->
    <div class="bg-petrol border border-navy-800 rounded-xxl shadow-soft overflow-hidden">
      <div v-if="error" class="p-6 text-red-300">
        {{ error }} — <button @click="load" class="underline">tentar novamente</button>.
      </div>

      <template v-else>
        <div v-if="loading" class="p-4 space-y-2">
          <Skeleton class="h-8"/>
          <Skeleton class="h-8"/>
          <Skeleton class="h-8"/>
          <Skeleton class="h-8"/>
        </div>

        <div v-else-if="!rows.length" class="p-6 text-slate-300/70">
          Nenhum resultado para os filtros atuais.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm">
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
              <tr v-for="r in pageRows" :key="r.id" class="border-t border-navy-800/60 hover:bg-navy-900/30 transition">
                <td class="py-3 px-4">{{ r.client.name }}</td>
                <td class="py-3 px-4">{{ r.area.name }}</td>
                <td class="py-3 px-4">{{ r.equipment.name }}</td>
                <td class="py-3 px-4">{{ r.equipment.type }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="badgeClasses(r.status)">
                    {{ r.status }}
                  </span>
                </td>
                <td class="py-3 px-4">{{ r.nextInspection ? new Date(r.nextInspection).toLocaleDateString() : "—" }}</td>
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
            </tbody>
          </table>

          <!-- paginação -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-navy-800/60">
            <div class="text-xs text-slate-300/70">
              Página {{ page }} de {{ totalPages }} — mostrando {{ pageRows.length }} de {{ rows.length }}
            </div>
            <div class="flex items-center gap-2">
              <button :disabled="page===1"
                      @click="page=1"
                      class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">«</button>
              <button :disabled="page===1"
                      @click="page=Math.max(1,page-1)"
                      class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">Anterior</button>
              <button :disabled="page===totalPages"
                      @click="page=Math.min(totalPages,page+1)"
                      class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">Próxima</button>
              <button :disabled="page===totalPages"
                      @click="page=totalPages"
                      class="px-3 py-1 rounded-md bg-navy-900/40 disabled:opacity-40">»</button>

              <select v-model.number="pageSize" class="ml-3 bg-navy-900/40 rounded-md px-2 py-1">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
              </select>
            </div>
          </div>
        </div>
        <!-- MAPA -->
        <MapInspections class="mt-6" :filters="f" />
      </template>
    </div>
  </section>
</template>
