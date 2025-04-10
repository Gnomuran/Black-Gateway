<template>
  <div class="three-background-container">
    <!-- Three.js Hintergrund -->
    <div class="three-background">
      <ThreeModel />
    </div>
    
    <!-- Content der darüber liegt -->
    <div class="overlay-content flex flex-center">
      <h1 class="text-white text-h2 text-weight-bold">Black Hole Test</h1>
      <!-- Weitere Inhalte -->
    </div>
  </div>
</template>

<script>
import ThreeModel from '@/components/ThreeModel.vue';

export default {
  components: { ThreeModel }
}
</script>

<style scoped>
.three-background-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.three-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.overlay-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Damit Klicks durchgehen */
}

.overlay-content > * {
  pointer-events: auto; /* Elemente im Content sollen interaktiv sein */
}
</style>