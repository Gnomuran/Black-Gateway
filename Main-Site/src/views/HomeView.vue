<template>
  <div class="three-background-container">
    <!-- Three.js Hintergrund -->
    <div class="three-background">
      <ThreeModel />
    </div>
    
    <!-- Overlay Content -->
    <div class="overlay-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="main-title">Black Gateway</h1>
          <p class="subtitle">Deine persönliche Lernplattform</p>
          
          <div class="cta-buttons">
            <q-btn
              color="accent"
              text-color="dark"
              label="Lernreise starten"
              size="lg"
              rounded
              no-caps
              @click="startLearning"
              class="q-mr-sm"
            />
            <q-btn
              flat
              color="white"
              label="Anmelden"
              size="lg"
              rounded
              no-caps
              @click="goToLogin"
            />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="features-container">
          <h2 class="features-title">Was bietet dir Black Gateway?</h2>
          
          <div class="features-list">
            <!-- Personalized NASA Experience -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-account-star" size="32px" color="accent" />
              </div>
              <div class="feature-content">
                <h3>Personalisierte Erfahrung</h3>
                <p>
                  Dein NASA Astronomie-Bild vom Registrierungstag wird zu deinem 
                  persönlichen Profilbild. Jeder Nutzer erhält sein einzigartiges 
                  Weltraumbild als digitale Identität.
                </p>
              </div>
            </div>

            <!-- Learning Modules -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-book-multiple" size="32px" color="info" />
              </div>
              <div class="feature-content">
                <h3>Strukturierte Lernmodule</h3>
                <p>
                  Arbeite dich durch verschiedene Themenbereiche. Jedes Modul 
                  enthält Texte, Bilder und interaktive Inhalte. Dein Fortschritt 
                  wird automatisch gespeichert.
                </p>
              </div>
            </div>

            <!-- Progress Tracking -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-chart-line" size="32px" color="positive" />
              </div>
              <div class="feature-content">
                <h3>Fortschritts-Verfolgung</h3>
                <p>
                  Sieh auf einen Blick, welche Module du bereits abgeschlossen hast. 
                  Eine übersichtliche Progress-Bar zeigt dir deinen aktuellen Stand 
                  und motiviert zum Weitermachen.
                </p>
              </div>
            </div>

            <!-- User Account System -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-account-circle" size="32px" color="purple" />
              </div>
              <div class="feature-content">
                <h3>Persönlicher Account</h3>
                <p>
                  Erstelle dein Benutzerkonto und behalte deinen Lernfortschritt 
                  auch nach dem Ausloggen. Deine Daten bleiben sicher gespeichert 
                  und sind jederzeit verfügbar.
                </p>
              </div>
            </div>

            <!-- Modern Interface -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-palette" size="32px" color="orange" />
              </div>
              <div class="feature-content">
                <h3>Diskurs Forum</h3>
                <p>
                  Bei dem Diskurs-Forum handelt es sich um eine Plattform, die den Nutzern das Führen von Diskussionen mit anderen ermöglicht.
                  Es besteht die Möglichkeit, Beiträge zu erstellen, die sich auf unterschiedliche Themenbereiche beziehen.
          
                </p>
              </div>
            </div>

            <!-- NASA Integration -->
            <div class="feature-item">
              <div class="feature-icon">
                <q-icon name="mdi-telescope" size="32px" color="blue" />
              </div>
              <div class="feature-content">
                <h3>NASA API Integration</h3>
                <p>
                  Echte NASA-Daten bereichern deine Lernerfahrung. Das "Astronomy 
                  Picture of the Day" wird täglich aktualisiert und mit deinem 
                  Account verknüpft.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="how-it-works-section">
        <div class="how-it-works-container">
          <h2 class="section-title">So funktioniert's</h2>
          
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Account erstellen</h3>
                <p>Registriere dich mit einem Benutzernamen und erhalte dein persönliches NASA-Bild.</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Module auswählen</h3>
                <p>Wähle aus den verfügbaren Lernmodulen und starte mit dem ersten Thema.</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Lernen & Fortschritt</h3>
                <p>Arbeite durch die Inhalte und schließe Module ab. Dein Fortschritt wird gespeichert.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta-section">
        <div class="final-cta-content">
          <h2>Bereit zum Starten?</h2>
          <p>Beginne deine Lernreise noch heute und entdecke neue Welten des Wissens.</p>
          <q-btn
            color="accent"
            text-color="dark"
            label="Jetzt registrieren"
            size="xl"
            rounded
            no-caps
            @click="goToRegister"
            class="cta-button"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ThreeModel from '@/components/ThreeModel.vue';

const router = useRouter();
const authStore = useAuthStore();

// Methods
const startLearning = () => {
  if (authStore.isLoggedIn()) {
    router.push('/kurse');
  } else {
    router.push('/register');
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.three-background-container {
  position: relative;
  width: 100%;
  min-height: 300vh;
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

/* Hero Section */
.hero-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 600px;
}

.main-title {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 3rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Features Section */
.features-section {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
}

.features-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--q-accent);
  transform: translateX(10px);
}

.feature-icon {
  flex-shrink: 0;
  padding: 0.5rem;
}

.feature-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.feature-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* How it Works Section */
.how-it-works-section {
  min-height: 80vh;
  background: rgba(255, 185, 141, 0.1);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.how-it-works-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #4DFFFA; /* Helles Cyan für besseren Kontrast */
  color: #1B1B2F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 0 15px rgba(77, 255, 250, 0.3);
  transition: all 0.3s ease;
}

.step-number:hover {
  background: #8D6EFF; /* Leuchtendes Lila beim Hover */
  box-shadow: 0 0 20px rgba(141, 110, 255, 0.4);
  transform: scale(1.05);
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.step-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* Final CTA Section */
.final-cta-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(15px);
  padding: 4rem 0;
}

.final-cta-content {
  text-align: center;
  max-width: 600px;
  padding: 0 2rem;
}

.final-cta-content h2 {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
}

.final-cta-content p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem 0;
}

.cta-button {
  font-size: 1.1rem;
  padding: 1rem 2rem;
  box-shadow: 0 4px 15px rgba(255, 185, 141, 0.3);
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 185, 141, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .features-title,
  .section-title {
    font-size: 2rem;
  }
  
  .feature-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-section,
  .features-section,
  .how-it-works-section,
  .final-cta-section {
    padding: 2rem 1rem;
  }
  
  .features-container,
  .how-it-works-container {
    padding: 0 1rem;
  }
  
  .feature-item {
    padding: 1.5rem;
  }
}
</style>