<template>
    <!-- Header Section -->
    <div class="row q-mb-md">
      <div class="col">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h4 text-accent">NASA Explorer Dashboard</div>
            <div class="text-subtitle1">Discover the wonders of space</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional script needed for this component
  </script>
  
  <style scoped>
  .q-card {
    transition: transform 0.2s;
  }
  
  .q-card:hover {
    transform: translateY(-2px);
  }
  </style>