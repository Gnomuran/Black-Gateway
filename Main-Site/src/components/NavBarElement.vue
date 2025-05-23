<template>
  <div>
    <q-header elevated class="bg-primary text-white responsive-header">
      <q-toolbar class="q-py-sm">
        <q-btn
          v-if="isMobile"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        
        <q-toolbar-title class="text-accent text-weight-bold">
          Black Gateway
        </q-toolbar-title>

        <q-space />
        
        <q-btn
          v-if="!isLoginOrRegisterRoute"
          flat
          dense
          label="Logout"
          color="negative"
          class="q-ml-sm desktop-only"
          @click="logout"
        />
        
        <q-btn
          v-if="!isLoginOrRegisterRoute && isMobile"
          flat
          dense
          round
          icon="logout"
          color="negative"
          @click="logout"
          aria-label="Logout"
        />
      </q-toolbar>

      <!-- Desktop Navigation Tabs -->
      <q-tabs
        v-if="!isLoginOrRegisterRoute && !isMobile"
        align="center"
        class="q-mb-sm"
        indicator-color="accent"
        active-color="accent"
      >
        <q-route-tab to="/home" label="Home" exact />
        <q-route-tab to="/dashboard" label="Dashboard" exact />
        <q-route-tab to="/kurse" label="Kurse" exact />
        <q-route-tab to="/forum" label="Forum" exact />
        <q-route-tab to="/deepseek" label="AI Assistant" exact />
      </q-tabs>
    </q-header>

    <!-- Mobile Navigation Drawer -->
    <q-drawer
      v-if="!isLoginOrRegisterRoute"
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-primary"
      class="bg-primary"
      :breakpoint="1023"
    >
      <q-list>
        <q-item-label header class="text-accent text-weight-bold q-mt-md q-mb-md text-center">
          Navigation
        </q-item-label>
        
        <q-item clickable v-ripple to="/home" exact class="text-info" active-class="bg-primary text-accent">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/dashboard" exact class="text-info" active-class="bg-primary text-accent">
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/kurse" class="text-info" exact active-class="bg-primary text-accent">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>Kurse</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/forum" exact class="text-info" active-class="bg-primary text-accent">
          <q-item-section avatar>
            <q-icon name="forum" />
          </q-item-section>
          <q-item-section>Forum</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/deepseek" exact class="text-info" active-class="bg-primary text-accent">
  <q-item-section avatar>
    <q-icon name="smart_toy" />
  </q-item-section>
  <q-item-section>AI Assistant</q-item-section>
</q-item>
      </q-list>
    </q-drawer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Quasar-Instanz wird nicht mehr benötigt, da originale logout-Funktion verwendet wird
const route = useRoute()
const router = useRouter()
const leftDrawerOpen = ref(false)
const isMobile = ref(false)

// Prüfe, ob es sich um Login oder Register Route handelt
const isLoginOrRegisterRoute = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// Toggle für Mobile Navigation
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Originale Logout Funktion
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// Resize-Handler für responsives Verhalten
const updateScreenSize = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style lang="scss" scoped>

.q-drawer
{
  background-color: #1B1B2F ;
}
.responsive-header {
  transition: height 0.3s ease;
}

@media (max-width: 1023px) {
  .responsive-header {
    height: auto !important;
    min-height: 60px;
  }
}

@media (min-width: 1024px) {
  .responsive-header {
    height: auto !important;
    min-height: 100px;
  }
}

.text-accent {
  color: var(--q-accent) !important;
}

// Desktop-Only-Elemente in mobiler Ansicht ausblenden
@media (max-width: 1023px) {
  .desktop-only {
    display: none;
  }
}
</style>