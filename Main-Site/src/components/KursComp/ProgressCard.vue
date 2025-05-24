<template>
  <q-card class="q-mb-md bg-dark">
    <q-card-section>
      <div class="text-subtitle1 text-white">Deine Fortschritte</div>
      <q-linear-progress 
        :value="progress" 
        color="positive" 
        class="q-mt-sm"
        track-color="secondary"
        rounded
        size="10px"
      />
      <div class="row justify-between items-center q-mt-sm">
        <div class="text-caption text-white">
          {{ completedCount }} von {{ totalSubcategories }} Themen
        </div>
        <div 
          :class="progress > 0 ? 'text-positive' : 'text-accent'" 
          class="text-caption"
        >
          {{ progressPercentage }}% geschafft
        </div>
      </div>
      <div v-if="progress >= 0.8" class="text-caption text-positive q-mt-xs">
        Großartig, du bist fast fertig! 
      </div>
      <div v-else-if="progress > 0" class="text-caption text-accent q-mt-xs">
        Gut gemacht, bleib dran! 
      </div>
      <div v-else class="text-caption text-accent q-mt-xs">
        Starte deine Lernreise! 
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  progress: Number,
  completedCount: Number,
  totalSubcategories: Number,
  progressPercentage: Number
});
</script>