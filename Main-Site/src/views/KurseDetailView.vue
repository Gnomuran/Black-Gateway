<template>
    <q-page class="q-pa-md">
      <q-btn flat icon="arrow_back" label="Zurück" @click="$router.back()" class="q-mb-md" />
  
      <q-card v-if="loading" class="q-pa-md text-center">
        <q-spinner color="primary" size="40px" />
      </q-card>
  
      <q-card v-for="(info, index) in store.subcategoryInfo" :key="index" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ info.title }}</div>
          <div class="text-body1 q-mt-sm">{{ info.content }}</div>
          <q-img v-if="info.image_url" :src="info.image_url" class="q-mt-md" />
        </q-card-section>
      </q-card>
  
      <q-btn
        color="positive"
        icon="check"
        label="Als fertig markieren"
        class="q-mt-lg"
        @click="completeSubcategory"
      />
    </q-page>
  </template>
  
  <script setup>
  import { onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useInfoStore } from '../stores/infostore';
  import { Notify } from 'quasar';
  
  const route = useRoute();
  const store = useInfoStore();
  const loading = computed(() => store.loading);
  const subcategoryId = route.params.id;
  
  onMounted(async () => {
    await store.fetchSubcategoryInfo(subcategoryId);
  });
  
  const completeSubcategory = async () => {
    const msg = await store.markAsCompleted(subcategoryId);
    Notify.create({
      message: msg,
      color: 'green',
      icon: 'check',
    });
  };
  </script>
  