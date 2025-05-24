<template>
  <div class="row items-center justify-between q-mb-md">
    <div class="text-h4 text-accent">Lernkurs</div>
    <div v-if="isLoggedIn" class="row items-center">
      <span class="text-subtitle1 text-accent q-mr-sm">Hallo, {{ userName }}!</span>
      <div 
        v-if="nasaApodImageUrl" 
        class="manual-avatar"
        :style="{ backgroundImage: `url(${nasaApodImageUrl})` }"
      ></div>
      <div v-else class="manual-avatar fallback-avatar">
        {{ userName.charAt(0) }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoggedIn: Boolean,
  userName: String,
  nasaApodImageUrl: String
});
</script>

<style scoped>
.manual-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid #ffb98d;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
  }
}

.fallback-avatar {
  background-color: #ffb98d;
  color: #1B1B2F;
  font-weight: bold;
}
</style>