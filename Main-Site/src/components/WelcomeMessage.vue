<script setup>
defineProps({
  message: {
    type: String,
    default: 'Welcome to the Black Gateway Forum',
  },
});
</script>

<template>
  <div class="welcome-message q-pa-md">
    <div class="welcome-container">
      <div class="welcome-header">
        <h3>{{ message }}</h3>
      </div>

      <div class="welcome-content">
        <p>
          This is a place to discuss astronomy, black holes, space exploration, and more.
          Select a board from the dropdown menu above to get started.
        </p>

        <div class="guidelines">
          <h4>Forum Guidelines:</h4>
          <ul>
            <li>Be respectful to other members</li>
            <li>Stay on topic within each board</li>
            <li>Share your knowledge and ask questions</li>
            <li>Provide sources for scientific claims when possible</li>
            <li>Have fun exploring the cosmos!</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 4chan-like styling */
.welcome-message {
  max-width: 800px;
  margin: 0 auto;
  font-family: arial, helvetica, sans-serif;
}

.welcome-container {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  border-radius: 4px;
}

.welcome-header {
  background-color: #f0e0d6;
  border-bottom: 1px solid #d9bfb7;
  padding: 8px 16px;
}

.welcome-header h3 {
  color: #800000;
  font-weight: bold;
  margin: 0;
}

.welcome-content {
  padding: 16px;
  color: #000;
}

.welcome-content p {
  margin-top: 0;
}

.guidelines {
  margin-top: 16px;
}

.guidelines h4 {
  color: #800000;
  font-weight: bold;
  margin-bottom: 8px;
}

.guidelines ul {
  margin: 0;
  padding-left: 24px;
}

.guidelines li {
  margin-bottom: 4px;
}
</style>
