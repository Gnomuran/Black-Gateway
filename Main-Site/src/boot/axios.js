import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:5000', // Falls API-URL in .env gesetzt ist
  withCredentials: true, // 🔹 WICHTIG: Cookies für Sessions erlauben
});

// 🔹 Axios Interceptor: Automatische Fehlerbehandlung
api.interceptors.response.use(
  response => response, 
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Nicht autorisiert! Eventuell nicht eingeloggt.');
        // Falls du Vuex/Pinia benutzt, kannst du hier einen Logout-Trigger setzen
        // store.dispatch('auth/logout');
      }
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios; // Standard-Axios
  app.config.globalProperties.$api = api; // Angepasste API-Instanz
});

export { api };
