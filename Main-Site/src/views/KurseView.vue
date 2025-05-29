<template>
  <q-page class="q-pa-md">
    <UserHeader 
      :is-logged-in="isLoggedIn" 
      :user-name="userName" 
      :nasa-apod-image-url="nasaApodImageUrl"
      :is-loading-apod="nasaStore.isLoading"
      @login-requested="handleLoginRequest"
      @logout="handleLogout"
      @reload-apod="handleReloadApod"
      @load-todays-apod="handleLoadTodaysApod"
      @show-profile="handleShowProfile"
    />
    
    <!-- 🆕 Debug Info (nur im Development) -->
    <div v-if="showDebugInfo" class="debug-info q-mb-md">
      <q-card class="bg-grey-9 text-white">
        <q-card-section>
          <div class="text-h6">🔧 Debug Info</div>
          <div class="q-mt-sm text-caption">
            <div>User Creation Date: {{ authStore.userCreationDate }}</div>
            <div>NASA Date: {{ authStore.getUserCreationDateForNasa() }}</div>
            <div>Has Creation Date: {{ authStore.hasUserCreationDate() }}</div>
            <div>APOD is User Specific: {{ nasaStore.isCurrentApodUserSpecific }}</div>
            <div>Current APOD Date: {{ nasaStore.currentApodDate }}</div>
          </div>
          <q-btn 
            flat 
            size="sm" 
            label="Debug NASA Date" 
            @click="authStore.debugNasaDate()"
            class="q-mt-sm"
          />
        </q-card-section>
      </q-card>
    </div>
    
    <ProgressCard 
      v-if="isLoggedIn"
      :progress="progress"
      :completed-count="completedCount"
      :total-subcategories="totalSubcategories"
      :progress-percentage="progressPercentage"
    />
    
    <SubcategoryList 
      :subcategories="subcategories"
      :active-subcategory-id="activeSubcategoryId"
      :completed-subcategories="completedSubcategories"
      @subcategory-selected="loadSubcategoryContent"
    />
    
    <SubcategoryContent 
      v-if="isLoggedIn && activeSubcategoryContent.length > 0"
      :content="activeSubcategoryContent"
      :name="activeSubcategoryName"
      :is-completed="isSubcategoryCompleted(activeSubcategoryId)"
      @complete="completeSubcategory(activeSubcategoryId)"
    />
    
    <LoginPrompt v-if="!isLoggedIn" />

    <!-- Simple Login Dialog -->
    <q-dialog v-model="showLoginDialog">
      <q-card style="min-width: 350px" class="bg-dark text-white">
        <q-card-section>
          <div class="text-h6 text-accent">Anmelden</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="loginForm.username"
            filled
            label="Benutzername"
            dark
            class="q-mb-md"
            @keyup.enter="handleLogin"
          />
          <q-input
            v-model="loginForm.password"
            filled
            type="password"
            label="Passwort"
            dark
            @keyup.enter="handleLogin"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Abbrechen" 
            @click="showLoginDialog = false" 
            color="grey-6"
          />
          <q-btn 
            flat 
            label="Anmelden" 
            @click="handleLogin"
            color="accent"
            :loading="loginLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Profile Info Dialog -->
    <q-dialog v-model="showProfileDialog">
      <q-card style="min-width: 400px" class="bg-dark text-white">
        <q-card-section>
          <div class="text-h6 text-accent">Profil</div>
        </q-card-section>

        <q-card-section v-if="isLoggedIn">
          <div class="profile-info">
            <div class="profile-item">
              <strong>Benutzername:</strong> {{ userName }}
            </div>
            <div v-if="userRegistrationInfo" class="profile-item">
              <strong>Registriert:</strong> {{ userRegistrationInfo.date }}
            </div>
            <div v-if="userRegistrationInfo" class="profile-item">
              <strong>Dabei seit:</strong> {{ userRegistrationInfo.daysAgo }} Tagen
            </div>
            <div v-if="nasaStore.isCurrentApodUserSpecific" class="profile-item text-accent">
              <q-icon name="mdi-star" class="q-mr-sm" />
              <strong>Dein NASA-Bild vom Registrierungstag wird angezeigt!</strong>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Schließen" 
            @click="showProfileDialog = false"
            color="white"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 🆕 Debug Button (Floating) -->
    <q-btn
      v-if="isLoggedIn"
      fab
      icon="mdi-bug"
      color="grey-7"
      size="sm"
      class="debug-fab"
      @click="toggleDebug"
    >
      <q-tooltip>Debug Info anzeigen</q-tooltip>
    </q-btn>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../boot/axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useNasaStore } from '../stores/nasa';

