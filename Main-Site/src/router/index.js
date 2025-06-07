// Main-Site/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/auth"; // Import Auth Store


const routes = [
  {
    path: "/",
    redirect: "/login", // Standardmäßig zur Login-Seite umleiten
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: {
      showFooter: false, // Footer auf der Login-Seite ausblenden
      transition: "slide-right", // Animation für Login-Seite
      requiresGuest: true, // Neue Meta-Eigenschaft für Login-Seite
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
    meta: {
      showFooter: false, // Footer auf der Registrierungsseite ausblenden
      transition: "slide-left", // Animation für Registrierungsseite
      requiresGuest: true, // Neue Meta-Eigenschaft für Register-Seite
    },
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: {
      requiresAuth: true, // 🔹 Geschützte Route (Login erforderlich)
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
  
  {
    path: "/kurse",
    name: "Kurse",
    component: () => import("../views/KurseView.vue"),
    meta: {
      requiresAuth: true,
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
   {
    path: '/forum',
    name: 'forum',
    component: () => import('../views/ForumPage.vue'), // Adjust path as needed
    meta: { 
      title: 'Black Hole Physics Forum',
      requiresAuth: true
    }
  },
  {
    path: '/forum/post/:id',
    name: 'forum-post', 
    component: () => import('../views/ForumPage.vue'),
    props: true,
    meta: { 
      title: 'Discussion',
      requiresAuth: true
    }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/DashBoardView.vue"),
    meta: {
      requiresAuth: true,
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
   // 🆕 NEW: AI Assistant Route
  {
    path: "/ai-assistant",
    name: "AIAssistant",
    component: () => import("../views/AIAssistantView.vue"),
    meta: {
      requiresAuth: true, // Optional: require login to use AI assistant
      transition: "fade",
      title: "AI Physics Assistant"
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 🔹 VERBESSERTE Navigation Guard mit Auth Store
router.beforeEach(async (to, from, next) => {
  console.log(' Router Guard - Navigating to:', to.path);
  
  const authStore = useAuthStore();
  
  try {
    // 1. Prüfe Session bei jedem Seitenwechsel
    await authStore.checkSession();
    
    const isAuthenticated = authStore.isAuthenticated;
    console.log(' Auth Status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    
    // 2. Wenn Route Login/Register erfordert und User bereits eingeloggt ist
    if (to.meta.requiresGuest && isAuthenticated) {
      console.log(' User already logged in, redirecting to home');
      return next('/home');
    }
    
    // 3. Wenn Route Authentifizierung erfordert und User nicht eingeloggt ist
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log(' Access denied - redirecting to login');
      return next('/login');
    }
    
    // 4. Alle anderen Fälle - Navigation erlauben
    console.log(' Navigation allowed');
    next();
    
  } catch (error) {
    console.error(' Router Guard Error:', error);
    
    // Bei Fehlern zur Login-Seite weiterleiten, außer wir sind bereits dort
    if (to.path !== '/login' && to.path !== '/register') {
      console.log(' Error occurred, redirecting to login');
      next('/login');
    } else {
      // Wenn wir bereits auf Login/Register sind, einfach weiter
      next();
    }
  }
});

export default router;