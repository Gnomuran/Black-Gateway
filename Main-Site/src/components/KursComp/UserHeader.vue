<template>
  <div class="user-header">
    <!-- Logged In User -->
    <div v-if="isLoggedIn" class="user-info">
      <!-- APOD Profile Image -->
      <div class="profile-section">
        <q-avatar size="60px" class="profile-avatar" @click="handleAvatarClick">
          <q-img
            v-if="nasaApodImageUrl"
            :src="nasaApodImageUrl"
            fit="cover"
            :ratio="1"
            class="profile-image"
            loading="lazy"
          >
            <template v-slot:error>
              <div class="profile-fallback">
                <q-icon name="mdi-account-circle" size="40px" color="accent" />
              </div>
            </template>
          </q-img>
          
          <q-spinner-gears
            v-else-if="isLoadingApod"
            size="30px"
            color="accent"
          />
          
          <q-icon
            v-else
            name="mdi-account-circle"
            size="40px"
            color="accent"
          />
          
          <!-- APOD Badge -->
          <q-badge
            v-if="nasaApodImageUrl && isUserSpecificApod"
            floating
            color="accent"
            text-color="dark"
            class="apod-badge"
          >
            <q-icon name="mdi-star" size="12px" />
            <q-tooltip>Dein persönliches NASA-Bild!</q-tooltip>
          </q-badge>
        </q-avatar>
        
        <!-- Profile Actions (Dropdown) -->
        <q-btn
          flat
          round
          dense
          icon="mdi-dots-vertical"
          color="white"
          size="sm"
          class="profile-menu-btn"
        >
          <q-menu>
            <q-list>
              <q-item
                clickable
                @click="$emit('show-profile')"
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="mdi-account" />
                </q-item-section>
                <q-item-section>Profil</q-item-section>
              </q-item>
              
              <q-item
                clickable
                @click="$emit('reload-apod')"
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="mdi-refresh" />
                </q-item-section>
                <q-item-section>NASA-Bild aktualisieren</q-item-section>
              </q-item>
              
              <q-item
                v-if="isUserSpecificApod"
                clickable
                @click="$emit('load-todays-apod')"
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="mdi-calendar-today" />
                </q-item-section>
                <q-item-section>Heutiges NASA-Bild</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item
                clickable
                @click="$emit('logout')"
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="mdi-logout" />
                </q-item-section>
                <q-item-section>Abmelden</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- User Welcome -->
      <div class="welcome-section">
        <h3 class="user-greeting">
          Hallo, <span class="user-name">{{ userName }}</span>!
        </h3>
        <p class="user-status">
          {{ userStatusText }}
        </p>
      </div>
    </div>

    <!-- Guest State -->
    <div v-else class="guest-info">
      <div class="guest-avatar">
        <q-avatar size="60px">
          <q-icon name="mdi-account-circle" size="40px" color="grey-6" />
        </q-avatar>
      </div>
      
      <div class="guest-welcome">
        <h3 class="guest-greeting">Willkommen!</h3>
        <p class="guest-subtitle">Melde dich an für deine persönliche Lernreise</p>
      </div>
      
      <q-btn
        color="accent"
        label="Anmelden"
        icon="mdi-login"
        no-caps
        rounded
        @click="$emit('login-requested')"
        class="login-btn"
      />
    </div>

    <!-- APOD Info Dialog (Click on Avatar) -->
    <q-dialog v-model="showApodInfo">
      <q-card class="apod-info-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-accent">
            <q-icon name="mdi-telescope" class="q-mr-sm" />
            {{ apodTitle }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showApodInfo = false" />
        </q-card-section>

        <q-card-section v-if="apodInfo">
          <div class="apod-preview">
            <q-img
              :src="nasaApodImageUrl"
              style="height: 200px"
              fit="cover"
              class="rounded-borders"
            />
          </div>
          
          <div class="q-mt-md">
            <div class="text-caption text-grey-6">{{ formattedApodDate }}</div>
            <div v-if="isUserSpecificApod" class="text-accent text-weight-bold q-mt-xs">
              <q-icon name="mdi-star" size="sm" />
              Dein persönliches Registrierungs-APOD!
            </div>
            
            <!-- APOD Description -->
            <div v-if="apodInfo.explanation" class="apod-description q-mt-md">
              <div class="text-weight-bold q-mb-sm">Beschreibung:</div>
              <div class="text-body2">
                {{ truncatedExplanation }}
                <q-btn 
                  v-if="apodInfo.explanation.length > 200" 
                  flat 
                  dense 
                  size="sm"
                  :label="showFullExplanation ? 'Weniger' : 'Mehr lesen'"
                  @click="showFullExplanation = !showFullExplanation"
                  class="q-ml-xs"
                />
              </div>
            </div>
            
            <!-- Copyright Info -->
            <div v-if="apodInfo.copyright" class="q-mt-md text-caption text-grey-6">
              <strong>Copyright:</strong> {{ apodInfo.copyright }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="NASA Seite öffnen" 
            color="accent"
            icon="mdi-open-in-new"
            @click="openNasaPage" 
          />
          <q-btn flat label="Schließen" @click="showApodInfo = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth';
import { useNasaStore } from '../../stores/nasa';

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
  nasaApodImageUrl: {
    type: String,
    default: null
  },
  isLoadingApod: {
    type: Boolean,
    default: false
  }
});

