import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import { api } from "../boot/axios";

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
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
    meta: {
      showFooter: false, // Footer auf der Registrierungsseite ausblenden
      transition: "slide-left", // Animation für Registrierungsseite
    },
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: {
      //  requiresAuth: true, // 🔹 Geschützte Route (Login erforderlich)
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
  {
    path: "/forum",
    name: "Forum",
    component: () => import("../views/ForumView.vue"),
    meta: {
      // requiresAuth: true,
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
  {
    path: "/kurse",
    name: "Kurse",
    component: () => import("../views/KurseView.vue"),
    meta: {
      // requiresAuth: true,
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
  // {
  //   path: "/kurse/:id",
  //   name: "KursDetail",
  //   component: () => import("../views/LearningContentDialog.vue"), // oder InfoDetailPage.vue
  //   meta: {
  //     transition: "fade",
  //   },
  // },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/AboutView.vue"),
    meta: {
      // requiresAuth: true,
      transition: "fade", // Standard-Animation für geschützte Routen
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  try {
    await api.get("/users/me"); // Prüfe, ob der Nutzer eingeloggt ist
    next();
  } catch (error) {
    if (to.meta.requiresAuth) {
      console.error("Authentication failed, redirecting to login:", error);
      next("/login"); // Falls nicht eingeloggt -> Weiterleitung zum Login
    } else {
      next();
    }
  }
});

export default router;
