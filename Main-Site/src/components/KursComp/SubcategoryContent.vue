<template>
  <div v-if="content.length > 0">
    <div class="text-h5 q-mb-md text-accent">{{ name }}</div>
    
    <q-card 
      v-for="(info, index) in content" 
      :key="index"
      class="q-mb-md bg-dark text-white"
    >
      <q-card-section>
        <div class="text-h6 text-accent">{{ info.title }}</div>
        <div class="q-mt-sm" style="white-space: pre-line">{{ info.content }}</div>
        <q-img 
          v-if="info.image_url" 
          :src="info.image_url" 
          class="q-mt-md rounded-borders"
          spinner-color="accent"
        />
      </q-card-section>
    </q-card>
    
    <div class="text-right q-mt-lg">
      <q-btn 
        v-if="!isCompleted"
        color="accent" 
        label="Thema abschließen" 
        text-color="dark"
        icon="check"
        @click="$emit('complete')"
      />
      <q-btn 
        v-else
        color="positive" 
        label="Thema abgeschlossen" 
        text-color="dark"
        icon="done_all"
        disable
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: Array,
  name: String,
  isCompleted: Boolean
});

defineEmits(['complete']);
</script>