import UserHeader from '../components/KursComp/UserHeader.vue';
import ProgressCard from '../components/KursComp/ProgressCard.vue';
import SubcategoryList from '../components/KursComp/SubcategoryList.vue';
import SubcategoryContent from '../components/KursComp/SubcategoryContent.vue';
import LoginPrompt from '../components/KursComp/LoginPrompt.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const nasaStore = useNasaStore();

// State
const subcategories = ref([]);
const completedSubcategories = ref([]);
const activeSubcategoryId = ref(null);
const activeSubcategoryContent = ref([]);

// Dialog States
const showLoginDialog = ref(false);
const showProfileDialog = ref(false);
const loginLoading = ref(false);

// 🆕 Debug State
const showDebugInfo = ref(false);

// Login Form
const loginForm = ref({
  username: '',
  password: ''
});

// Computed
const isLoggedIn = computed(() => authStore.isLoggedIn());
const userName = computed(() => authStore.user?.username || '');
const nasaApodImageUrl = computed(() => nasaStore.apodImageUrl);
const totalSubcategories = computed(() => subcategories.value.length);
const completedCount = computed(() => completedSubcategories.value.length);
const progress = computed(() => totalSubcategories.value > 0 
  ? completedCount.value / totalSubcategories.value 
  : 0
);
const progressPercentage = computed(() => Math.round(progress.value * 100));
const activeSubcategoryName = computed(() => {
  const subcat = subcategories.value.find(sc => sc.id === activeSubcategoryId.value);
  return subcat ? subcat.name : '';
});

// User Registration Info
const userRegistrationInfo = computed(() => {
  return authStore.getUserRegistrationInfo?.() || null;
});

// Methods
const loadData = async () => {
  try {
    const subcatsResponse = await api.get('/info/subcategories');
    subcategories.value = subcatsResponse.data.filter(sc => sc.category_id === 1);
    
    if (isLoggedIn.value) {
      const completedResponse = await api.get('/info/completed');
      completedSubcategories.value = completedResponse.data;
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Laden der Daten',
      color: 'negative'
    });
    console.error(error);
  }
};

const loadSubcategoryContent = async (subcategoryId) => {
  try {
    if (!isLoggedIn.value) {
      $q.notify({
        message: 'Bitte anmelden um Inhalte zu sehen',
        color: 'accent',
        textColor: 'dark',
        icon: 'login'
      });
      return;
    }
    
    activeSubcategoryId.value = subcategoryId;
    const response = await api.get(`/info/subcategory/${subcategoryId}`);
    activeSubcategoryContent.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Laden der Inhalte',
      color: 'negative'
    });
    console.error(error);
  }
};

const isSubcategoryCompleted = (id) => {
  return completedSubcategories.value.some(sc => sc.subcategoryId === id);
};

const completeSubcategory = async (subcategoryId) => {
  try {
    if (!isLoggedIn.value) return;
    
    await api.post('/info/complete', { subcategoryId });
    await loadData();
    
    $q.notify({
      message: `Super ${userName.value}, Thema abgeschlossen!`,
      color: 'positive',
      textColor: 'dark',
      icon: 'celebration'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Abschließen des Themas',
      color: 'negative'
    });
    console.error(error);
  }
};

// 🔧 NASA APOD Functions - Verbessert
const loadNasaApodForUser = async () => {
  console.log('=== loadNasaApodForUser Start ===');
  
  try {
    if (isLoggedIn.value && authStore.hasUserCreationDate()) {
      const userCreationDate = authStore.getUserCreationDateForNasa();
      console.log('User ist eingeloggt, User Creation Date:', userCreationDate);
      
      if (userCreationDate) {
        console.log(`🚀 Lade NASA APOD für User-Registrierungsdatum: ${userCreationDate}`);
        
        // Verwende die neue NASA Store Funktion
        const result = await nasaStore.fetchUserRegistrationAPOD(userCreationDate);
        
        console.log('NASA APOD Result:', result);
        
        if (result.success) {
          $q.notify({
            message: `NASA-Bild vom Registrierungstag (${userCreationDate}) geladen! 🌟`,
            color: 'accent',
            textColor: 'dark',
            icon: 'photo',
            timeout: 5000
          });
        } else {
          console.warn('NASA APOD konnte nicht geladen werden, verwende Fallback');
        }
      } else {
        console.log('Kein User Creation Date verfügbar, lade Standard APOD');
        await nasaStore.fetchAPOD();
      }
    } else if (!nasaStore.apodData) {
      console.log('User nicht eingeloggt oder kein Creation Date, lade Standard APOD');
      await nasaStore.fetchAPOD();
    }
  } catch (error) {
    console.error('Fehler beim Laden des NASA APOD:', error);
    
    // Fallback auf heutiges APOD
    try {
      console.log('Versuche Fallback auf heutiges APOD');
      await nasaStore.fetchAPOD();
    } catch (fallbackError) {
      console.error('Auch Fallback APOD konnte nicht geladen werden:', fallbackError);
      
      $q.notify({
        type: 'negative',
        message: 'NASA-Bild konnte nicht geladen werden',
        color: 'negative'
      });
    }
  }
  
  console.log('=== loadNasaApodForUser End ===');
};

