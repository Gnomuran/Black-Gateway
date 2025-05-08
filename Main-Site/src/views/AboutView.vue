
<template>
  <q-page class="q-pa-md">
    <!-- Header Component -->
    <HeaderSection />

    <!-- Loading Indicator -->
    <q-inner-loading :showing="nasa.isLoading">
      <q-spinner-gears size="50px" color="info" />
    </q-inner-loading>

    <!-- Error Notification -->
    <q-banner v-if="nasa.error" class="bg-negative text-white q-mb-md">
      {{ nasa.error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Dismiss" @click="nasa.clearError" />
      </template>
    </q-banner>

    <!-- Main Content Sections -->
    <div class="q-gutter-y-md">
      <!-- APOD Component -->
      <APODSection />

      <!-- NASA Media Search Component -->
      <NASAMediaSection />

      <!-- Mars Rover Photos Component -->
      <MarsRoverSection />
    </div>
  </q-page>
</template>

<script setup>
import { useNasaStore } from "../stores/nasa.js";
import HeaderSection from "../components/Ncomp/HeaderSection.vue";
import APODSection from "../components/Ncomp/APODSection.vue";
import NASAMediaSection from "../components/Ncomp/NASAMediaSection.vue";
import MarsRoverSection from "../components/Ncomp/MarsRoverSection.vue";

const nasa = useNasaStore();
</script>
<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.q-card {
  transition: transform 0.2s;
}

.q-card:hover {
  transform: translateY(-2px);
}
</style>