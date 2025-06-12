<template>
  <div class="blackhole-control-panel">
    <!-- Floating Control Button -->
    <q-btn
      fab
      :icon="showControls ? 'mdi-close' : 'mdi-palette'"
      color="primary"
      class="control-toggle"
      @click="toggleControls"
      :class="{ 'controls-open': showControls }"
    >
      <q-tooltip anchor="center left" self="center right" :delay="500">
        {{ showControls ? 'Schließen' : 'Blackhole anpassen' }}
      </q-tooltip>
    </q-btn>

    <!-- Control Panel -->
    <q-card 
      v-show="showControls"
      class="control-panel"
      dark
      :class="{ 'panel-visible': showControls }"
    >
      <q-card-section class="panel-header">
        <div class="row items-center">
          <q-icon name="mdi-black-mesa" size="24px" class="q-mr-sm" />
          <div class="text-h6">Blackhole Steuerung</div>
          <q-space />
          <q-btn
            flat
            dense
            round
            icon="mdi-refresh"
            @click="refreshBlackhole"
            class="refresh-btn"
          >
            <q-tooltip>Blackhole neu starten</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator dark />

      <!-- Color Controls -->
      <q-card-section class="color-section">
        <div class="section-title">
          <q-icon name="mdi-palette" class="q-mr-xs" />
          Farben
        </div>

        <!-- Primary Color -->
        <div class="color-group">
          <div class="color-label">Primärfarbe</div>
          <div class="color-grid">
            <div
              v-for="color in primaryColorPresets"
              :key="color.name"
              class="color-option"
              :class="{ active: isActivePrimary(color.value) }"
              :style="{ backgroundColor: color.hex }"
              @click="updatePrimaryColor(color.value)"
            >
              <q-tooltip>{{ color.name }}</q-tooltip>
              <q-icon 
                v-if="isActivePrimary(color.value)"
                name="mdi-check"
                color="white"
                size="16px"
                class="check-icon"
              />
            </div>
          </div>
        </div>

        <!-- Secondary Color -->
        <div class="color-group">
          <div class="color-label">Akzentfarbe</div>
          <div class="color-grid">
            <div
              v-for="color in secondaryColorPresets"
              :key="color.name"
              class="color-option"
              :class="{ active: isActiveSecondary(color.value) }"
              :style="{ backgroundColor: color.hex }"
              @click="updateSecondaryColor(color.value)"
            >
              <q-tooltip>{{ color.name }}</q-tooltip>
              <q-icon 
                v-if="isActiveSecondary(color.value)"
                name="mdi-check"
                color="white"
                size="16px"
                class="check-icon"
              />
            </div>
          </div>
        </div>

        <!-- Preset Combinations -->
        <div class="preset-section">
          <div class="color-label">Vordefinierte Kombinationen</div>
          <div class="preset-buttons">
            <q-btn
              v-for="preset in colorPresets"
              :key="preset.name"
              :label="preset.name"
              size="sm"
              :color="preset.active ? 'primary' : 'grey-7'"
              :text-color="preset.active ? 'white' : 'grey-3'"
              @click="applyPreset(preset)"
              class="preset-btn"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator dark />

      <!-- Performance Controls -->
      <q-card-section class="performance-section">
        <div class="section-title">
          <q-icon name="mdi-speedometer" class="q-mr-xs" />
          Performance
        </div>

        <div class="performance-controls">
          <q-toggle
            v-model="lowPerformanceMode"
            label="Energie sparen"
            color="positive"
            @update:model-value="updatePerformanceMode"
          />
          
          <div class="performance-info">
            <q-icon 
              :name="lowPerformanceMode ? 'mdi-battery-heart' : 'mdi-lightning-bolt'"
              :color="lowPerformanceMode ? 'positive' : 'warning'"
              size="16px"
            />
            <span class="info-text">
              {{ lowPerformanceMode ? 'Reduzierte Qualität für bessere Performance' : 'Volle Qualität' }}
            </span>
          </div>
        </div>
      </q-card-section>

      <q-separator dark />

      <!-- Action Buttons -->
      <q-card-section class="action-section">
        <div class="action-buttons">
          <q-btn
            outline
            color="positive"
            icon="mdi-refresh"
            label="Neu starten"
            @click="refreshBlackhole"
            class="action-btn"
          />
          
          <q-btn
            outline
            color="info"
            icon="mdi-restore"
            label="Zurücksetzen"
            @click="resetToDefaults"
            class="action-btn"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref,  watch } from 'vue';

// Props
const props = defineProps({
  primaryColor: {
    type: Array,
    default: () => [0.3, 0.6, 1.0]
  },
  secondaryColor: {
    type: Array,
    default: () => [1.0, 0.4, 0.1]
  },
  lowPerformanceMode: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'update:primaryColor',
  'update:secondaryColor', 
  'update:lowPerformanceMode',
  'refresh'
]);

// Reactive state
const showControls = ref(false);
const currentPrimary = ref([...props.primaryColor]);
const currentSecondary = ref([...props.secondaryColor]);
const lowPerformanceMode = ref(props.lowPerformanceMode);

// Color presets
const primaryColorPresets = ref([
  { name: 'Ozeanblau', value: [0.3, 0.6, 1.0], hex: '#4d99ff' },
  { name: 'Weltraum Lila', value: [0.7, 0.3, 1.0], hex: '#b34dff' },
  { name: 'Smaragdgrün', value: [0.2, 0.8, 0.4], hex: '#33cc66' },
  { name: 'Türkis', value: [0.2, 0.8, 0.8], hex: '#33cccc' },
  { name: 'Sternen Rosa', value: [1.0, 0.4, 0.8], hex: '#ff66cc' },
  { name: 'Galaxis Weiß', value: [0.9, 0.9, 1.0], hex: '#e6e6ff' }
]);

