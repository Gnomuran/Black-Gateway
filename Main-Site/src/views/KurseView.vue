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
          @click="loadSubcategoryContent(subcategory.id)"
          :class="{ 'bg-grey-2': activeSubcategoryId === subcategory.id }"
        >
          <q-item-section avatar>
            <q-icon 
              :name="isSubcategoryCompleted(subcategory.id) ? 'check_circle' : 'radio_button_unchecked'" 
              :color="isSubcategoryCompleted(subcategory.id) ? 'positive' : 'grey'"
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
    <div v-if="activeSubcategoryContent.length > 0">
      <div class="text-h5 q-mb-md">{{ activeSubcategoryName }}</div>
      
      <q-card 
        v-for="(info, index) in activeSubcategoryContent" 
        :key="index"
        class="q-mb-md"
      >
        <q-card-section>
          <div class="text-h6">{{ info.title }}</div>
          <div class="q-mt-sm" style="white-space: pre-line">{{ info.content }}</div>
          <q-img 
            v-if="info.image_url" 
            :src="info.image_url" 
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
      
      <div class="text-right q-mt-lg">
        <q-btn 
          v-if="!isSubcategoryCompleted(activeSubcategoryId)"
          color="primary" 
          label="Thema abschließen" 
          @click="completeSubcategory(activeSubcategoryId)"
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
    const allInfos = ref([]);
    const completedSubcategories = ref([]);
    const activeSubcategoryId = ref(null);
    const activeSubcategoryContent = ref([]);
    
    // Daten laden
    const loadData = async () => {
      try {
        // Subkategorien laden
        const subcatsResponse = await api.get('/info/subcategories');
        subcategories.value = subcatsResponse.data.filter(sc => sc.category_id === 1); // Nur Schwarze Löcher
        
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
    
    // Inhalte einer Subkategorie laden
    const loadSubcategoryContent = async (subcategoryId) => {
      try {
        activeSubcategoryId.value = subcategoryId;
        const response = await api.get(`/info/subcategory/${subcategoryId}`);
        activeSubcategoryContent.value = response.data;
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Laden der Inhalte'
        });
        console.error(error);
      }
    };
    
    // Berechnete Eigenschaften
    const totalSubcategories = computed(() => subcategories.value.length);
    const completedCount = computed(() => completedSubcategories.value.length);
    const progress = computed(() => completedCount.value / totalSubcategories.value);
    
    const activeSubcategoryName = computed(() => {
      const subcat = subcategories.value.find(sc => sc.id === activeSubcategoryId.value);
      return subcat ? subcat.name : '';
    });
    
    // Methoden
    const getInfoCount = (subcategoryId) => {
      // Da wir die Infos erst bei Bedarf laden, können wir hier nicht die tatsächliche Anzahl wissen
      // Alternativ könnten wir alle Infos auf einmal laden und hier filtern
      return 0; // Platzhalter, könnte verbessert werden
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
      completedSubcategories,
      activeSubcategoryId,
      activeSubcategoryContent,
      activeSubcategoryName,
      totalSubcategories,
      completedCount,
      progress,
      loadSubcategoryContent,
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