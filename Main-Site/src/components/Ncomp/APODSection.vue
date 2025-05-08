<template>
    <!-- APOD Section -->
    <q-card class="bg-secondary">
      <q-card-section>
        <div class="text-h5 text-accent">Astronomy Picture of the Day</div>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="apodDate"
            label="Select Date"
            outlined
            dense
            class="col-md-4"
            color="info"
            dark
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer" color="info">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="apodDate"
                    mask="YYYY-MM-DD"
                    :max="maxDate"
                    color="info"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
  
          <q-btn
            color="info"
            label="Get Picture"
            @click="nasa.fetchAPOD(apodDate)"
            icon="refresh"
          />
  
          <q-btn
            color="positive"
            label="Random Date"
            @click="getRandomApodDate()"
            icon="shuffle"
          />
        </div>
        <div class="text-subtitle2 q-mt-sm text-white" v-if="nasa.apodData">
          {{ nasa.apodData.date }} | {{ nasa.apodData.title }}
        </div>
      </q-card-section>
  
      <q-separator color="info" />
  
      <q-card-section
        v-if="nasa.apodData"
        class="row items-start q-gutter-md"
      >
        <div class="col-md-8">
          <q-img
            :src="nasa.apodImageUrl"
            :alt="nasa.apodData.title"
            spinner-color="info"
            style="max-height: 70vh"
            class="rounded-borders"
          />
        </div>
  
        <div class="col-md-4 text-white">
          <p class="q-mt-sm">{{ nasa.apodData.explanation }}</p>
          <div v-if="nasa.apodData.copyright" class="text-caption q-mt-sm">
            <strong>Copyright:</strong> {{ nasa.apodData.copyright }}
          </div>
  
          <div class="q-mt-md">
            <q-btn
              color="info"
              label="Get Today's Picture"
              @click="fetchTodayAPOD()"
              icon="update"
              class="q-mr-sm"
            />
            <q-btn
              v-if="nasa.apodData.url"
              color="white"
              label="View Original"
              :href="nasa.apodData.url"
              target="_blank"
              icon="open_in_new"
              outline
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useNasaStore } from "../../stores/nasa.js";
  import { date } from "quasar";
  
  const nasa = useNasaStore();
  const { formatDate } = date;
  
  // Form inputs
  const apodDate = ref("");
  
  // Max date for APOD (today)
  const maxDate = ref(formatDate(Date.now(), "YYYY-MM-DD"));
  
  // Helper functions
  function getRandomApodDate() {
    const start = new Date(1995, 5, 16); // APOD start date
    const end = new Date();
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    apodDate.value = formatDate(randomDate, "YYYY-MM-DD");
    nasa.fetchAPOD(apodDate.value);
  }
  
  function fetchTodayAPOD() {
    apodDate.value = maxDate.value;
    nasa.fetchAPOD();
  }
  
  // Initial load
  onMounted(() => {
    fetchTodayAPOD();
  });
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