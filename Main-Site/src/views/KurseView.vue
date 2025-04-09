<template>
  <q-page class="q-pa-md">
    <q-toolbar class="bg-primary text-white q-mb-md">
      <q-toolbar-title>Infos & Lernübersicht</q-toolbar-title>
    </q-toolbar>

    <q-card v-if="loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="40px" />
    </q-card>

    <div class="row q-col-gutter-md">
      <q-card
        v-for="(item, index) in groupedSubcategories"
        :key="index"
        class="col-xs-12 col-sm-6 col-md-4"
        clickable
        @click="goToSubcategory(item.subcategoryId)"
      >
        <q-card-section>
          <div class="text-h6">{{ item.subcategory }}</div>
          <div class="text-subtitle2 text-grey">{{ item.category }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, computed } from 'vue';
import { useInfoStore } from '../stores/infostore';

const router = useRouter();
const store = useInfoStore();

const loading = computed(() => store.loading);

// Gruppierung aller Infos nach Subkategorie
const groupedSubcategories = computed(() => {
  const seen = new Map();
  return store.allInfo.filter((item) => {
    if (!seen.has(item.subcategory)) {
      seen.set(item.subcategory, item.subcategory);
      return true;
    }
    return false;
  }).map((item) => ({
    subcategory: item.subcategory,
    subcategoryId: item.subcategory_id || item.subcategoryId,
    category: item.category
  }));
});

const goToSubcategory = (id) => {
  router.push(`/kurse/${id}`);
};

onMounted(async () => {
  await store.fetchAllInfo();
});
</script>
