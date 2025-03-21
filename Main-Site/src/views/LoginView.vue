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
import axios from "axios";
import { useRouter } from "vue-router";
import { ref } from "vue";


export default {
  setup() {
    const username = ref("");
    const password = ref("");
    const router = useRouter();

    // Login-Funktion
    const login = async () => {
      try {
        console.log("Login-Request wird gesendet:", {
          username: username.value,
          password: password.value,
        });

        const response = await axios.post("http://localhost:5000/users/login", {
          username: username.value,
          password: password.value,
        });

        console.log("Login erfolgreich:", response.data); // Erfolgsnachricht vom Server

        // Falls Login erfolgreich
        router.push("/home"); // Weiterleitung zur Startseite
      } catch (error) {
        if (error.response) {
          // Fehlerdetails vom Server
          console.log("Fehler-Antwort vom Server:", error.response.data);
          console.log("Fehlercode:", error.response.status);

          // Fehlermeldung anzeigen
          alert(
            "Login fehlgeschlagen: " +
              (error.response?.data?.message || "Unbekannter Fehler")
          );
        } else {
          console.log("Netzwerkfehler oder kein Server erreichbar:", error);
          alert("Login fehlgeschlagen: " + (error.message || "Netzwerkfehler"));
        }
      }
    };

    // Weiterleitung zur Registrierungsseite
    const goToRegister = () => {
      router.push("/register");
    };

    return { username, password, login, goToRegister };
  },
};
</script>
