import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNasaStore = defineStore('nasa', () => {
  // API Key aus Environment Variables
  const apiKey = 'PPbsss1qpP5mn8Xh0WLGrv1NJYPESHAZCDWktPdy';
  
  // State für verschiedene APIs
  const apodData = ref(null);
  const marsPhotos = ref([]);
  const epicImages = ref([]);
  const asteroids = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getter für abgeleitete Daten
  const apodImageUrl = computed(() => {
    if (!apodData.value) return null;
    return apodData.value.media_type === 'image' 
      ? apodData.value.url 
      : apodData.value.thumbnail_url;
  });

  // Actions für verschiedene APIs
  async function fetchAPOD() {
    try {
      isLoading.value = true;
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`
      );
      apodData.value = await response.json();
    } catch (err) {
      error.value = err.message;
      console.error('APOD Fehler:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMarsPhotos(rover = 'curiosity', earthDate = null, sol = null) {
    try {
      isLoading.value = true;
      let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${apiKey}`;
      
      if (earthDate) url += `&earth_date=${earthDate}`;
      if (sol) url += `&sol=${sol}`;
      
      const response = await fetch(url);
      const data = await response.json();
      marsPhotos.value = data.photos || [];
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchEPICImages(date = null) {
    try {
      isLoading.value = true;
      let url = `https://epic.gsfc.nasa.gov/api/natural`;
      if (date) url += `/date/${date}`;
      
      const response = await fetch(url);
      epicImages.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAsteroids(startDate, endDate) {
    try {
      isLoading.value = true;
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      asteroids.value = Object.values(data.near_earth_objects).flat();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Store-API exportieren
  return {
    // State
    apodData,
    marsPhotos,
    epicImages,
    asteroids,
    isLoading,
    error,
    
    
    apodImageUrl,
    
    
    fetchAPOD,
    fetchMarsPhotos,
    fetchEPICImages,
    fetchAsteroids,
  };
});