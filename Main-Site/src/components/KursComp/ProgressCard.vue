<template>
  <q-card class="progress-card q-mb-md">
    <q-card-section>
      <div class="progress-header">
        <q-icon name="mdi-chart-line" size="sm" color="accent" class="q-mr-sm" />
        <div class="text-subtitle1 text-white">Deine Fortschritte</div>
      </div>
      
      <!-- Enhanced Progress Bar -->
      <div class="progress-container q-mt-md">
        <q-linear-progress
          :value="progress"
          :color="progressColor"
          class="custom-progress"
          track-color="grey-9"
          rounded
          size="14px"
        />
        <!-- Progress glow effect -->
        <div class="progress-glow" :class="progressGlowClass" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      
      <div class="row justify-between items-center q-mt-sm">
        <div class="text-caption text-white">
          {{ completedCount }} von {{ totalSubcategories }} Themen
        </div>
        <div class="progress-percentage" :class="progressTextClass">
          {{ progressPercentage }}% geschafft
        </div>
      </div>
      
      <!-- Enhanced Motivational Messages -->
      <div class="motivation-text q-mt-sm" :class="motivationClass">
        <q-icon :name="motivationIcon" size="xs" class="q-mr-xs" />
        {{ motivationMessage }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  progress: Number,
  completedCount: Number,
  totalSubcategories: Number,
  progressPercentage: Number
});

// Computed für dynamische Farben und Nachrichten
const progressColor = computed(() => {
  if (props.progressPercentage >= 100) return 'positive';
  if (props.progressPercentage >= 80) return 'positive';
  if (props.progressPercentage >= 50) return 'info';
  if (props.progressPercentage >= 25) return 'accent';
  return 'orange';
});

const progressTextClass = computed(() => {
  if (props.progressPercentage >= 80) return 'text-positive';
  if (props.progressPercentage >= 50) return 'text-info';
  return 'text-accent';
});

const progressGlowClass = computed(() => {
  if (props.progressPercentage >= 80) return 'glow-positive';
  if (props.progressPercentage >= 50) return 'glow-info';
  return 'glow-accent';
});

const motivationIcon = computed(() => {
  if (props.progressPercentage >= 100) return 'mdi-trophy';
  if (props.progressPercentage >= 80) return 'mdi-fire';
  if (props.progressPercentage >= 50) return 'mdi-trending-up';
  if (props.progressPercentage > 0) return 'mdi-rocket-launch';
  return 'mdi-play-circle';
});

const motivationMessage = computed(() => {
  if (props.progressPercentage >= 100) return 'Perfekt! Alle  derzeitigen Module abgeschlossen! ';
  if (props.progressPercentage >= 80) return 'Großartig, du bist fast fertig! ';
  if (props.progressPercentage > 0) return 'Gut gemacht, bleib dran! ';
  return 'Starte deine Lernreise! ';
});

const motivationClass = computed(() => {
  if (props.progressPercentage >= 80) return 'motivation-excellent';
  if (props.progressPercentage >= 50) return 'motivation-good';
  if (props.progressPercentage > 0) return 'motivation-active';
  return 'motivation-start';
});
</script>

<style scoped>
.progress-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: rgba(255, 185, 141, 0.3);
}

.progress-header {
  display: flex;
  align-items: center;
}

.progress-container {
  position: relative;
}

.custom-progress {
  border-radius: 10px;
  overflow: hidden;
}

/* Glow Effect für Progress Bar */
.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 14px;
  border-radius: 10px;
  transition: all 1s ease;
  pointer-events: none;
}

.glow-accent {
  box-shadow: 0 0 12px rgba(255, 185, 141, 0.6);
}

.glow-info {
  box-shadow: 0 0 12px rgba(66, 165, 245, 0.6);
}

.glow-positive {
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
}

.progress-percentage {
  font-weight: 600;
  font-size: 0.85rem;
}

.motivation-text {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.motivation-start {
  color: var(--q-accent);
  background: rgba(255, 185, 141, 0.1);
  border-left: 3px solid var(--q-accent);
}

.motivation-active {
  color: var(--q-info);
  background: rgba(66, 165, 245, 0.1);
  border-left: 3px solid var(--q-info);
}

.motivation-good {
  color: var(--q-info);
  background: rgba(66, 165, 245, 0.15);
  border-left: 3px solid var(--q-info);
}

.motivation-excellent {
  color: var(--q-positive);
  background: rgba(76, 175, 80, 0.15);
  border-left: 3px solid var(--q-positive);
}

/* Responsive */
@media (max-width: 480px) {
  .progress-card {
    margin: 0 0.5rem 1rem 0.5rem;
  }
  
  .custom-progress {
    size: 12px;
  }
  
  .motivation-text {
    font-size: 0.8rem;
  }
}
</style>