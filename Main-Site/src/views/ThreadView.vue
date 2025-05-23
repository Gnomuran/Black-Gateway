<template>
  <q-page class="thread-page q-pa-md">
    <!-- 4chan-like header with navigation -->
    <div class="thread-nav">
      <div class="nav-links">
        <q-btn-dropdown
          flat
          color="primary"
          label="Boards"
          class="board-dropdown"
        >
          <q-list>
            <q-item
              clickable
              @click="router.push('/forum')"
            >
              <q-item-section>
                <q-item-label>All Boards</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              @click="router.push(`/board/${thread?.board_id || 1}`)"
            >
              <q-item-section>
                <q-item-label>{{ thread?.board_name || 'Board' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <span class="nav-separator">/</span>

        <span class="current-board">{{ thread?.board_name || 'Thread' }}</span>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <template v-else-if="thread">
      <!-- Thread header -->
      <div class="thread-container">
        <div class="thread-header">
          <div class="thread-info">
            <span class="thread-title">{{ thread.title }}</span>
            <span class="thread-name">{{ thread.username }}</span>
            <span class="thread-date">{{ formatDate(thread.created_at) }}</span>
            <span class="thread-id">No.{{ thread.id }}</span>
          </div>

          <!-- Thread content -->
          <div class="thread-content">
            <div v-html="thread.content"></div>

            <q-img
              v-if="thread.image_url"
              :src="thread.image_url"
              class="thread-image"
            />
          </div>

          <div class="thread-actions">
            <vote-buttons
              :votes="thread.votes"
              :item-id="thread.id"
              item-type="thread"
              @vote="handleVote"
            />
          </div>
        </div>

        <!-- Comments section -->
        <div class="comments-section">
          <comment-list
            :thread-id="thread.id"
            :comments="thread.comments || []"
            @comment-added="fetchThread"
            @vote="handleVote"
          />
        </div>
      </div>
    </template>

    <!-- Error message -->
    <div v-else class="error-container">
      <div class="error-message">
        <q-icon name="error" size="3em" color="negative" />
        <div class="error-text">Thread not found</div>
        <q-btn
          color="primary"
          label="Back to Forum"
          class="error-button"
          @click="router.push('/forum')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../boot/axios';
import { format } from 'date-fns';
import VoteButtons from '../components/VoteButtons.vue';
import CommentList from '../components/CommentList.vue';

const route = useRoute();
// eslint-disable-next-line no-unused-vars
const router = useRouter();

const threadId = ref(route.params.threadId);
const thread = ref(null);
const loading = ref(true);

const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
};

const fetchThread = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/forum/threads/${threadId.value}`);
    thread.value = response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
  } finally {
    loading.value = false;
  }
};

const handleVote = async (payload) => {
  try {
    // This would call an API endpoint to handle votes
    console.log('Vote:', payload);
    // Refresh the thread data after voting
    await fetchThread();
  } catch (error) {
    console.error('Error voting:', error);
  }
};

onMounted(fetchThread);
</script>

<style scoped>
/* 4chan-like styling */
.thread-page {
  background-color: #eef2ff;
  color: #000;
  min-height: 100vh;
  font-family: arial, helvetica, sans-serif;
}

.thread-nav {
  background-color: #d6daf0;
  border-bottom: 1px solid #b7c5d9;
  padding: 8px 16px;
  margin-bottom: 16px;
}

.nav-links {
  display: flex;
  align-items: center;
}

.board-dropdown {
  color: #800000;
}

.nav-separator {
  margin: 0 8px;
  color: #800000;
  font-weight: bold;
}

.current-board {
  color: #800000;
  font-weight: bold;
}

.thread-container {
  max-width: 800px;
  margin: 0 auto;
}

.thread-header {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.thread-info {
  margin-bottom: 8px;
}

.thread-title {
  color: #800000;
  font-weight: bold;
  font-size: 1.2em;
  margin-right: 8px;
}

.thread-name {
  color: #117743;
  font-weight: bold;
  margin-right: 8px;
}

.thread-date {
  color: #707070;
  font-size: 0.85em;
  margin-right: 8px;
}

.thread-id {
  color: #707070;
  font-size: 0.85em;
}

.thread-content {
  margin-top: 8px;
  margin-bottom: 8px;
}

.thread-image {
  max-height: 250px;
  max-width: 250px;
  margin-top: 8px;
  border: 1px solid #d9bfb7;
}

.comments-section {
  max-width: 800px;
  margin: 0 auto;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.error-message {
  text-align: center;
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  border-radius: 4px;
  padding: 24px;
}

.error-text {
  color: #800000;
  font-size: 1.2em;
  margin: 16px 0;
}

.error-button {
  background-color: #d6daf0;
  color: #800000;
}

/* Override Quasar components to match 4chan style */
:deep(.q-list) {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
}

:deep(.q-item) {
  background-color: #f0e0d6;
  color: #000;
}

:deep(.q-item-label) {
  color: #000;
}

:deep(.q-separator) {
  background-color: #d9bfb7;
}

:deep(.q-btn.primary) {
  background-color: #d6daf0;
  color: #800000;
}
</style>
