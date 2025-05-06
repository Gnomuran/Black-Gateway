
<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row q-mb-md">
      <div class="col">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h4">NASA Explorer Dashboard</div>
            <div class="text-subtitle1">Discover the wonders of space</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading Indicator -->
    <q-inner-loading :showing="nasa.isLoading">
      <q-spinner-gears size="50px" color="primary" />
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
      <!-- APOD Section -->
      <q-card>
        <q-card-section>
          <div class="text-h5">Astronomy Picture of the Day</div>
          <div class="text-subtitle2" v-if="nasa.apodData">{{ nasa.apodData.date }}</div>
        </q-card-section>
        
        <q-separator />

        <q-card-section v-if="nasa.apodData" class="row items-start q-gutter-md">
          <div class="col-md-8">
            <q-img
              :src="nasa.apodImageUrl"
              :alt="nasa.apodData.title"
              spinner-color="primary"
              style="max-height: 70vh"
              class="rounded-borders"
            />
            
          </div>
          
          <div class="col-md-4">
            <div class="text-h6">{{ nasa.apodData.title }}</div>
            <p class="q-mt-sm">{{ nasa.apodData.explanation }}</p>
            <div v-if="nasa.apodData.copyright" class="text-caption q-mt-sm">
              <strong>Copyright:</strong> {{ nasa.apodData.copyright }}
            </div>
            
            <div class="q-mt-md">
              <q-btn 
                color="primary" 
                label="Get Today's Picture" 
                @click="nasa.fetchAPOD()" 
                icon="refresh"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Mars Rover Section -->
      <q-card>
        <q-card-section>
          <div class="text-h5">Mars Rover Photos</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-4">
              <q-select
                v-model="rover"
                :options="roverOptions"
                label="Select Rover"
                outlined
                dense
              />
              
              <q-input
                v-model="marsDate"
                label="Earth Date (YYYY-MM-DD)"
                outlined
                dense
                class="q-mt-sm"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="marsDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <q-btn
                color="primary"
                label="Load Photos"
                @click="nasa.fetchMarsPhotos(rover, marsDate)"
                class="q-mt-sm full-width"
                icon="photo_camera"
              />
            </div>
            
            <div class="col-md-8">
              <div v-if="nasa.marsPhotos.length === 0" class="text-center q-pa-lg">
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
                    <div class="absolute-bottom text-caption text-center ellipsis">
                      {{ photo.camera.name }}
                    </div>
                  </q-img>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- EPIC Section -->
      <q-card>
        <q-card-section>
          <div class="text-h5">EPIC Earth Images</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-btn
            color="primary"
            label="Load Latest Images"
            @click="nasa.fetchEPICImages()"
            icon="public"
          />
          
          <div v-if="nasa.epicImages.length === 0" class="text-center q-pa-lg">
            <q-icon name="public" size="xl" color="grey-5" />
            <div class="text-grey-5 q-mt-sm">No images loaded yet</div>
          </div>
          
          <div v-else class="row q-col-gutter-sm q-mt-md">
            <div 
              v-for="img in nasa.epicImages.slice(0, 4)" 
              :key="img.identifier" 
              class="col-6 col-sm-3"
            >
              <q-img
                :src="getEpicImageUrl(img)"
                :alt="img.caption"
                class="rounded-borders cursor-pointer"
                style="height: 180px"
                @click="openImageDialog(getEpicImageUrl(img))"
              >
                <div class="absolute-bottom text-caption text-center ellipsis">
                  {{ img.date.split(' ')[0] }}
                </div>
              </q-img>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Asteroids Section -->
      <q-card>
        <q-card-section>
          <div class="text-h5">Near-Earth Objects</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-4">
              <q-input
                v-model="startDate"
                label="Start Date (YYYY-MM-DD)"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="startDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <q-input
                v-model="endDate"
                label="End Date (YYYY-MM-DD)"
                outlined
                dense
                class="q-mt-sm"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="endDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <q-btn
                color="primary"
                label="Load Asteroids"
                @click="nasa.fetchAsteroids(startDate, endDate)"
                class="q-mt-sm full-width"
                icon="warning"
              />
            </div>
            
            <div class="col-md-8">
              <div v-if="nasa.asteroids.length === 0" class="text-center q-pa-lg">
                <q-icon name="warning" size="xl" color="grey-5" />
                <div class="text-grey-5 q-mt-sm">No asteroid data loaded yet</div>
              </div>
              
              <q-table
                v-else
                :rows="nasa.asteroids"
                :columns="asteroidColumns"
                row-key="id"
                :pagination="asteroidPagination"
                class="q-mt-sm"
                flat
                bordered
              >
                <template v-slot:body-cell-is_potentially_hazardous_asteroid="props">
                  <q-td :props="props">
                    <q-icon
                      :name="props.value ? 'warning' : 'check'"
                      :color="props.value ? 'negative' : 'positive'"
                      size="sm"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Image Dialog -->
    <q-dialog v-model="imageDialog.open" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Image Viewer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="flex flex-center">
          <q-img
            :src="imageDialog.url"
            spinner-color="primary"
            style="max-height: 80vh; max-width: 90vw"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNasaStore } from '../stores/nasa.js';

const nasa = useNasaStore();

// Form inputs
const marsDate = ref('');
const startDate = ref('');
const endDate = ref('');
const rover = ref('curiosity');
const roverOptions = ['curiosity', 'opportunity', 'spirit', 'perseverance'];

// EPIC image URL helper
function getEpicImageUrl(image) {
  const date = image.date.split(' ')[0].replace(/-/g, '/');
  return `https://epic.gsfc.nasa.gov/archive/natural/${date}/jpg/${image.image}.jpg`;
}

// Asteroid table columns
const asteroidColumns = [
  { 
    name: 'name', 
    label: 'Name', 
    field: 'name',
    align: 'left',
    sortable: true
  },
  { 
    name: 'estimated_diameter', 
    label: 'Diameter (m)', 
    field: row => row.estimated_diameter.meters.estimated_diameter_max.toFixed(1),
    align: 'right',
    sortable: true
  },
  { 
    name: 'is_potentially_hazardous_asteroid', 
    label: 'Hazardous', 
    field: 'is_potentially_hazardous_asteroid',
    align: 'center',
    sortable: true
  },
  { 
    name: 'close_approach_date', 
    label: 'Approach Date', 
    field: row => row.close_approach_data[0].close_approach_date,
    align: 'center',
    sortable: true
  }
];

const asteroidPagination = {
  sortBy: 'close_approach_date',
  descending: false,
  page: 1,
  rowsPerPage: 5
};

// Image dialog
const imageDialog = ref({
  open: false,
  url: ''
});

function openImageDialog(url) {
  imageDialog.value.url = url;
  imageDialog.value.open = true;
}

// Initial load
onMounted(() => {
  nasa.fetchAPOD();
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>