<!-- Main-Site/src/components/NavBarElement.vue -->
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
          :loading="isLoggingOut"
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
          :loading="isLoggingOut"
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
        <q-route-tab to="/ai-assistant" label="AI Assistant" exact />
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

        <q-item clickable v-ripple to="/ai-assistant" exact class="text-info" active-class="bg-primary text-accent">
          <q-item-section avatar>
            <q-icon name="smart_toy" />
          </q-item-section>
          <q-item-section>AI Assistant</q-item-section>
        </q-item>

        <!-- Mobile Logout -->
        <q-separator class="q-my-md" />
        <q-item clickable @click="logout" class="text-negative">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const leftDrawerOpen = ref(false)
const isMobile = ref(false)
const isLoggingOut = ref(false)

// Prüfe, ob es sich um Login oder Register Route handelt
const isLoginOrRegisterRoute = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// Toggle für Mobile Navigation
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// 🔧 VERBESSERTE Logout Funktion
const logout = async () => {
  if (isLoggingOut.value) return // Verhindere mehrfache Logout-Versuche
  
  try {
    isLoggingOut.value = true
    console.log('🚪 Starting logout process...')
    
    // 1. Bestätigungsdialog (optional)
    const shouldLogout = await new Promise(resolve => {
      $q.dialog({
        title: 'Abmelden',
        message: 'Möchtest du dich wirklich abmelden?',
        cancel: 'Abbrechen',
        ok: 'Abmelden',
        persistent: false
      }).onOk(() => resolve(true))
        .onCancel(() => resolve(false))
    })
    
    if (!shouldLogout) {
      console.log('🚫 Logout cancelled by user')
      return
    }
    
    // 2. Logout über Auth Store
    await authStore.logout()
    console.log('✅ Logout successful')
    
    // 3. Success Notification
    $q.notify({
      message: 'Erfolgreich abgemeldet',
      color: 'positive',
      icon: 'logout',
      timeout: 2000,
      position: 'top'
    })
    
    // 4. Zur Login-Seite weiterleiten
    console.log('🔄 Redirecting to login...')
    await router.push('/login')
    console.log('✅ Redirected to login page')
    
  } catch (error) {
    console.error('❌ Logout error:', error)
    
    // Bei Fehlern trotzdem zur Login-Seite weiterleiten
    $q.notify({
      message: 'Fehler beim Abmelden, du wirst trotzdem abgemeldet',
      color: 'warning',
      icon: 'warning',
      timeout: 3000,
      position: 'top'
    })
    
    // Force logout durch Auth Store reset und Weiterleitung
    authStore.resetAuthState()
    await router.push('/login')
    
  } finally {
    isLoggingOut.value = false
  }
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
.q-drawer {
  background-color: #1B1B2F;
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