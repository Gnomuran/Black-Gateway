<template>
    <div class="thread-list">
      <div class="row justify-between items-center q-mb-md">
        <h5>{{ props.boardName }}</h5>
        <q-btn
          v-if="authStore.isLoggedIn"
          color="primary"
          label="New Thread"
          @click="showThreadDialog = true"
        />
      </div>

      <q-list bordered separator>
        <q-item
          v-for="thread in threads"
          :key="thread.id"
          clickable
          v-ripple
          @click="$router.push(`/thread/${thread.id}`)"
        >
          <q-item-section>
            <q-item-label>
              <q-icon v-if="thread.is_sticky" name="push_pin" class="q-mr-sm" />
              {{ thread.title }}
            </q-item-label>
            <q-item-label caption>
              Posted by {{ thread.username }} •
              {{ formatDate(thread.created_at) }} •
              {{ thread.comment_count }} comments
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge :color="thread.votes > 0 ? 'positive' : thread.votes < 0 ? 'negative' : 'grey'">
              {{ thread.votes }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>

      <q-dialog v-model="showThreadDialog">
        <q-card style="width: 500px; max-width: 80vw;">
          <q-card-section>
            <div class="text-h6">Create New Thread</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="newThread.title" label="Title" class="q-mb-md" />
            <q-editor v-model="newThread.content" min-height="200px" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn color="primary" label="Post" @click="createThread" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue';
  import { api } from '../boot/axios';
  import { useAuthStore } from '../stores/auth';
  import { format } from 'date-fns';

  // eslint-disable-next-line no-unused-vars
  // No need for route anymore since we're using props
  const authStore = useAuthStore();

  const props = defineProps({
    boardId: {
      type: [Number, String],
      required: true
    },
    boardName: {
      type: String,
      default: 'Forum'
    }
  });

  const threads = ref([]);
  const showThreadDialog = ref(false);
  const newThread = ref({
    title: '',
    content: ''
  });

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  onMounted(async () => {
    await fetchThreads();
  });

  const fetchThreads = async () => {
    try {
      const response = await api.get(`/forum/boards/${props.boardId}/threads`);
      threads.value = response.data;
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const createThread = async () => {
    try {
      await api.post('/forum/threads', {
        board_id: props.boardId,
        title: newThread.value.title,
        content: newThread.value.content
      });

      showThreadDialog.value = false;
      newThread.value = { title: '', content: '' };
      await fetchThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };
  </script>

  <style scoped>
  /* 4chan-like styling */
  .thread-list {
    max-width: 800px;
    margin: 0 auto;
  }

  :deep(.q-list) {
    border: 1px solid #d9bfb7;
    background-color: #f0e0d6;
    border-radius: 4px;
  }

  :deep(.q-item) {
    border-bottom: 1px solid #d9bfb7;
    background-color: #f0e0d6;
    padding: 12px;
  }

  :deep(.q-item:last-child) {
    border-bottom: none;
  }

  :deep(.q-item-label) {
    color: #000;
    font-family: arial, helvetica, sans-serif;
  }

  :deep(.q-item-label.caption) {
    color: #707070;
    font-size: 0.85em;
  }

  h5 {
    color: #800000;
    font-weight: bold;
    margin-bottom: 8px;
  }

  :deep(.q-badge) {
    background-color: #d6daf0;
    color: #000;
  }

  :deep(.q-badge.positive) {
    background-color: #d5f5d5;
  }

  :deep(.q-badge.negative) {
    background-color: #f5d5d5;
  }

  :deep(.q-btn.primary) {
    background-color: #d6daf0;
    color: #800000;
  }

  :deep(.q-dialog .q-card) {
    background-color: #eef2ff;
    color: #000;
  }
  </style>