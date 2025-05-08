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
      <!-- APOD Section -->
      <q-card class="bg-primary">
        <q-card-section>
          <div class="text-h5 accent">Astronomy Picture of the Day</div>
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

      <!-- NASA Image Library Section -->
      <q-card class="bg-primary">
        <q-card-section>
          <div class="text-h5 text-white">NASA Image & Video Library</div>
          <q-banner class="bg-positive text-dark q-mt-sm">
            <template v-slot:avatar>
              <q-icon name="info" color="dark" />
            </template>
            Search over 140,000 NASA images and videos. Try terms like "Hubble",
            "Moon", or "Earth".
          </q-banner>
        </q-card-section>

        <q-separator color="info" />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-8">
              <q-input
                v-model="searchQuery"
                label="Search NASA Media"
                outlined
                dense
                color="info"
                dark
                @keyup.enter="nasa.fetchNasaMedia(searchQuery)"
              >
                <template v-slot:append>
                  <q-icon
                    name="search"
                    class="cursor-pointer"
                    color="info"
                    @click="nasa.fetchNasaMedia(searchQuery)"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-md-4">
              <q-btn
                color="info"
                label="Search"
                @click="nasa.fetchNasaMedia(searchQuery)"
                class="full-width"
                icon="search"
              />
            </div>
          </div>

          <div v-if="nasa.nasaMedia.length > 0" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm text-white">
              {{ nasa.nasaMedia.length }} results found
            </div>

            <div class="row q-col-gutter-sm">
              <div
                v-for="(item, index) in visibleMediaItems"
                :key="index"
                class="col-6 col-sm-4 col-md-3"
              >
                <q-card class="cursor-pointer" @click="openMediaDialog(item)">
                  <q-img
                    :src="getMediaThumbnail(item)"
                    :ratio="1"
                    class="rounded-borders"
                  />

                  <q-card-section class="q-pa-sm">
                    <div
                      class="text-caption text-weight-medium ellipsis-2-lines"
                    >
                      {{ item.data[0].title }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatDate(item.data[0].date_created) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="text-center q-mt-md">
              <q-btn
                v-if="nasa.nasaMedia.length > itemsToShow"
                color="info"
                :label="showMoreMedia ? 'Show Less' : 'Show More'"
                outline
                @click="showMoreMedia = !showMoreMedia"
              />
            </div>
          </div>

          <div
            v-else-if="searchQuery && !nasa.isLoading"
            class="text-center q-pa-lg"
          >
            <q-icon name="search_off" size="xl" color="grey-5" />
            <div class="text-grey-5 q-mt-sm">No results found</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Mars Rover Section -->
      <q-card class="bg-primary">
        <q-card-section>
          <div class="text-h5 text-white">Mars Rover Photos</div>
          <q-banner class="bg-positive text-dark q-mt-sm">
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
                      class="absolute-bottom text-caption text-center ellipsis"
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
    </div>

    <!-- Image Dialog -->
    <q-dialog v-model="imageDialog.open" maximized>
      <q-card class="bg-primary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">Image Viewer</div>
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

    <!-- Media Dialog -->
    <q-dialog v-model="mediaDialog.open" maximized>
      <q-card class="bg-primary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">{{ mediaDialog.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="flex flex-center">
          <q-img
            v-if="mediaDialog.type === 'image'"
            :src="mediaDialog.url"
            spinner-color="info"
            style="max-height: 80vh; max-width: 90vw"
          />

          <video
            v-else-if="mediaDialog.type === 'video'"
            controls
            autoplay
            style="max-height: 80vh; max-width: 90vw"
          >
            <source :src="mediaDialog.url" :type="mediaDialog.mimeType" />
            Your browser does not support the video tag.
          </video>
        </q-card-section>

        <q-card-section
          v-if="mediaDialog.description"
          class="q-pt-none text-white"
        >
          <p>{{ mediaDialog.description }}</p>
          <div class="text-caption text-grey-4">
            Published: {{ mediaDialog.date }}
          </div>
          <q-btn
            v-if="mediaDialog.url"
            color="info"
            label="View Original"
            :href="mediaDialog.url"
            target="_blank"
            icon="open_in_new"
            class="q-mt-sm"
            outline
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useNasaStore } from "../stores/nasa.js";
import { date } from "quasar";

const nasa = useNasaStore();
const { formatDate } = date;

// Form inputs
const marsDate = ref("");
const rover = ref("curiosity");
const roverOptions = ["curiosity", "opportunity", "spirit", "perseverance"];
const searchQuery = ref("");
const apodDate = ref("");
const showMoreMedia = ref(false);
const itemsToShow = ref(8);

// Max date for APOD (today)
const maxDate = ref(formatDate(Date.now(), "YYYY-MM-DD"));

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

// Media Dialog
const mediaDialog = ref({
  open: false,
  url: "",
  title: "",
  description: "",
  date: "",
  type: "image",
  mimeType: "",
});

// Computed
const visibleMediaItems = computed(() => {
  return showMoreMedia.value
    ? nasa.nasaMedia
    : nasa.nasaMedia.slice(0, itemsToShow.value);
});

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

function isValidMarsDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function roverDateLimits(d) {
  const dateStr = formatDate(d, "YYYY-MM-DD");
  const roverMinDate = roverLandingDates[rover.value];
  const today = maxDate.value;

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

function getMediaThumbnail(item) {
  if (item.links) {
    const thumb = item.links.find((link) => link.rel === "preview");
    return thumb?.href || "/placeholder.jpg";
  }
  return "/placeholder.jpg";
}

function openImageDialog(url) {
  imageDialog.value.url = url;
  imageDialog.value.open = true;
}

function openMediaDialog(item) {
  const data = item.data[0];
  const asset = item.links.find(
    (link) => link.rel === "orig" || link.render === "image"
  );

  mediaDialog.value = {
    open: true,
    url: asset?.href || getMediaThumbnail(item),
    title: data.title,
    description: data.description,
    date: formatDate(data.date_created, "YYYY-MM-DD"),
    type: data.media_type === "video" ? "video" : "image",
    mimeType: asset?.href?.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
  };
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