// Main-Site/src/stores/auth.js
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
  
  // 🆕 Session Loading State
  const sessionLoading = ref(false);
  const sessionChecked = ref(false); // Flag ob Session bereits geprüft wurde

  // Aktionen (Actions)
  const login = async (username, password) => {
    try {
      console.log(' Attempting login for:', username);
      
      const response = await api.post('/users/login', {
        username,
        password
      });
      
      console.log(' Login response received');
      
      // Warte auf Session-Synchronisation
      await checkSession();
      
      // 🆕 Automatisch User-Erstellungsdatum laden nach Login
      await fetchUserCreationDate();
      
      console.log(' Login successful. User:', user.value);
      console.log(' User Creation Date:', userCreationDate.value);
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Bei Login-Fehler sicherstellen, dass Auth-State zurückgesetzt wird
      resetAuthState();
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log(' Attempting logout...');
      await api.post('/users/logout');
      resetAuthState();
      console.log(' Logout successful');
    } catch (error) {
      console.error(' Logout failed:', error);
      // Auch bei Logout-Fehlern den lokalen State zurücksetzen
      resetAuthState();
      throw error;
    }
  };
    
  const checkSession = async () => {
    // Verhindere mehrfache gleichzeitige Session-Checks
    if (sessionLoading.value) {
      console.log(' Session check already in progress, waiting...');
      // Warte bis der laufende Check abgeschlossen ist
      while (sessionLoading.value) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return { isAuthenticated: isAuthenticated.value, user: user.value };
    }
    
    sessionLoading.value = true;
    console.log(' Checking session status...');
    
    try {
      const { data } = await api.get('/users/me');
      
      // Session ist gültig
      user.value = data;
      isAuthenticated.value = true;
      sessionChecked.value = true;
      
      console.log(' Valid session found for user:', data.username);
      
      // 🆕User-Erstellungsdatum laden wenn Session validiert UND noch nicht geladen
      if (isAuthenticated.value && !userCreationDate.value) {
        await fetchUserCreationDate();
      }
      
      return { isAuthenticated: true, user: data };
      
    } catch (error) {
      // Session ist ungültig oder abgelaufen
      console.log(' No valid session found:', error.response?.status);
      
      user.value = null;
      isAuthenticated.value = false;
      userCreationDate.value = null;
      sessionChecked.value = true;
      
      return { isAuthenticated: false, user: null };
      
    } finally {
      sessionLoading.value = false;
    }
  };

  // Erstellungsdatum des aktuellen Users abrufen
  const fetchUserCreationDate = async () => {
    if (!isAuthenticated.value || !user.value?.username) {
      console.warn(' User not authenticated for fetchUserCreationDate');
      return null;
    }

    try {
      loadingUserDetails.value = true;
      console.log(' Loading user details for:', user.value.username);
      
      const { data } = await api.get('/users/users-with-dates');
      console.log(' Received user data:', data.length, 'users');
      
      // Finde den aktuellen User in der Liste
      const currentUserData = data.find(u => u.username === user.value.username);
      console.log('Found user data:', currentUserData);
      
      if (currentUserData && currentUserData.created_at) {
        //ISO Datum direkt speichern
        userCreationDate.value = currentUserData.created_at;
        console.log(' User creation date set:', userCreationDate.value);
        return currentUserData.created_at;
      } else {
        console.warn(' User data or created_at not found');
        return null;
      }
    } catch (error) {
      console.error(' Error loading user details:', error);
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
      console.error(' Error formatting date:', error);
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
      console.error(' Error calculating days:', error);
      return null;
    }
  };

  // 🆕 User-Erstellungsdatum für NASA API formatieren (YYYY-MM-DD)
  const getUserCreationDateForNasa = () => {
    if (!userCreationDate.value) {
      console.warn(' No userCreationDate available for NASA API');
      return null;
    }
    
    try {
      // 🔧 ISO Datum richtig parsen: "2025-03-20T21:40:13.484Z" -> "2025-03-20"
      const isoString = userCreationDate.value;
      
      // Einfach den Datumsteil vor dem 'T' nehmen
      const dateOnly = isoString.split('T')[0];
      
      console.log(' Original ISO Date:', isoString);
      console.log(' NASA API Date:', dateOnly);
      
      // Zusätzliche Validierung: sollte YYYY-MM-DD Format haben
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        console.error(' Invalid date format for NASA API:', dateOnly);
        return null;
      }
      
      return dateOnly; // YYYY-MM-DD Format
    } catch (error) {
      console.error(' Error formatting NASA date:', error);
      return null;
    }
  };

  // 🆕 Prüfen ob User-Erstellungsdatum verfügbar ist
  const hasUserCreationDate = () => {
    const hasDate = userCreationDate.value !== null;
    console.log(' hasUserCreationDate:', hasDate, userCreationDate.value);
    return hasDate;
  };

  // User-Erstellungsdatum als lesbare Zeichenkette für UI
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

  // Debug-Funktion zum Testen des NASA-Datums
  const debugNasaDate = () => {
    console.log('=== NASA Date Debug ===');
    console.log('userCreationDate.value:', userCreationDate.value);
    console.log('hasUserCreationDate():', hasUserCreationDate());
    console.log('getUserCreationDateForNasa():', getUserCreationDateForNasa());
    console.log('getFormattedCreationDate():', getFormattedCreationDate());
    console.log('getDaysSinceRegistration():', getDaysSinceRegistration());
    console.log('sessionChecked:', sessionChecked.value);
    console.log('sessionLoading:', sessionLoading.value);
    console.log('isAuthenticated:', isAuthenticated.value);
    console.log('======================');
  };

  // Hilfsfunktion zum Zurücksetzen
  const resetAuthState = () => {
    console.log('🔄 Resetting auth state...');
    user.value = null;
    isAuthenticated.value = false;
    userCreationDate.value = null;
    loadingUserDetails.value = false;
    sessionChecked.value = false;
    sessionLoading.value = false;
  };

  // Warten bis Session geprüft wurde
  const waitForSessionCheck = async () => {
    if (sessionChecked.value) return;
    
    console.log(' Waiting for session check to complete...');
    while (!sessionChecked.value) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  // Getter (Computed Properties)
  const currentUser = () => user.value;
  const isLoggedIn = () => isAuthenticated.value;

  return {
    user,
    isAuthenticated,
    userCreationDate,
    loadingUserDetails,
    sessionLoading,
    sessionChecked,
    
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
    resetAuthState,
    waitForSessionCheck, // 🆕 Neue Hilfsfunktion
    
    currentUser,
    isLoggedIn,
  };
});