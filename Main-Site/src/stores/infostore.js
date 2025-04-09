// ------ setup version -------
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useInfoStore = defineStore('infoStore', () => {
  const message = ref('');
  const allInfo = ref([]);
  const subcategoryInfo = ref([]);
  const completedSubcategories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 🔹 Test, ob API läuft
  const testApi = async () => {
    try {
      const res = await axios.get('/api/info/');
      message.value = res.data[0].message;
    } catch (err) {
      error.value = 'Fehler beim API-Test';
    }
  };

  // 🔹 Alle Infos abrufen
  const fetchAllInfo = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/api/info/all');
      allInfo.value = res.data;
    } catch (err) {
      error.value = 'Fehler beim Laden aller Informationen';
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Infos für bestimmte Subkategorie abrufen
  const fetchSubcategoryInfo = async (subcategoryId) => {
    loading.value = true;
    try {
      const res = await axios.get(`/api/info/subcategory/${subcategoryId}`);
      subcategoryInfo.value = res.data;
    } catch (err) {
      error.value = 'Fehler beim Laden der Subkategorie';
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Subkategorie als „fertig“ markieren
  const markAsCompleted = async (subcategoryId) => {
    try {
      const res = await axios.post('/api/info/complete', {
        subcategoryId,
      });
      await fetchCompleted(); // direkt aktualisieren
      return res.data.message;
    } catch (err) {
      if (err.response?.status === 409) {
        return 'Bereits als fertig markiert';
      }
      error.value = 'Fehler beim Markieren als fertig';
    }
  };

  // 🔹 Abgeschlossene Subkategorien abrufen
  const fetchCompleted = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/api/info/completed');
      completedSubcategories.value = res.data;
    } catch (err) {
      error.value = 'Fehler beim Laden abgeschlossener Themen';
    } finally {
      loading.value = false;
    }
  };

  return {
    message,
    allInfo,
    subcategoryInfo,
    completedSubcategories,
    loading,
    error,
    testApi,
    fetchAllInfo,
    fetchSubcategoryInfo,
    markAsCompleted,
    fetchCompleted,
  };
});
