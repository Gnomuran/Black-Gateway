<template>
  <div v-if="content.length > 0" class="content-display">
    <!-- Header with improved styling -->
    <div class="content-header">
      <h2 class="content-title">{{ name }}</h2>
      <q-linear-progress 
        v-if="loading" 
        indeterminate 
        color="accent" 
        class="q-mb-md"
      />
    </div>

    <!-- Content Cards with enhanced design -->
    <div class="content-grid">
      <q-card
        v-for="(info, index) in content"
        :key="index"
        class="content-card"
        flat
        bordered
      >
        <q-card-section class="card-header">
          <div class="card-title-wrapper">
            <q-icon 
              name="mdi-book-open-variant" 
              color="accent" 
              size="sm" 
              class="q-mr-sm"
            />
            <h3 class="card-title">{{ info.title }}</h3>
          </div>
        </q-card-section>

        <q-card-section class="card-content">
          <div class="content-text">{{ info.content }}</div>
          
          <!-- Enhanced image display -->
          <div v-if="info.image_url" class="image-container">
            <q-img
              :src="info.image_url"
              class="content-image"
              spinner-color="accent"
              loading="lazy"
              fit="cover"
              :ratio="16/9"
            >
              <template v-slot:error>
                <div class="image-error">
                  <q-icon name="mdi-image-broken" size="48px" color="grey-5" />
                  <p class="text-grey-5 q-mt-sm">Bild konnte nicht geladen werden</p>
                </div>
              </template>
            </q-img>
          </div>
        </q-card-section>

        <!-- Card progress indicator -->
        <q-linear-progress 
          :value="(index + 1) / content.length" 
          color="accent" 
          class="card-progress"
        />
      </q-card>
    </div>

    <!-- Action Button with improved UX -->
    <div class="action-section">
      <q-btn
        v-if="!isCompleted"
        color="accent"
        :label="`Thema abschließen (${content.length} Lektionen)`"
        text-color="dark"
        icon="mdi-check-circle"
        size="lg"
        rounded
        no-caps
        class="completion-btn"
        @click="$emit('complete')"
      >
        <q-tooltip class="bg-accent text-dark">
          Markiere dieses Thema als abgeschlossen
        </q-tooltip>
      </q-btn>
      
      <div v-else class="completed-indicator">
        <q-icon name="mdi-check-circle" color="positive" size="24px" />
        <span class="completed-text">Thema erfolgreich abgeschlossen!</span>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-state">
    <q-icon name="mdi-book-open-blank-variant" size="64px" color="grey-5" />
    <h3 class="text-grey-5 q-mt-md">Keine Inhalte verfügbar</h3>
    <p class="text-grey-6">Wähle ein Lernmodul aus der Liste aus.</p>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: Array,
    default: () => []
  },
  name: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['complete']);
</script>

<style scoped>
.content-display {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.content-header {
  margin-bottom: 2rem;
  text-align: center;
}

.content-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--q-accent);
  margin: 0;
  letter-spacing: -0.025em;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: var(--q-accent);
}

.card-header {
  padding: 1.5rem 1.5rem 0;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-accent);
  margin: 0;
  flex: 1;
}

.card-content {
  padding: 1rem 1.5rem 1.5rem;
}

.content-text {
  color: rgba(255,255,255,0.87);
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 1rem;
}

.image-container {
  margin-top: 1rem;
  border-radius: 12px;
  overflow: hidden;
}

.content-image {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.content-image:hover {
  transform: scale(1.02);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255,255,255,0.05);
}

.card-progress {
  height: 3px;
}

.action-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.completion-btn {
  min-width: 200px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.completion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.completed-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 50px;
}

.completed-text {
  color: var(--q-positive);
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 600px) {
  .content-display {
    padding: 0 8px;
  }
  
  .content-title {
    font-size: 1.5rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .completion-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>