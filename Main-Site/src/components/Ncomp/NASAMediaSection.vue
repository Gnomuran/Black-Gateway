<template>
  <!-- NASA Image Library Section -->
  <q-card class="bg-secondary">
    <q-card-section>
      <div class="text-h5 text-accent">NASA Image Library</div>
      <q-banner class="bg-info text-dark q-mt-sm">
        <template v-slot:avatar>
          <q-icon name="info" color="dark" />
        </template>
        Search over 140,000 NASA images. Try terms like "Hubble",
        "Moon", or "Earth".
      </q-banner>
    </q-card-section>

    <q-separator color="info" />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-md-8">
          <q-input
            v-model="searchQuery"
            label="Search NASA Images"
            outlined
            dense
            color="info"
            dark
            @keyup.enter="searchImages"
          >
            <template v-slot:append>
              <q-icon
                name="search"
                class="cursor-pointer"
                color="info"
                @click="searchImages"
              />
            </template>
          </q-input>
        </div>

        <div class="col-md-4">
          <q-btn
            color="info"
            label="Search"
            @click="searchImages"
            class="full-width"
            icon="search"
          />
        </div>
      </div>

      <div v-if="filteredImages.length > 0" class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm text-white">
          {{ filteredImages.length }} images found
        </div>

        <div class="row q-col-gutter-sm">
          <div
            v-for="(item, index) in visibleMediaItems"
            :key="index"
            class="col-6 col-sm-4 col-md-3"
          >
            <q-card class="cursor-pointer bg-secondary" @click="openMediaDialog(item)">
              <q-img
                :src="getMediaThumbnail(item)"
                :ratio="1"
                class="rounded-borders"
              />

              <q-card-section class="q-pa-sm text-white">
                <div
                  class="text-caption text-weight-medium ellipsis-2-lines"
                >
                  {{ item.data[0].title }}
                </div>
                <div class="text-caption text-grey-4">
                  {{ formatDate(item.data[0].date_created) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-center q-mt-md">
          <q-btn
            v-if="filteredImages.length > itemsToShow"
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
        <div class="text-grey-5 q-mt-sm">No images found</div>
      </div>
    </q-card-section>
  </q-card>

  <!-- Image Dialog -->
  <q-dialog v-model="mediaDialog.open" maximized>
    <q-card class="bg-secondary">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-accent">{{ mediaDialog.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="flex flex-center">
        <q-img
          :src="mediaDialog.url"
          spinner-color="info"
          style="max-height: 80vh; max-width: 90vw"
        />
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
</template>

<script setup>
import { ref, computed } from "vue";
import { useNasaStore } from "../../stores/nasa.js";
import { date } from "quasar";

const nasa = useNasaStore();
const { formatDate } = date;

// Form inputs
const searchQuery = ref("");
const showMoreMedia = ref(false);
const itemsToShow = ref(8);

// Media Dialog
const mediaDialog = ref({
  open: false,
  url: "",
  title: "",
  description: "",
  date: "",
  thumbnail: ""
});

// Computed properties
const filteredImages = computed(() => {
  return nasa.nasaMedia.filter(item => 
    item.data?.[0]?.media_type === 'image'
  );
});

const visibleMediaItems = computed(() => {
  return showMoreMedia.value
    ? filteredImages.value
    : filteredImages.value.slice(0, itemsToShow.value);
});

// Methods
function searchImages() {
  nasa.fetchNasaMedia(searchQuery.value);
}

function getMediaThumbnail(item) {
  if (item.links) {
    const thumb = item.links.find((link) => link.rel === "preview");
    return thumb?.href || "/placeholder.jpg";
  }
  return "/placeholder.jpg";
}

function openMediaDialog(item) {
  const data = item.data[0];
  const asset = item.links.find(
    (link) => link.rel === "orig" || link.render === "image"
  );
  const thumbnail = getMediaThumbnail(item);

  mediaDialog.value = {
    open: true,
    url: asset?.href || thumbnail,
    title: data.title,
    description: data.description,
    date: formatDate(data.date_created, "YYYY-MM-DD"),
    thumbnail: thumbnail
  };
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