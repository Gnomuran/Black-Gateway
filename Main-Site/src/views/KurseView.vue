<template>
  <q-page class="q-pa-md">
    <!-- Header mit Titel -->
    <div class="text-h4 q-mb-md">Lernkurs: Schwarze Löcher</div>
    
    <!-- Fortschrittsanzeige -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">Dein Fortschritt</div>
        <q-linear-progress 
          :value="progress" 
          color="primary" 
          class="q-mt-sm"
        />
        <div class="text-caption q-mt-sm">{{ completedCount }} von {{ totalSubcategories }} Themen abgeschlossen</div>
      </q-card-section>
    </q-card>
    
    <!-- Liste der Subkategorien (Lernmodule) -->
    <div class="q-mb-lg">
      <div class="text-h5 q-mb-md">Lernmodule</div>
      
      <q-list bordered separator>
        <q-item 
          v-for="subcategory in subcategories" 
          :key="subcategory.id"
          clickable
          @click="toggleSubcategory(subcategory.id)"
          :class="{ 'bg-grey-2': activeSubcategory === subcategory.id }"
        >
          <q-item-section avatar>
            <q-icon 
              :name="isSubcategoryCompleted(subcategory.id) ? 'check_circle' : 'radio_button_unchecked'" 
              :color="isSubcategoryCompleted(subcategory.id) ? 'positive' : 'green'"
            />
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ subcategory.name }}</q-item-label>
            <q-item-label caption>{{ getInfoCount(subcategory.id) }} Lektionen</q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <q-icon name="keyboard_arrow_down" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    
    <!-- Inhalte der ausgewählten Subkategorie -->
    <div v-if="activeSubcategory">
      <div class="text-h5 q-mb-md">{{ getSubcategoryName(activeSubcategory) }}</div>
      
      <q-card 
        v-for="info in activeSubcategoryInfos" 
        :key="info.id"
        class="q-mb-md"
      >
        <q-card-section>
          <div class="text-h6">{{ info.title }}</div>
          <div class="q-mt-sm">{{ info.content }}</div>
          <q-img 
            v-if="info.image_url" 
            :src="info.image_url" 
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
      
      <div class="text-right q-mt-lg">
        <q-btn 
          v-if="!isSubcategoryCompleted(activeSubcategory)"
          color="primary" 
          label="Thema abschließen" 
          @click="completeSubcategory(activeSubcategory)"
        />
        <q-btn 
          v-else
          color="grey" 
          label="Thema abgeschlossen" 
          disable
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api } from '../boot/axios';
import { useQuasar } from 'quasar';

export default {
  name: 'LernApp',
  
  setup() {
    const $q = useQuasar();
    
    // State
    const subcategories = ref([]);
    const infos = ref([]);
    const completedSubcategories = ref([]);
    const activeSubcategory = ref(null);
    
    // Daten laden
    const loadData = async () => {
      try {
        // Subkategorien laden
        const subcatsResponse = await api.get('/info/subcategories');
        subcategories.value = subcatsResponse.data.filter(sc => sc.category_id === 1); // Nur Schwarze Löcher
        
        // Infos laden
        const infosResponse = await api.get('/info/all');
        infos.value = infosResponse.data.filter(info => info.category === 'Schwarze Löcher');
        
        // Abgeschlossene Subkategorien laden
        const completedResponse = await api.get('/info/completed');
        completedSubcategories.value = completedResponse.data;
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Laden der Daten'
        });
        console.error(error);
      }
    };
    
    // Berechnete Eigenschaften
    const totalSubcategories = computed(() => subcategories.value.length);
    const completedCount = computed(() => completedSubcategories.value.length);
    const progress = computed(() => completedCount.value / totalSubcategories.value);
    
    const activeSubcategoryInfos = computed(() => {
      return infos.value.filter(info => info.subcategory_id === activeSubcategory.value);
    });
    
    // Methoden
    const toggleSubcategory = (id) => {
      activeSubcategory.value = activeSubcategory.value === id ? null : id;
    };
    
    const getSubcategoryName = (id) => {
      const subcat = subcategories.value.find(sc => sc.id === id);
      return subcat ? subcat.name : '';
    };
    
    const getInfoCount = (subcategoryId) => {
      return infos.value.filter(info => info.subcategory_id === subcategoryId).length;
    };
    
    const isSubcategoryCompleted = (id) => {
      return completedSubcategories.value.some(sc => sc.subcategoryId === id);
    };
    
    const completeSubcategory = async (subcategoryId) => {
      try {
        await api.post('/info/complete', { subcategoryId });
        await loadData(); // Daten neu laden um den Status zu aktualisieren
        $q.notify({
          type: 'positive',
          message: 'Thema erfolgreich abgeschlossen!'
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Abschließen des Themas'
        });
        console.error(error);
      }
    };
    
    // Initiales Laden
    onMounted(() => {
      loadData();
    });
    
    return {
      subcategories,
      infos,
      completedSubcategories,
      activeSubcategory,
      activeSubcategoryInfos,
      totalSubcategories,
      completedCount,
      progress,
      toggleSubcategory,
      getSubcategoryName,
      getInfoCount,
      isSubcategoryCompleted,
      completeSubcategory
    };
  }
};
</script>

<style scoped>
/* Zusätzliche Stile können hier hinzugefügt werden */
</style>