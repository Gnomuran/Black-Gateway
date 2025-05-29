<template>
  <div class="three-background-container">
    <!-- Three.js Hintergrund -->
    <div class="three-background">
      <ThreeModel />
    </div>
    
    <!-- Overlay Content -->
    <div class="overlay-content">
      <!-- Hero Section mit klarerer User Journey -->
      <section class="hero-section">
        <div class="hero-content">   
          <h1 class=" text-accent">Black Gateway</h1>
          <p class="subtitle">Deine personalisierte Lernplattform mit NASA-Integration</p>
          
          <!-- Klarere User Journey -->
          <div class="user-journey">
            <div class="journey-option new-user">
              <div class="journey-header">
                <q-icon name="mdi-account-plus" size="24px" color="accent" />
                <h3 >Ich bin neu hier</h3>
              </div>
              <p>Erstelle deinen Account und erhalte dein persönliches NASA-Bild</p>
              <q-btn
                color="accent"
                text-color="dark"
                label="Kostenlos registrieren"
                size="lg"
                rounded
                no-caps
                icon="mdi-rocket-launch"
                @click="goToRegister"
                class="journey-btn primary"
              />
            </div>
            
            <div class="journey-divider">
              <span>oder</span>
            </div>
            
            <div class="journey-option existing-user">
              <div class="journey-header">
                <q-icon name="mdi-account-check" size="24px" color="info" />
                <h3>Ich habe bereits einen Account</h3>
              </div>
              <p>Melde dich an und setze deine Lernreise fort</p>
              <q-btn
                flat
                color="white"
                label="Anmelden"
                size="lg"
                rounded
                no-caps
                icon="mdi-login"
                @click="goToLogin"
                class="journey-btn secondary"
              />
            </div>
          </div>
          
          <!-- Quick Preview Button -->
          <div class="preview-section">
            <q-btn
              flat
              color="accent"
              label="Erst mal schauen"
              size="md"
              no-caps
              icon="mdi-eye"
              @click="scrollToPreview"
              class="preview-btn"
            />
          </div>
        </div>
      </section>

      <!-- Interactive Preview Section -->
      <section class="preview-section-content" ref="previewSection">
        <div class="preview-container">
          <h2 class="preview-title">So sieht deine Lernerfahrung aus</h2>
          
          <!-- Interactive Demo Cards -->
          <div class="demo-cards">
            <div class="demo-card" :class="{ active: activeDemo === 'profile' }" @click="setActiveDemo('profile')">
              <div class="demo-header">
                <q-icon name="mdi-account-star" size="32px" color="accent" />
                <h3>Dein NASA-Profil</h3>
              </div>
              <div class="demo-preview">
                <div class="mock-profile">
                  <div class="mock-avatar">
                    <q-icon name="mdi-telescope" size="24px" />
                  </div>
                  <div class="mock-info">
                    <div class="mock-name">Dein Username</div>
                    <div class="mock-date">NASA-Bild vom Registrierungstag</div>
                  </div>
                </div>
              </div>
              <p>Erhalte dein einzigartiges NASA Astronomie-Bild als Profilbild</p>
            </div>

            <div class="demo-card" :class="{ active: activeDemo === 'modules' }" @click="setActiveDemo('modules')">
              <div class="demo-header">
                <q-icon name="mdi-book-multiple" size="32px" color="info" />
                <h3>Lernmodule</h3>
              </div>
              <div class="demo-preview">
                <div class="mock-modules">
                  <div class="mock-module completed">✓ Modul 1</div>
                  <div class="mock-module active">► Modul 2</div>
                  <div class="mock-module">○ Modul 3</div>
                </div>
              </div>
              <p>Strukturierte Lerninhalte mit automatischer Fortschrittsverfolgung</p>
            </div>

            <div class="demo-card" :class="{ active: activeDemo === 'forum' }" @click="setActiveDemo('forum')">
              <div class="demo-header">
                <q-icon name="mdi-forum" size="32px" color="positive" />
                <h3>Community Forum</h3>
              </div>
              <div class="demo-preview">
                <div class="mock-forum">
                  <div class="mock-post"> Diskussion über...</div>
                  <div class="mock-post"> Beliebtes Thema</div>
                  <div class="mock-post"> Frage & Antwort</div>
                </div>
              </div>
              <p>Tausche dich mit anderen Lernenden aus und stelle Fragen</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Simplified Features Section -->
      <section class="features-section">
        <div class="features-container">
          <h2 class="features-title">3 Schritte zu deinem Lernerfolg</h2>
          
          <div class="steps-visual">
            <div class="step-visual" v-for="(step, index) in steps" :key="index">
              <div class="step-circle">
                <q-icon :name="step.icon" size="32px" :color="step.color" />
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              
              <!-- Visual Connection -->
              <div v-if="index < steps.length - 1" class="step-connector">
                <q-icon name="mdi-arrow-down" size="24px" color="accent" />
              </div>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div class="steps-cta">
            <q-btn
              color="accent"
              text-color="dark"
              label="Jetzt starten - es ist kostenlos!"
              size="xl"
              rounded
              no-caps
              icon="mdi-rocket-launch"
              @click="goToRegister"
              class="main-cta"
            />
            
          </div>
        </div>
      </section>

      <!-- Trust & FAQ Section -->
      <section class="trust-section">
        <div class="trust-container">
          <h2>FAQ</h2>
          
          <div class="faq-list">
            <div class="faq-item" v-for="(faq, index) in faqs" :key="index" @click="toggleFaq(index)">
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <q-icon :name="openFaq === index ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </div>
              <div v-if="openFaq === index" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ThreeModel from '@/components/ThreeModel.vue';