// eslint-disable-next-line no-unused-vars
const emit = defineEmits([
  'login-requested',
  'logout',
  'reload-apod',
  'load-todays-apod',
  'show-profile'
]);

// Stores
const authStore = useAuthStore();
const nasaStore = useNasaStore();
const $q = useQuasar();

// State
const showApodInfo = ref(false);
const showFullExplanation = ref(false);

// Computed Properties
const apodInfo = computed(() => nasaStore.apodInfo);
const isUserSpecificApod = computed(() => nasaStore.isCurrentApodUserSpecific);
const formattedApodDate = computed(() => nasaStore.formattedApodDate);

const apodTitle = computed(() => {
  if (isUserSpecificApod.value) {
    return 'Dein Registrierungs-APOD';
  }
  return 'NASA Astronomie-Bild';
});

const userStatusText = computed(() => {
  const registrationInfo = authStore.getUserRegistrationInfo?.();
  if (!registrationInfo) return 'Schön dich zu sehen!';
  
  const days = registrationInfo.daysAgo;
  if (days === 0) return 'Heute registriert - Willkommen! 🎉';
  if (days === 1) return 'Seit gestern dabei';
  if (days < 7) return `Seit ${days} Tagen dabei`;
  if (days < 30) return `Seit ${Math.floor(days / 7)} Wochen dabei`;
  return `Seit ${Math.floor(days / 30)} Monaten dabei`;
});

const truncatedExplanation = computed(() => {
  if (!apodInfo.value?.explanation) return '';
  
  if (showFullExplanation.value || apodInfo.value.explanation.length <= 200) {
    return apodInfo.value.explanation;
  }
  
  return apodInfo.value.explanation.substring(0, 200) + '...';
});

// Methods
const handleAvatarClick = () => {
  if (props.nasaApodImageUrl) {
    showApodInfo.value = true;
  }
};

const openNasaPage = () => {
  if (!apodInfo.value?.date) return;
  
  // NASA APOD URL format: https://apod.nasa.gov/apod/apYYMMDD.html
  const date = apodInfo.value.date.replace(/-/g, ''); // "2025-03-20" -> "20250320"
  const shortDate = date.substring(2); // "250320"
  const nasaUrl = `https://apod.nasa.gov/apod/ap${shortDate}.html`;
  
  $q.notify({
    message: 'NASA-Seite wird geöffnet... 🌌',
    color: 'accent',
    textColor: 'dark',
    icon: 'open_in_new',
    timeout: 2000
  });
  
  window.open(nasaUrl, '_blank');
};
</script>

<style scoped>
.user-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.profile-avatar {
  cursor: pointer;
  border: 2px solid var(--q-accent);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  border-color: #fff;
}

.profile-image {
  border-radius: 50%;
}

.profile-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
}

.apod-badge {
  border: 1px solid var(--q-accent);
}

.profile-menu-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.profile-menu-btn:hover {
  opacity: 1;
}

.welcome-section {
  flex: 1;
}

.user-greeting {
  color: white;
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.user-name {
  color: var(--q-accent);
  font-family: 'Bevan', serif;
}

.user-status {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.guest-welcome {
  flex: 1;
}

.guest-greeting {
  color: white;
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.guest-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

.login-btn {
  font-weight: 600;
}

.apod-info-card {
  background: #1B1B2F;
  color: white;
  min-width: 350px;
  max-width: 500px;
}

.apod-preview {
  border-radius: 8px;
  overflow: hidden;
}

.apod-description {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid var(--q-accent);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-info,
  .guest-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-section {
    justify-content: center;
  }
  
  .welcome-section,
  .guest-welcome {
    text-align: center;
  }
  
  .apod-info-card {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}

@media (max-width: 480px) {
  .user-header {
    padding: 1rem;
  }
  
  .profile-avatar {
    width: 50px;
    height: 50px;
  }
  
  .user-greeting,
  .guest-greeting {
    font-size: 1.1rem;
  }
}
</style>