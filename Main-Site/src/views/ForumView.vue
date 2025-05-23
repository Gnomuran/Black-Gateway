<template>
  <q-page class="forum-page">
    <!-- 4chan-like header -->
    <div class="forum-header">
      <div class="header-content">
        <div class="site-logo">Black Gateway</div>

        <!-- Boards navigation -->
        <div class="boards-nav">
          [
          <span
            v-for="(board, index) in boards"
            :key="board.id"
            class="board-link"
          >
            <a
              href="#"
              @click.prevent="selectBoard(board.id)"
              :class="{ 'active': selectedBoardId === board.id }"
            >{{ board.name }}</a>
            <span v-if="index < boards.length - 1" class="separator">/</span>
          </span>
          ]
        </div>
      </div>
    </div>

    <!-- Sidebar with burger menu toggle -->
    <div class="forum-layout">
      <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <div class="sidebar-title">Boards</div>
          <q-btn
            flat
            dense
            round
            icon="close"
            color="negative"
            @click="sidebarOpen = false"
            class="sidebar-close-btn"
          />
        </div>

        <q-list separator class="board-list">
          <q-item
            v-for="board in boards"
            :key="board.id"
            clickable
            :active="selectedBoardId === board.id"
            active-class="active-board"
            @click="selectBoard(board.id)"
            class="board-item"
          >
            <q-item-section>
              <q-item-label class="board-name">{{ board.name }}</q-item-label>
              <q-item-label caption class="thread-count">
                {{ board.thread_count || 0 }} threads
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Main content area -->
      <div class="content-area">
        <!-- Burger menu button and board title -->
        <div class="content-header">
          <q-btn
            flat
            dense
            round
            icon="menu"
            color="positive"
            @click="sidebarOpen = !sidebarOpen"
            class="burger-btn"
          />

          <div class="board-info">
            <h3 class="board-title">{{ pageTitle }}</h3>
            <div v-if="selectedBoard" class="board-description">
              {{ selectedBoard.description }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-container">
          <q-spinner color="positive" size="3em" />
        </div>

        <!-- Content component (ThreadList or welcome message) -->
        <template v-else>
          <thread-list
            v-if="selectedBoardId"
            :board-id="selectedBoardId"
            :board-name="selectedBoard?.name || ''"
          />
          <welcome-message v-else />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../boot/axios';
import ThreadList from '../components/ThreadList.vue';
import WelcomeMessage from '../components/WelcomeMessage.vue';

const route = useRoute();
const router = useRouter();

// State
const boards = ref([]);
const selectedBoardId = ref(null);
const selectedBoard = ref(null);
const loading = ref(true);

// Computed
const pageTitle = computed(() => {
  return selectedBoard.value ? selectedBoard.value.name : 'Forum';
});

// Methods
const fetchBoards = async () => {
  try {
    loading.value = true;
    const response = await api.get('/forum/boards');
    boards.value = response.data;

    // If we have boards and none is selected, select the first one
    if (boards.value.length > 0 && !selectedBoardId.value) {
      selectBoard(boards.value[0].id);
    }
  } catch (error) {
    console.error('Error fetching boards:', error);
  } finally {
    loading.value = false;
  }
};

const fetchBoardDetails = async (boardId) => {
  try {
    loading.value = true;
    const response = await api.get(`/forum/boards/${boardId}`);
    selectedBoard.value = response.data;
  } catch (error) {
    console.error('Error fetching board details:', error);
  } finally {
    loading.value = false;
  }
};

const selectBoard = (boardId) => {
  selectedBoardId.value = boardId;
  router.push({ name: 'Board', params: { boardId } });
};

// Lifecycle hooks
onMounted(async () => {
  await fetchBoards();

  // If we have a boardId from the route, select it
  if (route.name === 'Board' && route.params.boardId) {
    selectedBoardId.value = parseInt(route.params.boardId);
    await fetchBoardDetails(selectedBoardId.value);
  }
});

// Watch for route changes
watch(
  () => route.params.boardId,
  async (newBoardId) => {
    if (newBoardId) {
      selectedBoardId.value = parseInt(newBoardId);
      await fetchBoardDetails(selectedBoardId.value);
    }
  }
);
</script>

<style scoped>
/* 4chan-like styling */
.forum-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #eef2ff; /* 4chan-like light blue background */
  color: #000;
}

.forum-header {
  background-color: #d6daf0; /* 4chan header color */
  border-bottom: 1px solid #b7c5d9;
  padding: 8px 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #800000; /* 4chan-like maroon color */
}

.board-dropdown {
  background-color: #f0e0d6; /* 4chan-like button color */
  color: #800000;
}

.content-area {
  flex: 1;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.board-header {
  background-color: #f0e0d6; /* 4chan-like thread header */
  border: 1px solid #d9bfb7;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 16px;
}

.board-title {
  color: #800000;
  margin: 0;
}

.board-description {
  color: #000;
  margin-top: 8px;
}

/* Override Quasar components to match 4chan style */
:deep(.q-item) {
  background-color: #f0e0d6;
  border: 1px solid #d9bfb7;
  margin-bottom: 2px;
}

:deep(.q-item-label) {
  color: #000;
}

:deep(.q-item-label.caption) {
  color: #707070;
}

:deep(.board-item) {
  border-bottom: 1px solid #d9bfb7;
}

:deep(.board-item:last-child) {
  border-bottom: none;
}
</style>
