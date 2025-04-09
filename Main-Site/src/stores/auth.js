import { defineStore } from 'pinia';
import { api } from '../boot/axios'; 
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Zustand (State)
  const user = ref(null);
  const isAuthenticated = ref(false);

  // Aktionen (Actions)
  const login = async (username, password) => {
    try {
      const response = await api.post('/users/login', { 
        username, 
        password 
      });
      
      // Warte auf Session-Synchronisation
      await checkSession(); 
      
      console.log('Login erfolgreich:', user.value);
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
    } catch {
      user.value = null;
      isAuthenticated.value = false;
    }
  };

  // Hilfsfunktion zum Zurücksetzen
  const resetAuthState = () => {
    user.value = null;
    isAuthenticated.value = false;
  };

  // Getter (Computed Properties)
  const currentUser = () => user.value;
  const isLoggedIn = () => isAuthenticated.value;

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkSession,
    currentUser,
    isLoggedIn,
  };
});