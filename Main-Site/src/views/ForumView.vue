<template>
  <q-page padding>
    <q-btn 
      color="primary" 
      label="Create New Thread" 
      @click="createThread"
      class="q-mb-md"
    />
    
    <!-- Existing forum list content -->
  </q-page>
</template>

<script setup>
import { useForumStore } from '@/stores/forum';
import { useRouter } from 'vue-router';

const forum = useForumStore();
const router = useRouter();

const createThread = async () => {
  const threadId = await forum.createThread();
  router.push(`/forum/${threadId}`);
};
</script>