<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import L from 'leaflet';
import { api } from '../lib/api';

type Activity = {
  date: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: 'pendente'|'concluida';
  nextInspection: string | null;
  alert: string | null;
};
type Equipment = {
  name: string;
  type: string;
  activity: Activity | null;
};
type Area = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  equipments: Equipment[];
};
type Client = {
  id: string;
  name: string;
  address: string;
  areas: Area[];
};

const props = defineProps<{
  // filtros do dashboard, se quiser sincronizar “due/status/q” depois
  filters?: { q?: string; status?: string; due?: string }
}>();

const container = ref<HTMLDivElement|null>(null);
let map: L.Map | null = null;
let layerGroup: L.LayerGroup | null = null;

const clients = ref<Client[]>([]);
const loading = ref(true);
const error = ref<string|null>(null);

const COLORS = {
  bg: '#0B2A3A',       // navy
  panel: '#0E3B52',    // petrol
  critical: '#ef4444', // red-500
  overdue:  '#f97316', // orange-500
  soon:     '#facc15', // yellow-400
  normal:   '#2dd4bf'  // teal-400-ish
};

function parseDate(s: string | null){ return s ? new Date(s) : null; }
function urgencyOfArea(a: Area){
  const now = new Date();
  let hasCritical=false, hasOverdue=false, hasSoon=false;
  for(const e of a.equipments){
    const act = e.activity;
    if(!act) continue;
    if (act.alert) { hasCritical = true; break; }
    const next = parseDate(act.nextInspection);
    if (next){
      if (next < now) hasOverdue = true;
      else {
        const in7 = new Date(now); in7.setDate(now.getDate()+7);
        if (next <= in7) hasSoon = true;
      }
    }
  }
  if (hasCritical) return 'critical';
  if (hasOverdue)  return 'overdue';
  if (hasSoon)     return 'soon';
  return 'normal';
}

async function load(){
  loading.value = true; error.value = null;
  try{
    const r = await api.get('/api/v1/clients');
    clients.value = r.data;
  }catch(e:any){
    error.value = e?.message ?? 'Falha ao carregar clientes/áreas';
  }finally{
    loading.value = false;
    await nextTick();
    draw();
  }
}

function makePopupHTML(area: Area, clientName: string){
  const urg = urgencyOfArea(area);
  const color =
    urg==='critical'? COLORS.critical :
    urg==='overdue' ? COLORS.overdue  :
    urg==='soon'    ? COLORS.soon     :
                      COLORS.normal;

  // contagens simples para popup
  let pend=0, concl=0, alerts=0;
  for(const e of area.equipments){
    const act=e.activity;
    if(!act) continue;
    if(act.status==='pendente') pend++;
    if(act.status==='concluida') concl++;
    if(act.alert) alerts++;
  }

  return `
  <div style="min-width:220px;color:#F2F6F8">
    <div style="font-weight:600;margin-bottom:6px">${clientName}</div>
    <div style="font-size:12px;opacity:.75;margin-bottom:4px">${area.name}</div>
    <div style="display:flex;gap:8px;margin:.25rem 0 .5rem">
      <span style="font-size:11px;background:#0E3B52;border:1px solid #103447;border-radius:999px;padding:2px 8px">pendentes: ${pend}</span>
      <span style="font-size:11px;background:#0E3B52;border:1px solid #103447;border-radius:999px;padding:2px 8px">concl.: ${concl}</span>
      <span style="font-size:11px;background:#0E3B52;border:1px solid #103447;border-radius:999px;padding:2px 8px">alertas: ${alerts}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px">
      <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${color}"></span>
      <span style="opacity:.85">urgência: <strong>${urg}</strong></span>
    </div>
  </div>`;
}

function draw(){
  if(!container.value) return;

  // init map (uma vez)
  if(!map){
    map = L.map(container.value, {
      attributionControl: false,
      zoomControl: true
    }).setView([-15.78, -47.93], 4); // Brasil

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      minZoom: 2, maxZoom: 19
    }).addTo(map);

    // canto inferior: legenda
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div','leaflet-control legend');
      div.style.background = COLORS.panel;
      div.style.border = '1px solid #103447';
      div.style.borderRadius = '10px';
      div.style.padding = '8px 10px';
      div.style.color = '#F2F6F8';
      div.style.fontSize = '12px';
      div.innerHTML = `
        <div style="margin-bottom:6px;font-weight:600">Urgência</div>
        <div style="display:grid;gap:6px">
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.critical};margin-right:6px"></i>Critical</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.overdue};margin-right:6px"></i>Overdue</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.soon};margin-right:6px"></i>Soon</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.normal};margin-right:6px"></i>Normal</span>
        </div>`;
      return div;
    };
    legend.addTo(map);
  }

  // limpa camadas anteriores
  if(layerGroup){
    layerGroup.clearLayers();
  } else {
    layerGroup = L.layerGroup().addTo(map);
  }

  const bounds: L.LatLngExpression[] = [];

  // adiciona marcadores por ÁREA (um pin por área)
  for(const c of clients.value){
    for(const a of c.areas){
      if(typeof a.latitude !== 'number' || typeof a.longitude !== 'number') continue;

      const urg = urgencyOfArea(a);
      const color =
        urg==='critical'? COLORS.critical :
        urg==='overdue' ? COLORS.overdue  :
        urg==='soon'    ? COLORS.soon     :
                          COLORS.normal;

      const m = L.circleMarker([a.latitude, a.longitude], {
        radius: 8,
        color: '#0B2A3A',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9
      });

      m.bindPopup(makePopupHTML(a, c.name), { className: 'survey-popup' });
      m.addTo(layerGroup!);

      bounds.push([a.latitude, a.longitude]);
    }
  }

  if(bounds.length){
    map!.fitBounds(bounds as any, { padding:[40,40], maxZoom: 12 });
  }
}

onMounted(load);

// se quiser reagir a filtros do pai futuramente:
// watch(()=>props.filters, () => load(), { deep:true });
</script>

<template>
  <div class="rounded-xxl border border-navy-800 shadow-soft overflow-hidden">
    <div class="bg-navy-900/40 px-4 py-2 text-slate-300 text-sm border-b border-navy-800">Mapa de Inspeções</div>
    <div ref="container" class="h-[460px]"></div>
    <div v-if="loading" class="p-3 text-slate-300/70">Carregando mapa…</div>
    <div v-if="error" class="p-3 text-red-300">{{ error }}</div>
  </div>
</template>

<style scoped>
/* popup com tema Survey */
:global(.survey-popup .leaflet-popup-content) {
  background: #0E3B52;
  color: #F2F6F8;
  border: 1px solid #103447;
  border-radius: 12px;
  padding: 8px 10px;
}
:global(.survey-popup .leaflet-popup-content-wrapper) {
  background: transparent;
  box-shadow: none;
}
:global(.survey-popup .leaflet-popup-tip) {
  background: #0E3B52;
  border: 1px solid #103447;
}
</style>
