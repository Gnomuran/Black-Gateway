<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Black Gateway</q-toolbar-title>
      </q-toolbar>
      <q-tabs align="center">
        <q-route-tab to="/" label="Home"></q-route-tab>
        <q-route-tab to="/about" label="About"></q-route-tab>
        <q-route-tab to="/kurse" label="Kurse"></q-route-tab>
        <q-route-tab to="/forum" label="Forum"></q-route-tab>
      </q-tabs>
    </q-header>

    <!-- HAUPTINHALT -->
    <q-page-container>
      <RouterView />
    </q-page-container>

    <!-- FOOTER -->
    <q-footer elevated class="bg-dark text-white q-pa-md">
      <q-toolbar>
        <q-toolbar-title>© 2025 Projekt</q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
