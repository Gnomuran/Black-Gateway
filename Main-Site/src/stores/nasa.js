import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useNasaStore = defineStore("nasa", () => {
  const apiKey = "PPbsss1qpP5mn8Xh0WLGrv1NJYPESHAZCDWktPdy";

  // State
  const apodData = ref(null);
  const marsPhotos = ref([]);
  const epicImages = ref([]);
  const asteroids = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const nasaMedia = ref([]);

  // Media-Suche (Bildarchiv)
  async function fetchNasaMedia(query) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.get(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}`
      );
      nasaMedia.value = response.data.collection.items || [];
    } catch (err) {
      error.value = err.message;
      console.error("NasaMedia Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Computed Getter für APOD Image/Video
  const apodImageUrl = computed(() => {
    if (!apodData.value) return null;
    return apodData.value.media_type === "image"
      ? apodData.value.url
      : apodData.value.thumbnail_url;
  });

  // Astronomy Picture of the Day (mit optionalem Datum)
  async function fetchAPOD(date = null) {
    try {
      isLoading.value = true;
      error.value = null;
      let url = `https://api.nasa.gov/planetary/apod`;
      let params = {
        api_key: apiKey,
        thumbs: true
      };
      if (date) params.date = date;
      
      const response = await axios.get(url, { params });
      apodData.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error("APOD Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Mars Rover Fotos (Datum oder Sol optional)
  async function fetchMarsPhotos(
    rover = "curiosity",
    earthDate = null,
    sol = null
  ) {
    try {
      isLoading.value = true;
      error.value = null;
      let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`;
      let params = {
        api_key: apiKey
      };
      
      if (earthDate) params.earth_date = earthDate;
      if (sol) params.sol = sol;
      
      const response = await axios.get(url, { params });
      marsPhotos.value = response.data.photos || [];
    } catch (err) {
      error.value = err.message;
      console.error("MarsPhotos Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // EPIC Bilder (mit optionalem Datum)
  async function fetchEPICImages(date = null) {
    try {
      isLoading.value = true;
      error.value = null;
      let url = `https://epic.gsfc.nasa.gov/api/natural`;
      if (date) url += `/date/${date}`;
      
      const response = await axios.get(url);
      epicImages.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error("EPIC Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Near Earth Objects – Asteroiden (optional: Zeitspanne)
  async function fetchAsteroids(startDate = null, endDate = null) {
    try {
      isLoading.value = true;
      error.value = null;

      const today = new Date().toISOString().split("T")[0];
      const start = startDate || today;
      const end = endDate || today;

      const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed`, {
        params: {
          start_date: start,
          end_date: end,
          api_key: apiKey
        }
      });
      
      asteroids.value = Object.values(response.data.near_earth_objects).flat();
    } catch (err) {
      error.value = err.message;
      console.error("Asteroiden Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Export
  return {
    // State
    apodData,
    marsPhotos,
    epicImages,
    asteroids,
    isLoading,
    error,
    nasaMedia,

    // Getter
    apodImageUrl,

    // Actions
    fetchNasaMedia,
    fetchAPOD,
    fetchMarsPhotos,
    fetchEPICImages,
    fetchAsteroids,
  };
});