// UserHeader Event Handlers
const handleLoginRequest = () => {
  showLoginDialog.value = true;
};

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    $q.notify({
      type: 'negative',
      message: 'Bitte alle Felder ausfüllen',
      color: 'negative'
    });
    return;
  }

  try {
    loginLoading.value = true;
    console.log('=== Login Process Start ===');
    
    await authStore.login(loginForm.value.username, loginForm.value.password);
    
    console.log('Login erfolgreich, lade NASA APOD');
    
    showLoginDialog.value = false;
    loginForm.value = { username: '', password: '' };
    
    $q.notify({
      message: `Willkommen zurück, ${userName.value}! 🎉`,
      color: 'positive',
      textColor: 'dark',
      icon: 'celebration',
      timeout: 4000
    });
    
    // Kurz warten damit Auth Store Zeit hat, User Creation Date zu laden
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // User APOD laden nach Login
    await loadNasaApodForUser();
    
    console.log('=== Login Process End ===');
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Login fehlgeschlagen. Überprüfe deine Daten.',
      color: 'negative'
    });
    console.error('Login Error:', error);
  } finally {
    loginLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    
    $q.notify({
      message: 'Erfolgreich abgemeldet',
      color: 'info',
      icon: 'logout'
    });
    
    // Standard APOD laden nach Logout
    await nasaStore.fetchAPOD();
    
  } catch (error) {
    console.error('Logout Fehler:', error);
  }
};

const handleReloadApod = async () => {
  try {
    console.log('=== Reload APOD ===');
    await loadNasaApodForUser();
    
    $q.notify({
      message: 'NASA-Bild aktualisiert! 🌌',
      color: 'accent',
      textColor: 'dark',
      icon: 'refresh'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Aktualisieren des NASA-Bildes',
      color: 'negative'
    });
    console.error(error);
  }
};

const handleLoadTodaysApod = async () => {
  try {
    await nasaStore.fetchTodaysAPOD();
    
    $q.notify({
      message: 'Heutiges NASA-Bild geladen! 📅',
      color: 'info',
      textColor: 'dark',
      icon: 'today'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Laden des heutigen NASA-Bildes',
      color: 'negative'
    });
    console.error(error);
  }
};

const handleShowProfile = () => {
  showProfileDialog.value = true;
};

// 🆕 Debug Functions
const toggleDebug = () => {
  showDebugInfo.value = !showDebugInfo.value;
  if (showDebugInfo.value) {
    authStore.debugNasaDate();
  }
};

// Lifecycle
onMounted(async () => {
  console.log('=== Component Mounted ===');
  await loadData();
  
  // Kurz warten falls User bereits eingeloggt ist
  if (isLoggedIn.value) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await loadNasaApodForUser();
});

watch(isLoggedIn, async (newVal, oldVal) => {
  console.log('=== isLoggedIn Changed ===', oldVal, '->', newVal);
  
  if (newVal) {
    await loadData();
    
    // Warten bis User Creation Date geladen ist
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await loadNasaApodForUser();
  } else {
    completedSubcategories.value = [];
    if (!nasaStore.apodData) {
      await nasaStore.fetchAPOD();
    }
  }
});

// 🔧 Verbesserter Watcher für User Creation Date
watch(() => authStore.userCreationDate, async (newDate, oldDate) => {
  console.log('=== userCreationDate Changed ===', oldDate, '->', newDate);
  
  if (newDate && isLoggedIn.value && !oldDate) {
    console.log('User Creation Date verfügbar, lade NASA APOD');
    await loadNasaApodForUser();
  }
}, { immediate: false });
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bevan:ital@0;1&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');

.q-page {
  background-color: #1B1B2F;
  color: white;
}

.text-accent {
  font-family: 'Bevan', sans-serif;
  color: #ffb98d;
}

.q-card {
  border: 1px solid #8D6EFF;
  border-radius: 8px;
}

.q-linear-progress__track {
  background-color: #1B1B2F !important;
}

.q-linear-progress__model {
  background-color: #4DFFFA !important;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.debug-info {
  border: 2px dashed #ff6b6b;
  border-radius: 8px;
}

.debug-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>