<template>
    <!-- Mars Rover Section -->
    <q-card class="bg-secondary">
      <q-card-section>
        <div class="text-h5 text-accent">Mars Rover Photos</div>
        <div class="row items-center">
          <div class="col">
          </div>
          <div class="col-auto q-ml-md q-mt-sm">
            <q-badge color="positive" class="q-pa-sm" v-if="nasa.marsPhotos.length > 0">
              {{ nasa.marsPhotos.length }} Photos Found
            </q-badge>
          </div>
        </div>
      </q-card-section>
  
      <q-separator color="info" />
  
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-4">
            <!-- Rover Selection with Icons -->
            <q-select
              v-model="rover"
              :options="roverOptions"
              label="Select Rover"
              outlined
              dense
              color="info"
              dark
              emit-value
              map-options
              @update:model-value="onRoverChange"
              :option-label="opt => opt.label"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected>
                <div class="row items-center">
                  <q-icon :name="selectedRoverOption.icon" class="q-mr-xs" />
                  {{ selectedRoverOption.label }}
                </div>
              </template>
            </q-select>
  
            <!-- Date Selection with Helper Text -->
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
              <template v-slot:hint>
                Available: {{ roverLandingDates[rover] }} - {{ maxDate }}
              </template>
            </q-input>
  
            <!-- Quick Date Selection -->
            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-6">
                <q-btn
                  color="secondary"
                  outline
                  label="Landing Day"
                  @click="setLandingDate"
                  class="full-width"
                  icon="start"
                  size="sm"
                  text-color="white"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="secondary"
                  outline
                  label="Today"
                  @click="setToday"
                  class="full-width"
                  icon="today"
                  size="sm"
                  text-color="white"
                />
              </div>
            </div>
  
            <!-- Cameras Selection -->
            <q-select
              v-model="selectedCamera"
              :options="availableCameras"
              label="Camera (Optional)"
              outlined
              dense
              class="q-mt-sm"
              color="info"
              dark
              clearable
              @update:model-value="onCameraChange"
            />
  
            <!-- Load Button -->
            <q-btn
              color="info"
              label="Load Photos"
              @click="loadPhotos"
              class="q-mt-sm full-width"
              icon="photo_camera"
              :disable="!isValidMarsDate(marsDate)"
              :loading="nasa.isLoading"
            />
            
            <!-- Rover Info Card -->
            <q-card class="q-mt-md bg-dark text-white">
              <q-card-section>
                <div class="text-subtitle2">{{ selectedRoverOption.label }} Info</div>
                <div class="text-caption q-mt-sm">{{ selectedRoverOption.description }}</div>
                <div class="q-mt-sm">
                  <q-badge color="info" class="q-mr-xs">Landing: {{ roverLandingDates[rover] }}</q-badge>
                  <q-badge :color="roverStatusColor">{{ roverStatus }}</q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>
  
          <div class="col-md-8">
            <!-- Loading State -->
            <div
              v-if="nasa.isLoading"
              class="text-center q-pa-lg"
            >
              <q-spinner-dots color="info" size="40px" />
              <div class="text-grey-5 q-mt-sm">Loading photos from Mars...</div>
            </div>
            
            <!-- Empty State -->
            <div
              v-else-if="nasa.marsPhotos.length === 0"
              class="text-center q-pa-lg"
            >
              <q-icon name="photo_camera" size="xl" color="grey-5" />
              <div class="text-grey-5 q-mt-sm">No photos loaded yet</div>
              <div class="text-grey-7 q-mt-xs text-caption">
                Select a rover and date, then click "Load Photos"
              </div>
            </div>
  
            <!-- Photos Grid with Responsive Layout -->
            <template v-else>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="photo in displayedPhotos"
                  :key="photo.id"
                  class="col-6 col-sm-4 col-md-4"
                >
                  <q-card class="photo-card">
                    <q-img
                      :src="photo.img_src"
                      :alt="photo.camera.full_name"
                      class="rounded-borders cursor-pointer"
                      style="height: 150px"
                      @click="openImageDialog(photo)"
                      contain
                    >
                      <template v-slot:loading>
                        <q-spinner-facebook color="white" />
                      </template>
                      <div
                        class="absolute-bottom text-caption text-center text-white bg-secondary q-pa-xs"
                      >
                        {{ photo.camera.name }} (Sol {{ photo.sol }})
                      </div>
                    </q-img>
                  </q-card>
                </div>
              </div>
              
              <!-- Pagination Controls -->
              <div class="row justify-center q-mt-md items-center">
                <q-pagination
                  v-if="totalPages > 1"
                  v-model="currentPage"
                  :max="totalPages"
                  direction-links
                  boundary-links
                  color="info"
                  active-color="accent"
                />
                
                <q-select
                  v-model="photosPerPage"
                  :options="[6, 12, 24, 48]"
                  label="Photos per page"
                  dense
                  outlined
                  color="info"
                  dark
                  style="width: 120px"
                  class="q-ml-md"
                />
              </div>
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  
    <!-- Enhanced Image Dialog -->
    <q-dialog v-model="imageDialog.open" maximized>
      <q-card class="bg-secondary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-accent">Mars Photo from {{ selectedRoverOption?.label }}</div>
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
  
        <q-card-section v-if="imageDialog.photoData" class="text-white">
          <div class="row q-col-gutter-md">
            <div class="col-md-6">
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="photo_camera" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Camera</q-item-label>
                    <q-item-label caption>{{ imageDialog.photoData.camera.full_name }} ({{ imageDialog.photoData.camera.name }})</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Earth Date</q-item-label>
                    <q-item-label caption>{{ imageDialog.photoData.earth_date }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-6">
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="public" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Sol (Mars Day)</q-item-label>
                    <q-item-label caption>{{ imageDialog.photoData.sol }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="link" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Actions</q-item-label>
                    <q-item-label caption>
                      <q-btn
                        color="white"
                        label="Open Original"
                        :href="imageDialog.url"
                        target="_blank"
                        icon="open_in_new"
                        outline
                        dense
                        size="sm"
                        class="q-mt-xs"
                      />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from "vue";
  import { useNasaStore } from "../../stores/nasa.js";
  import { date } from "quasar";
  
  const nasa = useNasaStore();
  const { formatDate } = date;
  
  // Form inputs with enhanced rover options
  const marsDate = ref("");
  const selectedCamera = ref(null);
  const currentPage = ref(1);
  const photosPerPage = ref(6);
  
  // Enhanced rover selection with icons and descriptions
  const roverOptionsList = [
    { 
      value: "curiosity", 
      label: "Curiosity", 
      icon: "science", 
      description: "Active since 2012. Over 1 million photos available."
    },
    { 
      value: "perseverance", 
      label: "Perseverance", 
      icon: "explore", 
      description: "Active since 2021. Newest Mars images."
    },
    { 
      value: "opportunity", 
      label: "Opportunity", 
      icon: "history", 
      description: "Active 2004-2018. Over 200,000 photos."
    },
    { 
      value: "spirit", 
      label: "Spirit", 
      icon: "history", 
      description: "Active 2004-2010. Over 100,000 photos."
    }
  ];
  
  const rover = ref("curiosity");
  const roverOptions = roverOptionsList;
  
  // Cameras by rover
  const roverCameras = {
    curiosity: ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"],
    perseverance: ["REAR_HAZCAM", "FRONT_HAZCAM", "NAVCAM", "MASTCAM_Z", "SUPERCAM", "MCZ", "SKYCAM", "SHERLOC", "WATSON"],
    opportunity: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"],
    spirit: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"]
  };
  
  // Rover landing dates
  const roverLandingDates = {
    curiosity: "2012-08-06",
    opportunity: "2004-01-25",
    spirit: "2004-01-04",
    perseverance: "2021-02-18",
  };
  
  // Rover mission status
  const roverStatusMap = {
    curiosity: { status: "Active", color: "positive" },
    perseverance: { status: "Active", color: "positive" },
    opportunity: { status: "Mission Complete", color: "orange" },
    spirit: { status: "Mission Complete", color: "orange" }
  };
  
  // Image Dialog with enhanced data
  const imageDialog = ref({
    open: false,
    url: "",
    photoData: null
  });
  
  // Max date for Mars (today)
  const maxDate = formatDate(Date.now(), "YYYY-MM-DD");
  
  // Computed properties
  const selectedRoverOption = computed(() => {
    return roverOptionsList.find(option => option.value === rover.value);
  });
  
  const roverStatus = computed(() => {
    return roverStatusMap[rover.value].status;
  });
  
  const roverStatusColor = computed(() => {
    return roverStatusMap[rover.value].color;
  });
  
  const availableCameras = computed(() => {
    return roverCameras[rover.value] || [];
  });
  
  const totalPages = computed(() => {
    return Math.ceil(nasa.marsPhotos.length / photosPerPage.value);
  });
  
  const displayedPhotos = computed(() => {
    const startIndex = (currentPage.value - 1) * photosPerPage.value;
    const endIndex = startIndex + photosPerPage.value;
    
    // Filter by camera if selected
    let filteredPhotos = nasa.marsPhotos;
    if (selectedCamera.value) {
      filteredPhotos = nasa.marsPhotos.filter(photo => 
        photo.camera.name === selectedCamera.value
      );
    }
    
    return filteredPhotos.slice(startIndex, endIndex);
  });
  
  // Watchers
  watch(photosPerPage, () => {
    // Reset to first page when changing items per page
    currentPage.value = 1;
  });
  
  watch(selectedCamera, () => {
    // Reset to first page when changing camera filter
    currentPage.value = 1;
  });
  
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
  
  function onRoverChange() {
    // Reset camera selection when rover changes
    selectedCamera.value = null;
    
    // Update date if current date is invalid for new rover
    if (marsDate.value) {
      const minDate = roverLandingDates[rover.value];
      if (marsDate.value < minDate) {
        marsDate.value = minDate;
      }
    }
    
    // Show rover info tooltip
    showRoverInfo();
  }
  
  function onCameraChange() {
    // Reset page when changing camera filter
    currentPage.value = 1;
  }
  
  function showRoverInfo() {
    nasa.notifyUser(selectedRoverOption.value.description);
  }
  
  function setLandingDate() {
    marsDate.value = roverLandingDates[rover.value];
  }
  
  function setToday() {
    marsDate.value = maxDate;
  }
  
  function loadPhotos() {
    currentPage.value = 1;
    nasa.fetchMarsPhotos(rover.value, marsDate.value);
  }
  
  function openImageDialog(photo) {
    imageDialog.value = {
      open: true,
      url: photo.img_src,
      photoData: photo
    };
  }
  
  // Initialize with today's date on mount
  onMounted(() => {
    marsDate.value = maxDate;
  });
  </script>
  
  <style scoped>
  .rounded-borders {
    border-radius: 8px;
  }
  .q-page
  {
    background-color:  #1B1B2F;
  }
  .q-card {
    transition: transform 0.2s;
  }
  
  .q-card:hover {
    transform: translateY(-2px);
  }
  
  .photo-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .photo-card:hover {
    transform: scale(1.03);
    border-color: var(--q-info);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
 
  
  </style>