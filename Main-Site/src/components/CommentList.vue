<template>
  <div class="comment-list">
    <h5 class="q-my-md">Comments ({{ comments.length }})</h5>

    <!-- Comment form -->
    <q-card v-if="authStore.isLoggedIn" class="q-mb-md bg-dark text-white">
      <q-card-section>
        <q-input
          v-model="newComment"
          type="textarea"
          filled
          label="Add a comment"
          dark
          class="q-mb-md"
        />

        <div class="row justify-end">
          <q-btn
            color="primary"
            label="Post Comment"
            :disable="!newComment.trim()"
            @click="addComment"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Comments list -->
    <q-list separator>
      <q-item
        v-for="comment in comments"
        :key="comment.id"
        class="q-py-md"
      >
        <q-item-section>
          <q-item-label caption class="text-grey q-mb-xs">
            {{ comment.username }} • {{ formatDate(comment.created_at) }}
          </q-item-label>

          <q-item-label>
            <div v-html="comment.content"></div>

            <q-img
              v-if="comment.image_url"
              :src="comment.image_url"
              class="q-mt-sm"
              style="max-height: 200px; max-width: 100%"
            />
          </q-item-label>

          <div class="q-mt-sm">
            <vote-buttons
              :votes="comment.votes"
              :item-id="comment.id"
              item-type="comment"
              @vote="handleVote"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- No comments message -->
    <div v-if="comments.length === 0" class="text-center q-pa-md text-grey">
      No comments yet. Be the first to comment!
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../boot/axios';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/auth';
import VoteButtons from './VoteButtons.vue';

const props = defineProps({
  threadId: {
    type: [Number, String],
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['comment-added', 'vote']);

const authStore = useAuthStore();
const newComment = ref('');

const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
};

const addComment = async () => {
  try {
    await api.post('/forum/comments', {
      thread_id: props.threadId,
      content: newComment.value
    });

    newComment.value = '';
    emit('comment-added');
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

const handleVote = (payload) => {
  emit('vote', payload);
};
</script>

<style scoped>
/* 4chan-like styling */
.comment-list {
  max-width: 100%;
  color: #000;
  font-family: arial, helvetica, sans-serif;
}

h5 {
  color: #800000;
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px solid #d9bfb7;
  padding-bottom: 4px;
}

:deep(.q-list) {
  border: none;
  background-color: transparent;
}

:deep(.q-item) {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  margin-bottom: 8px;
  border-radius: 4px;
  padding: 12px;
}

:deep(.q-item-label) {
  color: #000;
}

:deep(.q-item-label.caption) {
  color: #707070;
}

:deep(.text-grey) {
  color: #707070 !important;
}

:deep(.text-center) {
  color: #707070;
}

:deep(.q-card) {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  margin-bottom: 16px;
}

:deep(.q-btn.primary) {
  background-color: #d6daf0;
  color: #800000;
}

:deep(.q-input) {
  background-color: #fff;
  border: 1px solid #d9bfb7;
}

:deep(.q-field__native) {
  color: #000;
}
</style>
