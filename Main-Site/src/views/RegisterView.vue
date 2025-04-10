<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md " color="info" >Registrieren</div>

        <q-input v-model="username" label="Benutzername" outlined />
        <q-input v-model="password" label="Passwort" type="password" outlined class="q-mt-md" />

        <q-btn @click="register" label="Registrieren" color="primary" class="full-width q-mt-md" />
        <q-btn @click="goToLogin" label="Zum Login" color="info" class="full-width q-mt-md" flat />

        <q-banner v-if="errorMessage" class="text-red q-mt-md">{{ errorMessage }}</q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../boot/axios'; // 🔹 Verwende die globale Axios-Instanz!

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const router = useRouter();

    const register = async () => {
      errorMessage.value = ''; // Fehler-Reset

      if (!username.value || !password.value) {
        errorMessage.value = 'Benutzername und Passwort dürfen nicht leer sein!';
        return;
      }

      try {
        // 🔹 Sende Request mit globaler `api` Instanz (mit `withCredentials`)
        await api.post('/users/create', {
          username: username.value,
          password: password.value,
        });

        // Erfolgreiche Registrierung
       
        router.push('/login');
      } catch (error) {
        console.error('Registrierung fehlgeschlagen:', error);
        errorMessage.value = error.response?.data?.message || 'Registrierung fehlgeschlagen!';
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return { username, password, register, goToLogin, errorMessage };
  },
};
</script>

<style scoped>
.q-page {
  transition: transform 0.5s ease;
}
</style>
