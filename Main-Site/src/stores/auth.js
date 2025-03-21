// src/stores/auth.js
import { defineStore } from 'pinia';
import { api } from '../boot/axios'; // Importiere die API-Instanz
import { ref } from 'vue';


export const Authorise = defineStore('auth', () => {
    const isLoggedIn = ref(false); // Zustand für den Login-Status
  
    // Funktion zum Setzen des Login-Status
    const setLoggedIn = (status) => {
      isLoggedIn.value = status;
    };
  
    return { isLoggedIn, setLoggedIn };
  });

export const useAuthStore = defineStore('auth', () => {
  // Zustand (State)
  const user = ref(null); // Aktueller Benutzer
  const isAuthenticated = ref(false); // Authentifizierungsstatus

  // Aktionen (Actions)
  const login = async (username, password) => {
    try {
      const response = await api.post('/users/login', { username, password });
      user.value = response.data.user; // Setze den Benutzer
      isAuthenticated.value = true; // Setze den Authentifizierungsstatus
      console.log('Login erfolgreich:', user.value);
      return response.data; // Rückgabe der Serverantwort
    } catch (error) {
      console.error('Fehler beim Login:', error);
      throw error; // Fehler weiterreichen
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout'); // Backend-Logout aufrufen
      user.value = null; // Benutzer zurücksetzen
      isAuthenticated.value = false; // Authentifizierungsstatus zurücksetzen
      console.log('Logout erfolgreich');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
      throw error;
    }
  };

  const checkSession = async () => {
    try {
      const response = await api.get('/users/me'); // Session überprüfen
      user.value = response.data; // Benutzerdaten setzen
      isAuthenticated.value = true; // Authentifizierungsstatus setzen
      console.log('Session überprüft:', user.value);
    } catch (error) {
      user.value = null;
      isAuthenticated.value = false;
      console.warn('Keine gültige Session:', error);
    }
  };

  // Getter (Computed Properties)
  const getUser = () => user.value;
  const getIsAuthenticated = () => isAuthenticated.value;

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkSession,
    getUser,
    getIsAuthenticated,
  };
});