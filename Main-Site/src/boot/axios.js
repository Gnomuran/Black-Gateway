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

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);



export { api };
