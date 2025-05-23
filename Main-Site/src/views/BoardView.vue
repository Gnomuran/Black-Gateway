<template>
  <q-page class="board-page q-pa-md">
    <!-- 4chan-like header with navigation -->
    <div class="board-nav">
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
              v-for="board in ['Black Holes', 'Space Exploration', 'Astronomy', 'Astrophysics', 'Cosmology']"
              :key="board"
              clickable
            >
              <q-item-section>
                <q-item-label>{{ board }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <span class="nav-separator">/</span>

        <span class="current-board">{{ boardName }}</span>
      </div>
    </div>

    <thread-list
      :board-id="boardId"
      :board-name="boardName"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../boot/axios';
import ThreadList from '../components/ThreadList.vue';

const route = useRoute();
const router = useRouter();
const boardId = ref(route.params.boardId);
const boardName = ref('');

onMounted(async () => {
  try {
    const response = await api.get(`/forum/boards/${boardId.value}`);
    boardName.value = response.data.name;
  } catch (error) {
    console.error('Error fetching board details:', error);
  }
});
</script>

<style scoped>
/* 4chan-like styling */
.board-page {
  background-color: #eef2ff;
  color: #000;
  min-height: 100vh;
  font-family: arial, helvetica, sans-serif;
}

.board-nav {
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
