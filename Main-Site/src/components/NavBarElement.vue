<template>
    <div>
      <q-header elevated class="bg-primary text-white">
        <q-toolbar style="padding-top: 1vh;">
          <q-toolbar-title class="text-accent" style="color: var(--q-accent)">
            Black Gateway
          </q-toolbar-title>
  
          <q-btn
            v-if="!isLoginOrRegisterRoute"
            label="Logout"
            color="negative"
            @click="logout"
            class="q-ml-md"
          />
        </q-toolbar>
  
        <q-tabs v-if="!isLoginOrRegisterRoute" align="center">
          <q-route-tab to="/home" label="Home" />
          <q-route-tab to="/about" label="About" />
          <q-route-tab to="/kurse" label="Kurse" />
          <q-route-tab to="/forum" label="Forum" />
        </q-tabs>
      </q-header>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  const isLoginOrRegisterRoute = computed(() => {
    return route.path === '/login' || route.path === '/register'
  })
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  </script>
  
  <style lang="scss" scoped>
  /* Hier können Sie spezifische Styles für die Komponente hinzufügen */
  .q-header {
    // Beispiel für eine angepasste Header-Höhe
    height: 120px;
  }
  
  .text-accent {
    // Falls Sie die Akzentfarbe anpassen möchten
    color: var(--q-accent) !important;
  }
  </style>