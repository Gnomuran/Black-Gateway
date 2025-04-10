<template>
  <q-page class="q-pa-md">
    <!-- Header mit Titel und Benutzerinfo -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-accent">Lernkurs</div>
      <div v-if="isLoggedIn" class="row items-center">
        <span class="text-subtitle1 text-accent q-mr-sm">Hallo, {{ userName }}!</span>
        <q-avatar color="accent" text-color="dark" size="sm">
          {{ userName.charAt(0) }}
        </q-avatar>
      </div>
    </div>
    
    <!-- Personalisierte Fortschrittsanzeige -->
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
    
    <!-- Liste der Subkategorien (Lernmodule) -->
    <div class="q-mb-lg">
  <div class="text-h5 q-mb-md text-accent">Lernmodule</div>
  
  <q-list bordered separator class="bg-dark">
    <q-item 
      v-for="subcategory in subcategories" 
      :key="subcategory.id"
      clickable
      @click="loadSubcategoryContent(subcategory.id)"
      :class="{ 'bg-secondary': activeSubcategoryId === subcategory.id }"
      class="text-white"
    >
      <q-item-section avatar>
        <q-icon 
          :name="isSubcategoryCompleted(subcategory.id) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'" 
          :color="isSubcategoryCompleted(subcategory.id) ? 'positive' : 'accent'"
          size="24px"
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
        />
      </q-item-section>
    </q-item>
  </q-list>
</div>
    <!-- Inhalte der ausgewählten Subkategorie -->
    <div v-if="activeSubcategoryContent.length > 0">
      <div class="text-h5 q-mb-md text-accent">{{ activeSubcategoryName }}</div>
      
      <q-card 
        v-for="(info, index) in activeSubcategoryContent" 
        :key="index"
        class="q-mb-md bg-dark text-white"
      >
        <q-card-section>
          <div class="text-h6 text-accent">{{ info.title }}</div>
          <div class="q-mt-sm" style="white-space: pre-line">{{ info.content }}</div>
          <q-img 
            v-if="info.image_url" 
            :src="info.image_url" 
            class="q-mt-md rounded-borders"
            spinner-color="accent"
          />
        </q-card-section>
      </q-card>
      
      <div class="text-right q-mt-lg">
        <q-btn 
          v-if="!isSubcategoryCompleted(activeSubcategoryId)"
          color="accent" 
          label="Thema abschließen" 
          text-color="dark"
          icon="check"
          @click="completeSubcategory(activeSubcategoryId)"
        />
        <q-btn 
          v-else
          color="positive" 
          label="Thema abgeschlossen" 
          text-color="dark"
          icon="done_all"
          disable
        />
      </div>
    </div>

    <!-- Login-Hinweis für nicht eingeloggte Nutzer -->
    <div v-if="!isLoggedIn" class="text-center q-mt-xl">
      <q-card class="bg-dark text-white">
        <q-card-section>
          <div class="text-h6 text-accent q-mb-sm">Bitte anmelden</div>
          <p>Melde dich an, um deinen Fortschritt zu speichern und Themen abzuschließen.</p>
          <q-btn 
            color="accent" 
            label="Zum Login" 
            text-color="dark"
            to="/login"
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../boot/axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'LernApp',
  
  setup() {
    const $q = useQuasar();
    const authStore = useAuthStore();
    
    // State
    const subcategories = ref([]);
    const completedSubcategories = ref([]);
    const activeSubcategoryId = ref(null);
    const activeSubcategoryContent = ref([]);
    
    // Benutzerdaten
    const isLoggedIn = computed(() => authStore.isLoggedIn());
    const userName = computed(() => authStore.user?.username || '');
    
    // Daten laden
    const loadData = async () => {
      try {
        // Subkategorien laden
        const subcatsResponse = await api.get('/info/subcategories');
        subcategories.value = subcatsResponse.data.filter(sc => sc.category_id === 1);
        
        // Abgeschlossene Subkategorien nur laden wenn eingeloggt
        if (isLoggedIn.value) {
          const completedResponse = await api.get('/info/completed');
          completedSubcategories.value = completedResponse.data;
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Laden der Daten',
          color: 'negative'
        });
        console.error(error);
      }
    };
    
    // Inhalte einer Subkategorie laden
    const loadSubcategoryContent = async (subcategoryId) => {
      try {
        if (!isLoggedIn.value) {
          $q.notify({
            message: 'Bitte anmelden um Inhalte zu sehen',
            color: 'accent',
            textColor: 'dark',
            icon: 'login'
          });
          return;
        }
        
        activeSubcategoryId.value = subcategoryId;
        const response = await api.get(`/info/subcategory/${subcategoryId}`);
        activeSubcategoryContent.value = response.data;
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Laden der Inhalte',
          color: 'negative'
        });
        console.error(error);
      }
    };
    
    // Berechnete Eigenschaften
    const totalSubcategories = computed(() => subcategories.value.length);
    const completedCount = computed(() => completedSubcategories.value.length);
    const progress = computed(() => {
      return totalSubcategories.value > 0 
        ? completedCount.value / totalSubcategories.value 
        : 0;
    });
    const progressPercentage = computed(() => Math.round(progress.value * 100));
    
    const activeSubcategoryName = computed(() => {
      const subcat = subcategories.value.find(sc => sc.id === activeSubcategoryId.value);
      return subcat ? subcat.name : '';
    });
    
    // Methoden
    const getInfoCount = (subcategoryId) => {
      // Platzhalter - könnte mit einer zusätzlichen API-Abfrage implementiert werden
      return subcategoryId % 3 + 2; // Simulierte Anzahl für Demo
    };
    
    const isSubcategoryCompleted = (id) => {
      return completedSubcategories.value.some(sc => sc.subcategoryId === id);
    };
    
    const completeSubcategory = async (subcategoryId) => {
      try {
        if (!isLoggedIn.value) {
          $q.notify({
            message: 'Bitte anmelden um Themen abzuschließen',
            color: 'accent',
            textColor: 'dark',
            icon: 'login'
          });
          return;
        }
        
        await api.post('/info/complete', { subcategoryId });
        await loadData();
        
        $q.notify({
          message: `Super ${userName.value}, Thema abgeschlossen!`,
          color: 'positive',
          textColor: 'dark',
          icon: 'celebration'
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Fehler beim Abschließen des Themas',
          color: 'negative'
        });
        console.error(error);
      }
    };
    
    // Initiales Laden und Reaktion auf Login-Änderungen
    onMounted(async () => {
      await loadData();
    });
    
    watch(isLoggedIn, async (newVal) => {
      if (newVal) {
        await loadData();
      } else {
        completedSubcategories.value = [];
      }
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
      progressPercentage,
      isLoggedIn,
      userName,
      loadSubcategoryContent,
      getInfoCount,
      isSubcategoryCompleted,
      completeSubcategory
    };
  }
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bevan:ital@0;1&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');

body {
  font-family: "Funnel Sans", sans-serif;
}

.text-accent {
  font-family: 'Bevan', sans-serif;
  color: #ffb98d;
}

.q-page {
  background-color: #1B1B2F;
  color: white;
}

.q-card {
  border: 1px solid #8D6EFF;
  border-radius: 8px;
}

.q-linear-progress__track {
  background-color: #1B1B2F !important;
}

.q-linear-progress__model {
  background-color: #4DFFFA !important;
}

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