<template>
  <div class="three-background-container">
    <!-- Three.js Hintergrund -->
    <div class="three-background">
      <Blackhole-MainSite
      :primaryColor="[0.2, 0.3, 0.5]"
        :secondaryColor="[1.0, 0.6, 0.1]"
        :low-performance-mode="true"
      />
    </div>

    <!-- Overlay Content -->
    <div class="overlay-content">
      <!-- Hero Section -->
      <q-section class="hero-section">
        <div class="row justify-center">
          <div class="col-12 col-md-8 text-center">
            <div class="q-pa-xl">
              <h1 class="text-h2 text-accent q-mb-md">Black Gateway</h1>
              <p class="text-h5 text-white q-mb-xl">
                Deine Info und Diskurs Platform mit NASA-Integration
              </p>

              <!-- Eingeloggte Benutzer - Personalisierte Begrüßung -->
              <div v-if="isLoggedIn" class="logged-in-section">
                <q-card class="welcome-card" dark>
                  <q-card-section class="text-center">
                    <!-- NASA APOD Avatar oder Fallback -->
                    <div class="nasa-avatar-container q-mb-md">
                      <q-avatar
                        size="120px"
                        class="nasa-avatar"
                        :class="{ 'loading-avatar': loadingUserApod }"
                      >
                        <!-- Zeige User APOD wenn verfügbar -->
                        <img
                          v-if="userApodImage && !loadingUserApod"
                          :src="userApodImage"
                          :alt="userApodInfo?.title || 'NASA APOD'"
                          class="apod-image"
                        />
                        <!-- Loading Spinner -->
                        <q-spinner-dots
                          v-else-if="loadingUserApod"
                          color="accent"
                          size="40px"
                        />
                        <!-- Fallback Icon -->
                        <q-icon
                          v-else
                          name="mdi-telescope"
                          size="60px"
                          color="accent"
                        />
                      </q-avatar>

                      <!-- NASA Badge -->
                      <q-badge
                        v-if="userApodImage && !loadingUserApod"
                        color="accent"
                        text-color="dark"
                        class="nasa-badge"
                      >
                        NASA APOD
                      </q-badge>
                    </div>

                    <div class="text-h4 text-white q-mb-sm">
                      Willkommen zurück, {{ currentUser?.username }}!
                    </div>

                    <!-- NASA APOD Info -->
                    <div
                      v-if="userApodInfo && !loadingUserApod"
                      class="nasa-info q-mb-md"
                    >
                      <div class="text-subtitle1 text-accent q-mb-xs">
                        "{{ userApodInfo.title }}"
                      </div>
                      <div class="text-caption text-grey-4">
                        Dein NASA-Bild vom {{ nasaStore.formattedApodDate }}
                      </div>
                    </div>

                    <div
                      v-if="userRegistrationInfo && !userApodInfo"
                      class="text-body1 text-grey-3 q-mb-md"
                    >
                      {{ userRegistrationInfo.message }}
                    </div>

                    <div class="row q-gutter-md justify-center q-mt-lg">
                      <q-btn
                        color="accent"
                        text-color="dark"
                        label="Weiter lernen"
                        size="lg"
                        rounded
                        @click="goToLearning"
                      />

                      <q-btn
                        outline
                        color="white"
                        label="Zu dem Forum"
                        size="lg"
                        rounded
                        @click="router.push('/forum')"
                      />
                    </div>

                    <!-- NASA APOD Details Expandable -->
                    <q-expansion-item
                      v-if="userApodInfo && !loadingUserApod"
                      class="q-mt-md nasa-details"
                      icon="mdi-information"
                      label="Mehr über dein NASA-Bild"
                      dense
                      dark
                    >
                      <q-card-section class="text-left q-pt-md">
                        <div
                          class="text-body2 text-grey-3"
                          style="max-height: 150px; overflow-y: auto"
                        >
                          {{ userApodInfo.explanation }}
                        </div>

                        <div
                          v-if="userApodInfo.copyright"
                          class="text-caption text-grey-5 q-mt-sm"
                        >
                          © {{ userApodInfo.copyright }}
                        </div>

                        <div class="text-caption text-grey-5 q-mt-xs">
                          Medientyp:
                          {{
                            userApodInfo.mediaType === "image"
                              ? "Bild"
                              : "Video"
                          }}
                        </div>
                      </q-card-section>
                    </q-expansion-item>
                  </q-card-section>
                </q-card>

                <div class="q-mt-lg">
                  <q-btn
                    flat
                    color="grey-5"
                    label="Abmelden"
                    icon="mdi-logout"
                    @click="handleLogout"
                  />
                </div>
              </div>

              <!-- Nicht eingeloggte Benutzer - Standard Journey Cards -->
              <div v-else>
                <div class="row q-gutter-lg justify-center q-mb-xl">
                  <div class="col-12 col-sm-5">
                    <q-card class="journey-card" dark>
                      <q-card-section class="text-center">
                        <q-icon
                          name="mdi-account-plus"
                          size="48px"
                          color="accent"
                          class="q-mb-md"
                        />
                        <div class="text-h6 q-mb-sm">Neu hier?</div>
                        <p class="text-body2 q-mb-md">
                          Erstelle deinen Account und erhalte dein persönliches
                          NASA-Bild
                        </p>
                        <q-btn
                          color="accent"
                          text-color="dark"
                          label="Kostenlos registrieren"
                          size="lg"
                          rounded
                          unelevated
                          icon="mdi-rocket-launch"
                          @click="goToRegister"
                          class="full-width"
                        />
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-5">
                    <q-card class="journey-card" dark bordered>
                      <q-card-section class="text-center">
                        <q-icon
                          name="mdi-account-check"
                          size="48px"
                          color="info"
                          class="q-mb-md"
                        />
                        <div class="text-h6 q-mb-sm">Bereits dabei?</div>
                        <p class="text-body2 q-mb-md">
                          Melde dich an und setze deine Lernreise fort
                        </p>
                        <q-btn
                          outline
                          color="white"
                          label="Anmelden"
                          size="lg"
                          rounded
                          icon="mdi-login"
                          @click="goToLogin"
                          class="full-width"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Preview Button -->
                <q-btn
                  flat
                  color="accent"
                  label="Erst mal schauen"
                  icon="mdi-eye"
                  @click="scrollToPreview"
                />
              </div>
            </div>
          </div>
        </div>
      </q-section>

      <!-- Preview Section -->
      <q-section class="preview-section" ref="previewSection">
        <div class="row justify-center">
          <div class="col-12 col-lg-10">
            <h2 class="text-h3 text-center text-white q-mb-xl">
              So sieht deine Lernerfahrung aus
            </h2>

            <div class="row q-gutter-lg">
              <div class="col-12 col-md-4">
                <q-card class="demo-card" dark>
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <q-icon
                        name="mdi-account-star"
                        size="32px"
                        color="accent"
                      />
                      <div class="col q-ml-md">
                        <div class="text-h6">NASA-Profil</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <q-item dark class="q-pa-none">
                      <q-item-section avatar>
                        <q-avatar
                          v-if="isLoggedIn && userApodImage"
                          size="40px"
                        >
                          <img
                            :src="userApodImage"
                            alt="User NASA APOD"
                            class="apod-image"
                          />
                        </q-avatar>
                        <q-avatar
                          v-else
                          color="accent"
                          text-color="dark"
                          icon="mdi-telescope"
                          size="40px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-white">
                          {{
                            isLoggedIn
                              ? currentUser?.username || "Dein Username"
                              : "Dein Username"
                          }}
                        </q-item-label>
                        <q-item-label caption>
                          {{
                            isLoggedIn && userApodInfo
                              ? userApodInfo.title
                              : "NASA-Bild vom Registrierungstag"
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <p class="text-body2 q-mt-md">
                      Erhalte dein einzigartiges NASA Astronomie-Bild als
                      Profilbild
                    </p>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card class="demo-card" dark>
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <q-icon
                        name="mdi-book-multiple"
                        size="32px"
                        color="info"
                      />
                      <div class="col q-ml-md">
                        <div class="text-h6">Lernmodule</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <q-list dark>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="mdi-check-circle" color="positive" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Modul 1 - Abgeschlossen</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="mdi-play-circle" color="accent" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Modul 2 - Aktiv</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="mdi-circle-outline" color="grey" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Modul 3 - Gesperrt</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <p class="text-body2 q-mt-md">
                      Strukturierte Lerninhalte mit automatischer
                      Fortschrittsverfolgung
                    </p>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card class="demo-card" dark>
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <q-icon name="mdi-forum" size="32px" color="positive" />
                      <div class="col q-ml-md">
                        <div class="text-h6">Community</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <q-chip
                      v-for="topic in forumTopics"
                      :key="topic"
                      :label="topic"
                      color="dark"
                      text-color="white"
                      class="q-ma-xs"
                    />

                    <p class="text-body2 q-mt-md">
                      Tausche dich mit anderen Lernenden aus und stelle Fragen
                    </p>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-section>

      <!-- Steps Section -->
      <q-section class="steps-section">
        <div class="row justify-center">
          <div class="col-12 col-lg-8">
            <h2 class="text-h3 text-center text-white q-mb-xl">
              3 Schritte zu deinem Lernerfolg
            </h2>

            <q-timeline color="accent" class="q-mb-xl">
              <q-timeline-entry
                v-for="(step, index) in steps"
                :key="index"
                :icon="step.icon"
                :color="step.color"
              >
                <template v-slot:title>
                  <div class="text-h6 text-white">{{ step.title }}</div>
                </template>
                <div class="text-body1 text-grey-3">
                  {{ step.description }}
                </div>
              </q-timeline-entry>
            </q-timeline>

            <div class="text-center">
              <q-btn
                v-if="!isLoggedIn"
                color="accent"
                text-color="dark"
                label="Jetzt starten - kostenlos!"
                size="xl"
                rounded
                unelevated
                icon="mdi-rocket-launch"
                @click="goToRegister"
                class="q-px-xl"
              />

              <q-btn
                v-else
                color="accent"
                text-color="dark"
                label="Zu den Lernmodulen"
                size="xl"
                rounded
                unelevated
                icon="mdi-book-open-page-variant"
                @click="goToLearning"
                class="q-px-xl"
              />
            </div>
          </div>
        </div>
      </q-section>

      <!-- FAQ Section -->
      <q-section class="faq-section">
        <div class="row justify-center">
          <div class="col-12 col-lg-8">
            <h2 class="text-h3 text-center text-white q-mb-xl">FAQ</h2>

            <q-list>
              <q-expansion-item
                v-for="(faq, index) in faqs"
                :key="index"
                :label="faq.question"
                :header-class="'text-white text-weight-medium'"
                class="faq-item q-mb-sm"
                dark
              >
                <q-card dark class="bg-transparent">
                  <q-card-section class="text-grey-3">
                    {{ faq.answer }}
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useNasaStore } from "../stores/nasa";
import BlackholeMainSite from "@/components/Blackhole-MainSite.vue";

const router = useRouter();
const authStore = useAuthStore();
const nasaStore = useNasaStore();

// Refs
const previewSection = ref(null);
const loadingUserApod = ref(false);

// Computed für Auth-Status
const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const userRegistrationInfo = computed(() =>
  authStore.getUserRegistrationInfo()
);

// Computed für NASA User APOD
const userApodImage = computed(() => {
  return nasaStore.apodImageUrl && nasaStore.isCurrentApodUserSpecific
    ? nasaStore.apodImageUrl
    : null;
});

const userApodInfo = computed(() => {
  return nasaStore.isCurrentApodUserSpecific ? nasaStore.apodInfo : null;
});

// Session und User APOD beim Component-Load prüfen
onMounted(async () => {
  await authStore.checkSession();

  // Wenn User eingeloggt ist, lade sein Registration-APOD
  if (authStore.isAuthenticated && authStore.hasUserCreationDate()) {
    await loadUserApod();
  }
});

// User-spezifisches APOD laden
const loadUserApod = async () => {
  try {
    loadingUserApod.value = true;
    const userNasaDate = authStore.getUserCreationDateForNasa();

    if (userNasaDate) {
      console.log("Lade User APOD für Datum:", userNasaDate);
      const result = await nasaStore.fetchUserRegistrationAPOD(userNasaDate);

      if (result.success) {
        console.log("User APOD erfolgreich geladen:", result.title);
      } else {
        console.warn("Fallback APOD verwendet:", result.error);
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden des User APOD:", error);
  } finally {
    loadingUserApod.value = false;
  }
};

// Data
const forumTopics = ["Astrophysik", "Raumfahrt", "Planeten", "Galaxien"];

const steps = [
  {
    icon: "mdi-account-plus",
    color: "accent",
    title: "Account erstellen",
    description:
      "Registriere dich kostenlos und erhalte sofort dein persönliches NASA-Bild als Profilbild",
  },
  {
    icon: "mdi-play-circle",
    color: "info",
    title: "Lernmodule starten",
    description:
      "Wähle interessante Themen aus und beginne mit dem ersten Lernmodul - in deinem eigenen Tempo",
  },
  {
    icon: "mdi-trophy",
    color: "positive",
    title: "Fortschritt verfolgen",
    description:
      "Schließe Module ab, sammle Erfolge und tausche dich im Forum mit anderen Lernenden aus",
  },
];

const faqs = [
  {
    question: "Was ist das NASA-Bild genau?",
    answer:
      'Du erhältst das offizielle NASA "Astronomy Picture of the Day" von dem Tag, an dem du dich registriert hast. Das wird dein einzigartiges Profilbild.',
  },
  {
    question: "Wie funktioniert das Lernen hier?",
    answer:
      "Du arbeitest dich durch strukturierte Module mit Texten, Bildern und interaktiven Inhalten. Dein Fortschritt wird automatisch gespeichert.",
  },
  {
    question: "Kann ich mit anderen Nutzern interagieren?",
    answer:
      "Ja! Im integrierten Diskurs-Forum kannst du Fragen stellen, Diskussionen führen und dich mit anderen Lernenden austauschen.",
  },
];

// Methods
const goToRegister = () => {
  router.push("/register");
};

const goToLogin = () => {
  router.push("/login");
};

const goToLearning = () => {
  router.push("/kurse"); // oder dashboard oder der Hauptlernbereich
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    // Nach dem Logout zur Startseite oder Login-Seite weiterleiten
    router.push("/");
  } catch (error) {
    console.error("Logout-Fehler:", error);
  }
};

const scrollToPreview = () => {
  if (previewSection.value) {
    previewSection.value.$el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
</script>

<style scoped>
.three-background-container {
  position: relative;
  width: 100%;
  min-height: 400vh;
  overflow-x: hidden;
}

.three-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
}

.overlay-content {
  position: relative;
  z-index: 1;
  width: 100%;
}

/* Section Backgrounds */
.hero-section {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
}

.preview-section {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
}

.steps-section {
  min-height: 100vh;
  background: rgba(255, 185, 141, 0.05);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.faq-section {
  min-height: 80vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
}

/* Custom Card Styles */
.welcome-card {
  background: rgba(255, 185, 141, 0.15) !important;
  border: 2px solid rgba(255, 185, 141, 0.3);
  max-width: 600px;
  margin: 0 auto;
}

.logged-in-section {
  animation: fadeInUp 0.6s ease-out;
}

/* NASA Avatar Styles */
.nasa-avatar-container {
  position: relative;
  display: inline-block;
}

.nasa-avatar {
  border: 3px solid rgba(255, 185, 141, 0.5);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.nasa-avatar:hover {
  border-color: rgba(255, 185, 141, 0.8);
  transform: scale(1.05);
}

.loading-avatar {
  background: rgba(255, 185, 141, 0.2) !important;
}

.apod-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.nasa-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.nasa-info {
  max-width: 400px;
  margin: 0 auto;
}

.nasa-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 1rem;
}

/* Navigation Buttons - Haupt Navigation */
.main-navigation {
  max-width: 600px;
  margin: 0 auto;
}

.uniform-btn {
  min-width: 140px;
  min-height: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: none;
  white-space: normal;
  padding: 12px 16px;
}

.uniform-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.uniform-btn .q-btn__content {
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.uniform-btn .q-icon {
  font-size: 20px;
}

/* Quick Access Navigation */
.quick-access-section {
  max-width: 300px;
  margin: 0 auto;
}

.quick-access-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.quick-btn {
  width: 100%;
  aspect-ratio: 1;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1) !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.journey-card {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.journey-card:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-5px);
}

.demo-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Section Backgrounds */
.hero-section {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
}

.preview-section {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
}

.steps-section {
  min-height: 100vh;
  background: rgba(255, 185, 141, 0.05);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.faq-section {
  min-height: 80vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
}

/* Custom Card Styles */
.welcome-card {
  background: rgba(255, 185, 141, 0.15) !important;
  border: 2px solid rgba(255, 185, 141, 0.3);
  max-width: 600px;
  margin: 0 auto;
}

.logged-in-section {
  animation: fadeInUp 0.6s ease-out;
}

/* NASA Avatar Styles */
.nasa-avatar-container {
  position: relative;
  display: inline-block;
}

.nasa-avatar {
  border: 3px solid rgba(255, 185, 141, 0.5);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.nasa-avatar:hover {
  border-color: rgba(255, 185, 141, 0.8);
  transform: scale(1.05);
}

.loading-avatar {
  background: rgba(255, 185, 141, 0.2) !important;
}

.apod-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.nasa-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.nasa-info {
  max-width: 400px;
  margin: 0 auto;
}

.nasa-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 1rem;
}

/* Navigation Buttons - Haupt Navigation */
.main-navigation {
  max-width: 600px;
  margin: 0 auto;
}

.uniform-btn {
  min-width: 140px;
  min-height: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: none;
  white-space: normal;
  padding: 12px 16px;
}

.uniform-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.uniform-btn .q-btn__content {
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.uniform-btn .q-icon {
  font-size: 20px;
}

/* Quick Access Navigation */
.quick-access-section {
  max-width: 300px;
  margin: 0 auto;
}

.quick-access-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.quick-btn {
  width: 100%;
  aspect-ratio: 1;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1) !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.journey-card {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.journey-card:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-5px);
}

.demo-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.demo-card:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 185, 141, 0.5);
  transform: translateY(-3px);
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

/* Timeline customization */
.q-timeline__subtitle {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section,
  .preview-section,
  .steps-section,
  .faq-section {
    padding: 2rem 1rem;
  }

  .main-navigation {
    max-width: 95%;
  }

  .uniform-btn {
    min-width: 120px;
    min-height: 45px;
    font-size: 0.9rem;
    padding: 10px 12px;
  }

  .uniform-btn .q-icon {
    font-size: 18px;
  }

  .quick-access-section {
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .welcome-card {
    max-width: 95%;
    margin: 0 auto;
  }

  .main-navigation {
    padding: 0 0.5rem;
  }

  .uniform-btn {
    min-width: 100px;
    min-height: 42px;
    font-size: 0.85rem;
    padding: 8px 10px;
  }

  .uniform-btn .q-icon {
    font-size: 16px;
  }

  .quick-access-section {
    max-width: 220px;
  }

  .quick-btn {
    font-size: 0.8rem;
  }
}


.preview-section { 
  margin: 5rem;
}
</style>
