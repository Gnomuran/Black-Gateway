<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <!-- Titel -->
        <div class="text-h5 text-center q-mb-md">Login</div>

        <!-- Benutzername-Eingabe -->
        <q-input v-model="username" label="Benutzername" outlined />

        <!-- Passwort-Eingabe -->
        <q-input
          v-model="password"
          label="Passwort"
          type="password"
          outlined
          class="q-mt-md"
        />

        <!-- Login-Button -->
        <q-btn
          @click="login"
          label="Einloggen"
          color="primary"
          class="full-width q-mt-md"
        />

        <!-- Registrierungs-Button -->
        <q-btn
          @click="$router.push('/register')"
          label="Registrieren"
          background-color="info"
          class="full-width q-mt-md"
          flat
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>

import { useRouter } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "../stores/auth.js";
export default {
  setup() {
    const username = ref("");
    const password = ref("");
    const router = useRouter();
    const authStore = useAuthStore(); // Pinia Store initialisieren

    const login = async () => {
      try {
        console.log("Login-Request wird gesendet:", {
          username: username.value,
          password: password.value,
        });

        // 1. Login durchführen (Cookie wird automatisch gespeichert)
        await authStore.login(username.value, password.value);
        
        // 2. Session verifizieren
        await authStore.checkSession();
        
        console.log("Login erfolgreich. Aktueller User:", authStore.user);
        
        // 3. Weiterleitung
        router.push("/home");
      } catch (error) {
        console.error("Login fehlgeschlagen:", error);
        
        // Präzise Fehlermeldung anzeigen
        const errorMessage = error.response?.data?.message 
          || error.message 
          || "Login fehlgeschlagen";
        
        alert(errorMessage);
      }
    };

    return { 
      username, 
      password, 
      login 
    };
  },
};
</script>
