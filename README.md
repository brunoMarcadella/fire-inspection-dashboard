# Fire Inspection Dashboard — SURVEY 4.0

Aplicação de dashboard para gerenciamento de inspeções de equipamentos, desenvolvida como exercício técnico.  
Tecnologias utilizadas:

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Vue 3 + TypeScript + TailwindCSS
- **Infra**: Docker e Docker Compose

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)  

### Passos

1. **Clonar o repositório**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd fire-inspection-dashboard
   ```

2. **Subir os serviços com Docker Compose**
   ```bash
   docker compose up -d --build
   ```

   Isso vai iniciar:
   - **db** → PostgreSQL (porta 5432 no container, 5434 no host)  
   - **backend** → API em Node/Express (porta 3000)  
   - **frontend** → Vue (porta 5174)  

3. **Acessar a aplicação**
   - Frontend: http://localhost:5174  
   - API: http://localhost:3000  

4. **Verificar logs (opcional)**
   ```bash
   docker logs -f fire-inspection-dashboard-api     # backend
   docker logs -f fire-inspection-dashboard-web     # frontend
   docker logs -f fire-inspection-dashboard-db      # banco
   ```

---

## 🧱 Arquitetura e Componentização (Frontend)

O frontend foi estruturado em **componentes reutilizáveis**, seguindo boas práticas Vue 3 + TailwindCSS para consistência visual e evolução simples.

### Estrutura de pastas

```
frontend/src/
  types.ts                     # Tipos compartilhados (Row, Stats, Urgency)
  lib/
    api.ts                     # Axios pré-configurado + safeGet() com retry simples
  composables/
    useDebounce.ts             # Composable para debounce de busca
  components/
    layout/
      BaseHeader.vue           # Cabeçalho do app
      BaseFooter.vue           # Rodapé do app
    common/
      Skeleton.vue             # Placeholder de carregamento
      UrgencyDot.vue           # Indicador de urgência (bolinha colorida)
      UrgencyLegend.vue        # Legenda das urgências
    kpi/
      KpiCard.vue              # Card de KPI (rótulo + valor)
    dashboard/
      FiltersBar.vue           # Barra de filtros (q / status / due)
      DataTable.vue            # Tabela (renderização + ordenação + paginação)
    MapInspections.vue         # Mapa (Leaflet) com pinos por área
  pages/
    Dashboard.vue              # Orquestra dados e usa os componentes acima
  App.vue                      # Layout base (Header/Footer + RouterView)
  router.ts                    # Rotas
  main.ts                      # Bootstrap Vue + Tailwind + CSS do Leaflet
  index.css                    # Tailwind + tokens de tema (cores Survey)
```

### Padrões adotados

- **Layout isolado**: `BaseHeader` e `BaseFooter` presentes em todas as páginas.
- **KPI desacoplado**: `KpiCard` padroniza densidade visual e evita duplicação.
- **Filtros reutilizáveis**: `FiltersBar` com `v-model` + evento `submit`.
- **Tabela coesa**: `DataTable` concentra renderização, paginação e ordenação via cabeçalho.
- **Mapa**: `MapInspections` usa **Leaflet**; cor do pino segue a urgência agregada da área (`critical`, `overdue`, `soon`, `normal`).
- **Common**: `UrgencyDot`, `UrgencyLegend` e `Skeleton` padronizam semântica e estilo.
- **TypeScript first**: `types.ts` guarda tipos compartilhados para segurança de dados.
- **HTTP centralizado**: `lib/api.ts` expõe `api` (Axios) e `safeGet()` com retry leve.
- **Acessibilidade**: uso de `aria-label`, `role="table"` e estados `disabled`/foco.

### Tema e Tailwind

- Tema **escuro** inspirado na Survey: navy/petróleo/teal.
- O arquivo **`src/index.css`** importa o Tailwind e define tokens/cores do tema.
- A estilização é feita com **utilitários Tailwind** (layout, espaçamentos, bordas, sombras e responsividade).

---

## 📡 Endpoints principais da API

- **Estatísticas**
  ```
  GET /api/v1/stats
  → { "total": 84, "pendentes": 24, "atrasadas": 16, "proximas7d": 3, "comAlerta": 52 }
  ```

- **Listagem de inspeções (com filtros)**
  ```
  GET /api/v1/inspections?due=next7d
  GET /api/v1/inspections?due=overdue
  GET /api/v1/inspections?status=pendente
  GET /api/v1/inspections?q=Extintor
  ```

- **Clientes/Áreas/Equipamentos (para o mapa)**
  ```
  GET /api/v1/clients
  ```

---

## 🖥️ Funcionalidades do Dashboard

1. **KPIs**: total, pendentes, atrasadas, próximas 7d, com alerta.  
2. **Filtros e busca**: texto, status e prazo (com *debounce* no campo de busca).  
3. **Tabela**: ordenação por cabeçalho, paginação (5/10/20) e destaque de status/urgência.  
4. **Mapa interativo**: pinos por área, cor por urgência e popup com dados da área.

---

## ⚡ Fluxo da aplicação

1. Ao iniciar, o backend executa as **migrações Prisma** e roda o **seed** com base no arquivo `fire_inspection.json`.  
2. A API expõe os endpoints REST para consultas de inspeções.  
3. O frontend Vue consome a API e renderiza os **cards**, a **tabela** e o **mapa**.  
4. Usuário pode **buscar, filtrar e navegar** pelas inspeções, priorizando pendências.

---

## 🛠️ Dicas de desenvolvimento (sem Docker)

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse http://localhost:5174

---

## 👨‍💻 Autor

Desenvolvido por **Bruno** como parte do exercício técnico.  
