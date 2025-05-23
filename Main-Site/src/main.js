import { createApp } from 'vue';
import { Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/svg-fontawesome-v6';
import { createPinia } from 'pinia'; // Pinia importieren

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css';

// Import Quasar css
import 'quasar/src/css/index.sass';
import './assets/css/forum-styles.css'; //


import App from './App.vue';
import router from './router';

const app = createApp(App);

// Pinia initialisieren
const pinia = createPinia();
app.use(pinia); // Pinia zur App hinzufügen

// Quasar konfigurieren
app.use(Quasar, {
  plugins: {}, // Quasar-Plugins hier hinzufügen
  iconSet: quasarIconSet,
});

// Router zur App hinzufügen
app.use(router);

// App mounten
app.mount('#app');