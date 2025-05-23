<template>
  <q-layout view="hHh lpR fFf">
    <!-- NavBarElement ist in Components damit es Später angepasst werden kann -->
    <NavBarElement />
 <!-- HAUPTINHALT -->
    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- FOOTER (optional), nur wenn der Benutzer nicht auf Login oder Register ist -->
    <q-footer v-if="!isLoginOrRegisterRoute" reveal elevated class="bg-dark text-grey-5">
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBarElement from './components/NavBarElement.vue';




const route = useRoute(); // 🔹 Verwende die aktuelle Route


// Überprüfung, ob der Benutzer sich auf der Login- oder Register-Seite befindet
const isLoginOrRegisterRoute = computed(() => {
  return route.path === '/login' || route.path === '/register';
});


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