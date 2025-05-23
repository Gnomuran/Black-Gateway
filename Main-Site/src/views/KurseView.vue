<template>
  <q-page class="q-pa-md">
    <UserHeader 
      :is-logged-in="isLoggedIn" 
      :user-name="userName" 
      :nasa-apod-image-url="nasaApodImageUrl" 
    />
    
    <ProgressCard 
      v-if="isLoggedIn"
      :progress="progress"
      :completed-count="completedCount"
      :total-subcategories="totalSubcategories"
      :progress-percentage="progressPercentage"
    />
    
    <SubcategoryList 
      :subcategories="subcategories"
      :active-subcategory-id="activeSubcategoryId"
      :completed-subcategories="completedSubcategories"
      @subcategory-selected="loadSubcategoryContent"
    />
    
    <SubcategoryContent 
      v-if="isLoggedIn && activeSubcategoryContent.length > 0"
      :content="activeSubcategoryContent"
      :name="activeSubcategoryName"
      :is-completed="isSubcategoryCompleted(activeSubcategoryId)"
      @complete="completeSubcategory(activeSubcategoryId)"
    />
    
    <LoginPrompt v-if="!isLoggedIn" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../boot/axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useNasaStore } from '../stores/nasa';

import UserHeader from '../components/KursComp/UserHeader.vue';
import ProgressCard from '../components/KursComp/ProgressCard.vue';
import SubcategoryList from '../components/KursComp/SubcategoryList.vue';
import SubcategoryContent from '../components/KursComp/SubcategoryContent.vue';
import LoginPrompt from '../components/KursComp/LoginPrompt.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const nasaStore = useNasaStore();

// State
const subcategories = ref([]);
const completedSubcategories = ref([]);
const activeSubcategoryId = ref(null);
const activeSubcategoryContent = ref([]);

// Computed
const isLoggedIn = computed(() => authStore.isLoggedIn());
const userName = computed(() => authStore.user?.username || '');
const nasaApodImageUrl = computed(() => nasaStore.apodImageUrl);
const totalSubcategories = computed(() => subcategories.value.length);
const completedCount = computed(() => completedSubcategories.value.length);
const progress = computed(() => totalSubcategories.value > 0 
  ? completedCount.value / totalSubcategories.value 
  : 0
);
const progressPercentage = computed(() => Math.round(progress.value * 100));
const activeSubcategoryName = computed(() => {
  const subcat = subcategories.value.find(sc => sc.id === activeSubcategoryId.value);
  return subcat ? subcat.name : '';
});

// Methods
const loadData = async () => {
  try {
    const subcatsResponse = await api.get('/info/subcategories');
    subcategories.value = subcatsResponse.data.filter(sc => sc.category_id === 1);
    
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

const isSubcategoryCompleted = (id) => {
  return completedSubcategories.value.some(sc => sc.subcategoryId === id);
};

const completeSubcategory = async (subcategoryId) => {
  try {
    if (!isLoggedIn.value) return;
    
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

// Lifecycle
onMounted(async () => {
  await loadData();
  if (!nasaStore.apodData) {
    await nasaStore.fetchAPOD();
  }
});

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    await loadData();
  } else {
    completedSubcategories.value = [];
  }
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bevan:ital@0;1&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap');

.q-page {
  background-color: #1B1B2F;
  color: white;
}

.text-accent {
  font-family: 'Bevan', sans-serif;
  color: #ffb98d;
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
</style>