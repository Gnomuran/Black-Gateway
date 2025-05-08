<template>
    <!-- Mars Rover Section -->
    <q-card class="bg-secondary">
      <q-card-section>
        <div class="text-h5 text-accent">Mars Rover Photos</div>
        <q-banner class="bg-info text-dark q-mt-sm">
          <template v-slot:avatar>
            <q-icon name="info" color="dark" />
          </template>
          Tip: Curiosity has the most photos available. Perseverance provides
          the newest images.
          <br />
          Earth dates should be between 2012-08-06 (Curiosity landing) and
          today.
        </q-banner>
      </q-card-section>
  
      <q-separator color="info" />
  
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-4">
            <q-select
              v-model="rover"
              :options="roverOptions"
              label="Select Rover"
              outlined
              dense
              color="info"
              dark
              @update:model-value="showRoverInfo"
            />
  
            <q-input
              v-model="marsDate"
              label="Earth Date (YYYY-MM-DD)"
              outlined
              dense
              class="q-mt-sm"
              color="info"
              dark
              :rules="[(val) => isValidMarsDate(val) || 'Invalid date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="info">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="marsDate"
                      mask="YYYY-MM-DD"
                      :options="roverDateLimits"
                      color="info"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
  
            <q-btn
              color="info"
              label="Load Photos"
              @click="nasa.fetchMarsPhotos(rover, marsDate)"
              class="q-mt-sm full-width"
              icon="photo_camera"
              :disable="!isValidMarsDate(marsDate)"
            />
          </div>
  
          <div class="col-md-8">
            <div
              v-if="nasa.marsPhotos.length === 0"
              class="text-center q-pa-lg"
            >
              <q-icon name="photo_camera" size="xl" color="grey-5" />
              <div class="text-grey-5 q-mt-sm">No photos loaded yet</div>
            </div>
  
            <div v-else class="row q-col-gutter-sm">
              <div
                v-for="photo in nasa.marsPhotos.slice(0, 6)"
                :key="photo.id"
                class="col-6 col-sm-4 col-md-3"
              >
                <q-img
                  :src="photo.img_src"
                  :alt="photo.camera.full_name"
                  class="rounded-borders cursor-pointer"
                  style="height: 120px"
                  @click="openImageDialog(photo.img_src)"
                >
                  <div
                    class="absolute-bottom text-caption text-center ellipsis text-white bg-secondary"
                  >
                    {{ photo.camera.name }} (Sol {{ photo.sol }})
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  
    <!-- Image Dialog -->
    <q-dialog v-model="imageDialog.open" maximized>
      <q-card class="bg-secondary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-accent">Image Viewer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>
  
        <q-card-section class="flex flex-center">
          <q-img
            :src="imageDialog.url"
            spinner-color="info"
            style="max-height: 80vh; max-width: 90vw"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useNasaStore } from "../../stores/nasa.js";
  import { date } from "quasar";
  
  const nasa = useNasaStore();
  const { formatDate } = date;
  
  // Form inputs
  const marsDate = ref("");
  const rover = ref("curiosity");
  const roverOptions = ["curiosity", "opportunity", "spirit", "perseverance"];
  
  // Rover landing dates
  const roverLandingDates = {
    curiosity: "2012-08-06",
    opportunity: "2004-01-25",
    spirit: "2004-01-04",
    perseverance: "2021-02-18",
  };
  
  // Image Dialog
  const imageDialog = ref({
    open: false,
    url: "",
  });
  
  // Max date for Mars (today)
  const maxDate = formatDate(Date.now(), "YYYY-MM-DD");
  
  // Helper functions
  function isValidMarsDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  }
  
  function roverDateLimits(d) {
    const dateStr = formatDate(d, "YYYY-MM-DD");
    const roverMinDate = roverLandingDates[rover.value];
    const today = maxDate;
  
    return dateStr >= roverMinDate && dateStr <= today;
  }
  
  function showRoverInfo() {
    const roverInfo = {
      curiosity: "Active since 2012. Over 1 million photos available.",
      opportunity: "Active 2004-2018. Over 200,000 photos.",
      spirit: "Active 2004-2010. Over 100,000 photos.",
      perseverance: "Active since 2021. Newest Mars images.",
    };
  
    nasa.notifyUser(roverInfo[rover.value]);
  }
  
  function openImageDialog(url) {
    imageDialog.value.url = url;
    imageDialog.value.open = true;
  }
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