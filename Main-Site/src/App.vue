<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Black Gateway</q-toolbar-title>

        <!-- Logout-Button, nur wenn der Benutzer nicht auf Login oder Register ist -->
        <q-btn
          v-if="!isLoginOrRegisterRoute"
          label="Logout"
          color="negative"
          @click="logout"
          class="q-ml-md"
        />
      </q-toolbar>

      <!-- NAVIGATIONSTABS, nur wenn der Benutzer nicht auf Login oder Register ist -->
      <q-tabs v-if="!isLoginOrRegisterRoute" align="center">
        <q-route-tab to="/home" label="Home"></q-route-tab>
        <q-route-tab to="/about" label="About"></q-route-tab>
        <q-route-tab to="/kurse" label="Kurse"></q-route-tab>
        <q-route-tab to="/forum" label="Forum"></q-route-tab>
      </q-tabs>
    </q-header>

    <!-- HAUPTINHALT -->
    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- FOOTER (optional), nur wenn der Benutzer nicht auf Login oder Register ist -->
    <q-footer v-if="!isLoginOrRegisterRoute" reveal elevated class="bg-dark text-white q-pa-md">
      <q-toolbar>
        <q-toolbar-title>© 2025 Projekt</q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute(); // 🔹 Verwende die aktuelle Route
const router = useRouter(); // 🔹 Verwende den Router

// Überprüfung, ob der Benutzer sich auf der Login- oder Register-Seite befindet
const isLoginOrRegisterRoute = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

// Logout-Funktion
const logout = () => {
  localStorage.removeItem('token'); // Token löschen
  router.push('/login'); // Zur Login-Seite weiterleiten
};
</script>

<style>
/* Slide-Animationen */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.5s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* Fade-Animation (Standard) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>