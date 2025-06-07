<!-- Main-Site/src/App.vue -->
<template>
  <q-layout view="hHh lpR fFf" class="app-layout">
    <!-- NavBarElement ist in Components damit es Später angepasst werden kann -->
    <NavBarElement />
 <!-- HAUPTINHALT -->
    <q-page-container class="page-container">
      <!-- Loading Screen beim App-Start -->
      <div v-if="appLoading" class="app-loading-overlay">
        <div class="loading-content">
          <q-spinner-gears size="4rem" color="accent" />
          <h3 class="text-accent q-mt-md">Black Gateway</h3>
          <p class="text-white">Initialisiere Anwendung...</p>
        </div>
      </div>
      
      <!-- Router View mit verbesserter Transition -->
      <router-view v-else v-slot="{ Component, route }">
        <transition 
          :name="route.meta.transition || 'page-fade'"
          mode="out-in"
          appear
        >
          <component 
            :is="Component" 
            :key="route.path"
            class="page-component"
          />
        </transition>
      </router-view>
    </q-page-container>

    <!-- FOOTER (optional), nur wenn der Benutzer nicht auf Login oder Register ist -->
    <q-footer v-if="!isLoginOrRegisterRoute && !appLoading" reveal elevated class="bg-dark text-grey-5">
      <q-toolbar class="justify-center">
        <div class="text-caption">
          <span class="text-accent">© 2025 Black Gateway</span> | 
          <q-icon name="mdi-github" size="sm" class="q-mx-xs text-info" /> 
          ITP Projekt / HTL Wien West
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import NavBarElement from './components/NavBarElement.vue';

const route = useRoute();
const authStore = useAuthStore();

// App Loading State
const appLoading = ref(true);

// Überprüfung, ob der Benutzer sich auf der Login- oder Register-Seite befindet
const isLoginOrRegisterRoute = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

// 🔹 App Initialisierung mit Session Check
onMounted(async () => {
  console.log(' App.vue mounted - Initializing application...');
  
  try {
    // 1. Session Status prüfen
    console.log(' Checking session status...');
    await authStore.checkSession();
    
    // 2. Wenn User eingeloggt ist, User Creation Date laden
    if (authStore.isAuthenticated && authStore.user) {
      console.log(' User authenticated:', authStore.user.username);
      
      // User Creation Date laden falls noch nicht vorhanden
      if (!authStore.userCreationDate) {
        console.log(' Loading user creation date...');
        await authStore.fetchUserCreationDate();
      }
    } else {
      console.log(' No active session found');
    }
    
    // 3. App Loading beenden
    console.log(' App initialization complete');
    
  } catch (error) {
    console.error(' Error during app initialization:', error);
    // Auch bei Fehlern die App laden, damit Login möglich ist
  } finally {
    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      appLoading.value = false;
    }, 500); // Reduziert von 800ms auf 500ms
  }
});
</script>

<style>
/* 🎨 Global App Styles - Verhindert weißen Flash */
html, body {
  margin: 0;
  padding: 0;
  background-color: #1B1B2F !important; /* Dunkler Hintergrund als Standard */
  overflow-x: hidden;
}

#app {
  background-color: #1B1B2F !important;
  min-height: 100vh;
}

/* Layout Styles */
.app-layout {
  background-color: #1B1B2F !important;
  min-height: 100vh;
}

.page-container {
  background-color: #1B1B2F !important;
  min-height: calc(100vh - 120px); /* Höhe minus Header */
}

.page-component {
  background-color: #1B1B2F !important;
  min-height: 100%;
  width: 100%;
}

/* App Loading Overlay */
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1B1B2F 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-content h3 {
  margin: 0;
  font-family: 'Bevan', serif;
}

.loading-content p {
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
}

/* 🚀 SANFTE Page Transitions - Behält ursprüngliche Farben */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.15s ease-in-out; /* Sehr schnell für smoother Übergang */
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(5px); /* Sehr subtil */
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px); /* Sehr subtil */
}

/* Slide-Animationen - Auch sanfter */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease-in-out; /* Schneller */
}

.slide-right-enter-from {
  transform: translateX(20px); /* Weniger drastisch */
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-left-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Fade-Animation (Standard) - Schneller */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-in-out; /* Sehr schnell */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 🔧 Nur Layout Container - Behalte Page-spezifische Designs */
.q-layout {
  background-color: #1B1B2F !important;
}

.q-page-container {
  background-color: inherit; /* Erbt von der jeweiligen Seite */
}

/* Router View Container */
.router-view-container {
  background-color: inherit;
  min-height: 100%;
  position: relative;
}

/* 🎯 Nur spezifische dunkle Seiten - Andere behalten ihr Design */
.kurse-page,
.navbar-area {
  background-color: #1B1B2F !important;
}

/* 🔧 Behalte original Card Styles - Entferne Override */
/* Cards behalten ihre originalen Farben */

/* Loading States - nur bei dunklen Seiten */
.loading-container:not(.light-page),
.loading-state:not(.light-page) {
  background-color: #1B1B2F !important;
  color: white !important;
}
</style>