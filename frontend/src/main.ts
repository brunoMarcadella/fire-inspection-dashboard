import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";         // Tailwind + tema Survey (mantenha este)
import "leaflet/dist/leaflet.css"; // CSS do Leaflet (mapa)

createApp(App).use(router).mount("#app");
