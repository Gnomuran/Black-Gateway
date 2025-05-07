import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      nasaMedia.value = data.collection.items || [];
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
      let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`;
      if (date) url += `&date=${date}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("APOD konnte nicht geladen werden");
      apodData.value = await response.json();
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
      let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${apiKey}`;
      if (earthDate) url += `&earth_date=${earthDate}`;
      if (sol) url += `&sol=${sol}`;
      const response = await fetch(url);
      const data = await response.json();
      marsPhotos.value = data.photos || [];
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
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("EPIC-Daten konnten nicht geladen werden");
      epicImages.value = await response.json();
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

      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      asteroids.value = Object.values(data.near_earth_objects).flat();
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