const router = useRouter();
const authStore = useAuthStore();

// Refs
const previewSection = ref(null);
const activeDemo = ref('profile');
const openFaq = ref(null);

// Data
const steps = [
  {
    icon: 'mdi-account-plus',
    color: 'accent',
    title: 'Account erstellen',
    description: 'Registriere dich kostenlos und erhalte sofort dein persönliches NASA-Bild als Profilbild'
  },
  {
    icon: 'mdi-play-circle',
    color: 'info',
    title: 'Lernmodule starten',
    description: 'Wähle interessante Themen aus und beginne mit dem ersten Lernmodul - in deinem eigenen Tempo'
  },
  {
    icon: 'mdi-trophy',
    color: 'positive',
    title: 'Fortschritt verfolgen',
    description: 'Schließe Module ab, sammle Erfolge und tausche dich im Forum mit anderen Lernenden aus'
  }
];

const faqs = [
 
  {
    question: 'Was ist das NASA-Bild genau?',
    answer: 'Du erhältst das offizielle NASA "Astronomy Picture of the Day" von dem Tag, an dem du dich registriert hast. Das wird dein einzigartiges Profilbild.'
  },
  {
    question: 'Wie funktioniert das Lernen hier?',
    answer: 'Du arbeitest dich durch strukturierte Module mit Texten, Bildern und interaktiven Inhalten. Dein Fortschritt wird automatisch gespeichert.'
  },
  {
    question: 'Kann ich mit anderen Nutzern interagieren?',
    answer: 'Ja! Im integrierten Diskurs-Forum kannst du Fragen stellen, Diskussionen führen und dich mit anderen Lernenden austauschen.'
  }
];

// Methods
const goToRegister = () => {
  router.push('/register');
};

const goToLogin = () => {
  router.push('/login');
};

const scrollToPreview = () => {
  if (previewSection.value) {
    previewSection.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const setActiveDemo = (demo) => {
  activeDemo.value = demo;
};

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
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

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 900px;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 185, 141, 0.2);
  color: var(--q-accent);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #4DFFFA; /* Helles Cyan für besseren Kontrast */
  margin: 0 0 1rem 0;
  text-shadow: 0 0 20px rgba(77, 255, 250, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.subtitle {
  font-size: 1.3rem;
  color: #8D6EFF; /* Leuchtendes Lila für besseren Kontrast */
  margin: 0 0 3rem 0;
  text-shadow: 0 0 15px rgba(141, 110, 255, 0.5), 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.user-journey {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.journey-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 300px;
  transition: all 0.3s ease;
}

.journey-option:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
}

.new-user {
  border-color: var(--q-accent);
}

.journey-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.journey-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.journey-option p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.journey-btn {
  width: 100%;
  font-weight: 600;
}

.journey-divider {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  padding: 1rem;
}

.preview-section {
  margin-top: 2rem;
}

.preview-btn {
  text-decoration: underline;
  font-size: 0.9rem;
}

/* Interactive Preview Section */
.preview-section-content {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.preview-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.preview-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-card:hover,
.demo-card.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--q-accent);
  transform: translateY(-5px);
}

.demo-header {
  margin-bottom: 1.5rem;
}

.demo-header h3 {
  color: white;
  margin: 0.5rem 0 0 0;
  font-size: 1.25rem;
}

.demo-preview {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.mock-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.mock-avatar {
  width: 40px;
  height: 40px;
  background: var(--q-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1B1B2F;
}

.mock-info {
  text-align: left;
}

.mock-name {
  color: white;
  font-weight: 600;
}

.mock-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.mock-modules {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mock-module {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.mock-module.completed {
  background: rgba(76, 175, 80, 0.3);
  color: var(--q-positive);
}

.mock-module.active {
  background: rgba(77, 255, 250, 0.3);
  color: #4DFFFA;
}

.mock-forum {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mock-post {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Features Section */
.features-section {
  min-height: 100vh;
  background: rgba(255, 185, 141, 0.05);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.features-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 3rem;
}

.steps-visual {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 4rem;
}

.step-visual {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.step-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  transition: all 0.3s ease;
}

.step-visual:hover .step-circle {
  background: rgba(255, 185, 141, 0.2);
  border-color: var(--q-accent);
  transform: scale(1.1);
}

.step-visual h3 {
  color: white;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.step-visual p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.step-connector {
  margin: 1rem auto;
  opacity: 0.5;
}

.steps-cta {
  text-align: center;
}

.main-cta {
  font-size: 1.2rem;
  padding: 1.2rem 3rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(255, 185, 141, 0.3);
  transition: all 0.3s ease;
}

.main-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 185, 141, 0.4);
}

.cta-benefits {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Trust Section */
.trust-section {
  min-height: 80vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

.trust-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 2rem;
}

.trust-container h2 {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--q-accent);
}

.faq-question {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 600;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .user-journey {
    flex-direction: column;
  }
  
  .journey-divider {
    transform: rotate(90deg);
  }
  
  .demo-cards {
    grid-template-columns: 1fr;
  }
  
  .cta-benefits {
    flex-direction: column;
  }
  
  .steps-visual {
    gap: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section,
  .preview-section-content,
  .features-section,
  .trust-section {
    padding: 2rem 1rem;
  }
  
  .journey-option {
    padding: 1.5rem;
  }
  
  .main-cta {
    width: 100%;
    padding: 1rem 2rem;
  }
}
</style>