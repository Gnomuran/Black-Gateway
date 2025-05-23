<template>
  <div class="q-mb-lg">
    <div class="text-h5 q-mb-md text-accent">Lernmodule</div>
    
    <q-list bordered separator class="bg-dark">
      <q-item 
        v-for="subcategory in subcategories" 
        :key="subcategory.id"
        clickable
        @click="$emit('subcategory-selected', subcategory.id)"
        :class="{ 'bg-secondary': activeSubcategoryId === subcategory.id }"
        class="text-white"
      >
        <q-item-section avatar>
          <q-icon 
            :name="isSubcategoryCompleted(subcategory.id) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'" 
            :color="isSubcategoryCompleted(subcategory.id) ? 'positive' : 'accent'"
            size="24px"
            class="transition-icon"
          />
        </q-item-section>
        
        <q-item-section>
          <q-item-label>{{ subcategory.name }}</q-item-label>
          <q-item-label caption class="text-accent">
            {{ getInfoCount(subcategory.id) }} Lektionen
          </q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <q-icon 
            :name="activeSubcategoryId === subcategory.id ? 'mdi-chevron-up' : 'mdi-chevron-down'" 
            color="accent" 
            size="sm"
            class="transition-icon"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  subcategories: Array,
  activeSubcategoryId: Number,
  completedSubcategories: Array
});

const emit = defineEmits(['subcategory-selected']);

const getInfoCount = (subcategoryId) => {
  return subcategoryId % 3 + 2;
};

const isSubcategoryCompleted = (id) => {
  return props.completedSubcategories.some(sc => sc.subcategoryId === id);
};
</script>

<style scoped>
.q-item {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
  }
}

.transition-icon {
  transition: transform 0.2s ease, color 0.3s ease;
}

.q-item:hover .transition-icon {
  transform: scale(1.1);
}
</style>