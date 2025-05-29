import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Zustand (State)
  const user = ref(null);
  const isAuthenticated = ref(false);
  
  // Neuer State für User Details
  const userCreationDate = ref(null);
  const loadingUserDetails = ref(false);

  // Aktionen (Actions)
  const login = async (username, password) => {
    try {
      const response = await api.post('/users/login', {
        username,
        password
      });
      
      // Warte auf Session-Synchronisation
      await checkSession();
      
      // 🆕 Automatisch User-Erstellungsdatum laden nach Login
      await fetchUserCreationDate();
      
      console.log('Login erfolgreich:', user.value);
      console.log('User Creation Date:', userCreationDate.value);
      return response.data;
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      resetAuthState();
      console.log('Logout erfolgreich');
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);
      throw error;
    }
  };
    
  const checkSession = async () => {
    try {
      const { data } = await api.get('/users/me');
      user.value = data;
      isAuthenticated.value = true;
      
      // 🆕 User-Erstellungsdatum laden wenn Session validiert
      if (isAuthenticated.value && !userCreationDate.value) {
        await fetchUserCreationDate();
      }
    } catch {
      user.value = null;
      isAuthenticated.value = false;
    }
  };

  // Erstellungsdatum des aktuellen Users abrufen
  const fetchUserCreationDate = async () => {
    if (!isAuthenticated.value || !user.value?.username) {
      console.warn('Benutzer ist nicht authentifiziert für fetchUserCreationDate');
      return null;
    }

    try {
      loadingUserDetails.value = true;
      console.log('Lade User-Details für:', user.value.username);
      
      const { data } = await api.get('/users/users-with-dates');
      console.log('Erhaltene User-Daten:', data);
      
      // Finde den aktuellen User in der Liste
      const currentUserData = data.find(u => u.username === user.value.username);
      console.log('Gefundene User-Daten:', currentUserData);
      
      if (currentUserData && currentUserData.created_at) {
        // 🔧 ISO Datum direkt speichern
        userCreationDate.value = currentUserData.created_at;
        console.log('User Creation Date gesetzt:', userCreationDate.value);
        return currentUserData.created_at;
      } else {
        console.warn('User-Daten oder created_at nicht gefunden');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Laden der User-Details:', error);
      throw error;
    } finally {
      loadingUserDetails.value = false;
    }
  };

  // Erstellungsdatum formatiert zurückgeben
  const getFormattedCreationDate = () => {
    if (!userCreationDate.value) return null;
    
    try {
      const date = new Date(userCreationDate.value);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error);
      return userCreationDate.value;
    }
  };

  // Tage seit Registrierung berechnen
  const getDaysSinceRegistration = () => {
    if (!userCreationDate.value) return null;
    
    try {
      const creationDate = new Date(userCreationDate.value);
      const now = new Date();
      const diffTime = Math.abs(now - creationDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Fehler beim Berechnen der Tage:', error);
      return null;
    }
  };

  // 🆕 User-Erstellungsdatum für NASA API formatieren (YYYY-MM-DD)
  const getUserCreationDateForNasa = () => {
    if (!userCreationDate.value) {
      console.warn('Kein userCreationDate verfügbar für NASA API');
      return null;
    }
    
    try {
      // 🔧 ISO Datum richtig parsen: "2025-03-20T21:40:13.484Z" -> "2025-03-20"
      const isoString = userCreationDate.value;
      
      // Einfach den Datumsteil vor dem 'T' nehmen
      const dateOnly = isoString.split('T')[0];
      
      console.log('Original ISO Date:', isoString);
      console.log('NASA API Date:', dateOnly);
      
      // Zusätzliche Validierung: sollte YYYY-MM-DD Format haben
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        console.error('Ungültiges Datumsformat für NASA API:', dateOnly);
        return null;
      }
      
      return dateOnly; // YYYY-MM-DD Format
    } catch (error) {
      console.error('Fehler beim Formatieren des NASA-Datums:', error);
      return null;
    }
  };

  // 🆕 Prüfen ob User-Erstellungsdatum verfügbar ist
  const hasUserCreationDate = () => {
    const hasDate = userCreationDate.value !== null;
    console.log('hasUserCreationDate:', hasDate, userCreationDate.value);
    return hasDate;
  };

  // 🆕 User-Erstellungsdatum als lesbare Zeichenkette für UI
  const getUserRegistrationInfo = () => {
    if (!userCreationDate.value) return null;
    
    const formattedDate = getFormattedCreationDate();
    const daysSince = getDaysSinceRegistration();
    
    return {
      date: formattedDate,
      daysAgo: daysSince,
      message: `Registriert am ${formattedDate} (vor ${daysSince} Tagen)`
    };
  };

  // 🆕 Debug-Funktion zum Testen des NASA-Datums
  const debugNasaDate = () => {
    console.log('=== NASA Date Debug ===');
    console.log('userCreationDate.value:', userCreationDate.value);
    console.log('hasUserCreationDate():', hasUserCreationDate());
    console.log('getUserCreationDateForNasa():', getUserCreationDateForNasa());
    console.log('getFormattedCreationDate():', getFormattedCreationDate());
    console.log('getDaysSinceRegistration():', getDaysSinceRegistration());
    console.log('======================');
  };

  // Hilfsfunktion zum Zurücksetzen
  const resetAuthState = () => {
    user.value = null;
    isAuthenticated.value = false;
    userCreationDate.value = null;
    loadingUserDetails.value = false;
  };

  // Getter (Computed Properties)
  const currentUser = () => user.value;
  const isLoggedIn = () => isAuthenticated.value;

  return {
    user,
    isAuthenticated,
    userCreationDate,
    loadingUserDetails,
    
    login,
    logout,
    checkSession,
    fetchUserCreationDate,
    getFormattedCreationDate,
    getDaysSinceRegistration,
    // NASA-spezifische Funktionen
    getUserCreationDateForNasa,
    hasUserCreationDate,
    getUserRegistrationInfo,
    debugNasaDate, // 🆕 Debug-Funktion
    
    currentUser,
    isLoggedIn,
  };
});