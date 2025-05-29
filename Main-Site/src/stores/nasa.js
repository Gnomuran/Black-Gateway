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
  
  // 🆕 Zusätzlicher State für User-spezifische APOD Daten
  const userApodDate = ref(null);
  const isUserApod = ref(false);

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

  // 🆕 Computed für APOD Metadaten
  const apodInfo = computed(() => {
    if (!apodData.value) return null;
    
    return {
      title: apodData.value.title,
      date: apodData.value.date,
      explanation: apodData.value.explanation,
      mediaType: apodData.value.media_type,
      copyright: apodData.value.copyright || null,
      isUserSpecific: isUserApod.value,
      userDate: userApodDate.value
    };
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
      
      // 🆕 Tracking ob es ein User-spezifisches APOD ist
      if (date) {
        userApodDate.value = date;
        isUserApod.value = true;
      } else {
        userApodDate.value = null;
        isUserApod.value = false;
      }
      
    } catch (err) {
      error.value = err.message;
      console.error("APOD Fehler:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // 🆕 Spezielle Funktion für User-Registration APOD
  async function fetchUserRegistrationAPOD(registrationDate) {
    if (!registrationDate) {
      throw new Error('Registrierungsdatum ist erforderlich');
    }
    
    try {
      console.log(`Lade APOD für User-Registrierung vom: ${registrationDate}`);
      await fetchAPOD(registrationDate);
      
      return {
        success: true,
        date: registrationDate,
        title: apodData.value?.title,
        isSpecialDate: true
      };
    } catch (error) {
      console.error('Fehler beim Laden des User-Registration APOD:', error);
      
      // Fallback auf heutiges APOD
      await fetchAPOD();
      
      return {
        success: false,
        error: error.message,
        fallbackUsed: true
      };
    }
  }

  // 🆕 APOD für einen bestimmten Tag in der Vergangenheit
  async function fetchAPODDaysAgo(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateString = date.toISOString().split('T')[0];
    
    return await fetchAPOD(dateString);
  }

  // 🆕 Zurück zum heutigen APOD wechseln
  async function fetchTodaysAPOD() {
    userApodDate.value = null;
    isUserApod.value = false;
    return await fetchAPOD();
  }

  // 🆕 Prüfen ob das aktuelle APOD user-spezifisch ist
  const isCurrentApodUserSpecific = computed(() => {
    return isUserApod.value && userApodDate.value !== null;
  });

  // 🆕 Datum des aktuell angezeigten APOD
  const currentApodDate = computed(() => {
    return apodData.value?.date || null;
  });

  // 🆕 Formatiertes Datum für UI
  const formattedApodDate = computed(() => {
    if (!apodData.value?.date) return null;
    
    try {
      const date = new Date(apodData.value.date + 'T00:00:00');
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return apodData.value.date;
    }
  });

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

  // 🆕 Store zurücksetzen
  const resetApodData = () => {
    apodData.value = null;
    userApodDate.value = null;
    isUserApod.value = false;
    error.value = null;
  };

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
    // 🆕 Neue State-Variablen
    userApodDate,
    isUserApod,

    // Getter
    apodImageUrl,
    // 🆕 Neue Computed Properties
    apodInfo,
    isCurrentApodUserSpecific,
    currentApodDate,
    formattedApodDate,

    // Actions
    fetchNasaMedia,
    fetchAPOD,
    fetchMarsPhotos,
    fetchEPICImages,
    fetchAsteroids,
    // 🆕 Neue Funktionen
    fetchUserRegistrationAPOD,
    fetchAPODDaysAgo,
    fetchTodaysAPOD,
    resetApodData,
  };
});