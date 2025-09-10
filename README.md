# Fire Inspection Dashboard — SURVEY 4.0

Aplicação de dashboard para gerenciamento de inspeções de equipamentos, desenvolvida como exercício técnico.  
Tecnologias utilizadas:

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Vue 3 + TypeScript + TailwindCSS
- **Infra**: Docker e Docker Compose

O estilo visual segue a identidade do site oficial da Survey 4.0 (tons navy/petróleo com acentos teal).

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
   - **frontend** → Vue (porta 5173)  

3. **Acessar a aplicação**
   - Frontend: [http://localhost:5174](http://localhost:5174)  
   - API: [http://localhost:3000](http://localhost:3000)  

4. **Verificar logs (opcional)**
   ```bash
   docker logs -f fire-inspection-dashboard-api     # backend
   docker logs -f fire-inspection-dashboard-web     # frontend
   docker logs -f fire-inspection-dashboard-db      # banco
   ```

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

### 1. KPIs
Cards no topo com métricas em tempo real:
- **Total de inspeções**
- **Pendentes**
- **Atrasadas**
- **Próximas 7 dias**
- **Com alerta**

### 2. Filtros e busca
- Campo de busca textual (ex.: "Extintor", "Hospital")  
- Filtro por **status** (`pendente` / `concluída`)  
- Filtro por **prazo** (`overdue`, `next7d`)  

### 3. Tabela
- Listagem de inspeções com colunas: Cliente, Área, Equipamento, Tipo, Status, Próxima inspeção, Alerta, Urgência.  
- Destaque visual para **status** e **urgência** com cores.  

### 4. Mapa de inspeções
- Pins no mapa representando as áreas (com latitude/longitude do JSON).  
- Cor do pin indica a **urgência**:
  - 🔴 Critical → existe alerta
  - 🟠 Overdue → inspeção vencida
  - 🟡 Soon → inspeção em até 7 dias
  - 🟢 Normal → sem pendências
- Popup ao clicar no pin mostra dados do cliente, área e contagem de equipamentos.

---

## ⚡ Fluxo da aplicação

1. Ao iniciar, o backend executa as **migrações Prisma** e roda o **seed** com base no arquivo `fire_inspection.json`.  
2. A API expõe os endpoints REST para consultas de inspeções.  
3. O frontend Vue consome a API e renderiza os cards, tabela e mapa interativo.  
4. Usuário pode **buscar, filtrar e navegar** pelas inspeções, antecipando visitas e identificando áreas críticas.

---

## 🛠️ Dicas de desenvolvimento

Se quiser rodar fora do Docker:

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
Acesse [http://localhost:5174](http://localhost:5174).

---

## 👨‍💻 Autor

Desenvolvido por **Bruno** como parte do exercício técnico.  