const secondaryColorPresets = ref([
  { name: 'Sonnen Orange', value: [1.0, 0.4, 0.1], hex: '#ff6619' },
  { name: 'Mars Rot', value: [1.0, 0.2, 0.2], hex: '#ff3333' },
  { name: 'Sternen Gelb', value: [1.0, 0.8, 0.2], hex: '#ffcc33' },
  { name: 'Nebel Pink', value: [1.0, 0.3, 0.6], hex: '#ff4d99' },
  { name: 'Cosmic Violett', value: [0.8, 0.2, 1.0], hex: '#cc33ff' },
  { name: 'Meteor Silber', value: [0.8, 0.8, 0.9], hex: '#cccceb' }
]);

// Preset combinations
const colorPresets = ref([
  {
    name: 'Klassisch',
    primary: [0.3, 0.6, 1.0],
    secondary: [1.0, 0.4, 0.1],
    active: true
  },
  {
    name: 'Nebula',
    primary: [0.7, 0.3, 1.0],
    secondary: [1.0, 0.3, 0.6],
    active: false
  },
  {
    name: 'Ozean',
    primary: [0.2, 0.8, 0.8],
    secondary: [1.0, 0.8, 0.2],
    active: false
  },
  {
    name: 'Feuer',
    primary: [1.0, 0.4, 0.8],
    secondary: [1.0, 0.2, 0.2],
    active: false
  },
  {
    name: 'Wald',
    primary: [0.2, 0.8, 0.4],
    secondary: [0.8, 0.2, 1.0],
    active: false
  }
]);

// Methods
const toggleControls = () => {
  showControls.value = !showControls.value;
};

const refreshBlackhole = () => {
  emit('refresh');
  // Visual feedback
  showRefreshAnimation();
};

const showRefreshAnimation = () => {
  // Kurze Animation für visuelles Feedback
  const refreshBtn = document.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.5s ease';
    setTimeout(() => {
      refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
  }
};

const updatePrimaryColor = (color) => {
  currentPrimary.value = [...color];
  emit('update:primaryColor', color);
  updatePresetActiveState();
};

const updateSecondaryColor = (color) => {
  currentSecondary.value = [...color];
  emit('update:secondaryColor', color);
  updatePresetActiveState();
};

const updatePerformanceMode = (value) => {
  emit('update:lowPerformanceMode', value);
};

const applyPreset = (preset) => {
  updatePrimaryColor(preset.primary);
  updateSecondaryColor(preset.secondary);
  
  // Update active state
  colorPresets.value.forEach(p => p.active = false);
  preset.active = true;
};

const resetToDefaults = () => {
  updatePrimaryColor([0.3, 0.6, 1.0]);
  updateSecondaryColor([1.0, 0.4, 0.1]);
  lowPerformanceMode.value = false;
  emit('update:lowPerformanceMode', false);
  
  // Reset preset
  colorPresets.value.forEach(p => p.active = false);
  colorPresets.value[0].active = true;
  
  refreshBlackhole();
};

const updatePresetActiveState = () => {
  // Check if current colors match any preset
  colorPresets.value.forEach(preset => {
    const primaryMatch = arraysEqual(currentPrimary.value, preset.primary);
    const secondaryMatch = arraysEqual(currentSecondary.value, preset.secondary);
    preset.active = primaryMatch && secondaryMatch;
  });
};

// Helper functions
const isActivePrimary = (color) => {
  return arraysEqual(currentPrimary.value, color);
};

const isActiveSecondary = (color) => {
  return arraysEqual(currentSecondary.value, color);
};

const arraysEqual = (arr1, arr2) => {
  return arr1.length === arr2.length && 
         arr1.every((val, i) => Math.abs(val - arr2[i]) < 0.01);
};

// Watchers
watch(() => props.primaryColor, (newVal) => {
  currentPrimary.value = [...newVal];
});

watch(() => props.secondaryColor, (newVal) => {
  currentSecondary.value = [...newVal];
});

watch(() => props.lowPerformanceMode, (newVal) => {
  lowPerformanceMode.value = newVal;
});
</script>

<style scoped>
.blackhole-control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.control-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.control-toggle:hover {
  transform: scale(1.05);
}

.controls-open {
  transform: rotate(45deg);
}

.control-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(30, 30, 30, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateX(100%) scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-visible {
  transform: translateX(0) scale(1);
  opacity: 1;
}

.panel-header {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  font-size: 14px;
}

.color-section {
  padding: 16px;
}

.color-group {
  margin-bottom: 20px;
}

.color-label {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
}

.color-option:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.color-option.active {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.check-icon {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 2px;
}

.preset-section {
  margin-top: 20px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-btn {
  font-size: 11px;
  min-height: 28px;
  padding: 4px 8px;
}

.performance-section {
  padding: 16px;
}

.performance-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.performance-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.info-text {
  font-size: 11px;
  color: #ccc;
}

.action-section {
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  font-size: 12px;
}

.refresh-btn {
  transition: transform 0.5s ease;
}

/* Scrollbar Styling */
.control-panel::-webkit-scrollbar {
  width: 4px;
}

.control-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.control-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .blackhole-control-panel {
    top: 10px;
    right: 10px;
  }
  
  .control-panel {
    width: 280px;
    max-height: 70vh;
  }
  
  .color-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .control-panel {
    width: calc(100vw - 40px);
    right: -10px;
  }
}
</style>