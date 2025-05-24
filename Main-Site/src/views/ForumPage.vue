<template>
  <div class="forum-container">
    <!-- Header -->
    <div class="forum-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="fas fa-black-hole" size="2rem" class="header-icon" />
          <div>
            <h1 class="forum-title">Black Hole Physics Forum</h1>
            <p class="forum-subtitle">Explore the mysteries of the universe's most enigmatic objects</p>
          </div>
        </div>
        <q-btn
          @click="showCreatePost = true"
          color="primary"
          icon="add"
          label="New Discussion"
          class="create-btn"
          rounded
        />
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <q-input
        v-model="searchQuery"
        placeholder="Search discussions..."
        outlined
        class="search-input"
        debounce="300"
        @update:model-value="handleSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon
            v-if="searchQuery"
            name="clear"
            @click="clearSearch"
            class="cursor-pointer"
          />
        </template>
      </q-input>
    </div>

    <!-- Topics Board -->
    <div class="topics-board">
      <div class="board-header">
        <h2>Discussion Boards</h2>
        <div class="sort-controls">
          <q-btn-toggle
            v-model="sortBy"
            toggle-color="primary"
            :options="[
              { label: 'Latest', value: 'newest' },
              { label: 'Popular', value: 'popular' },
              { label: 'Oldest', value: 'oldest' }
            ]"
            @update:model-value="handleSortChange"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="forumStore.isLoading" class="loading-container">
        <q-spinner-dots size="3rem" color="primary" />
        <p>Loading discussions...</p>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="forumStore.hasError" class="error-banner" rounded>
        <template v-slot:avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ forumStore.error }}
        <template v-slot:action>
          <q-btn
            flat
            label="Retry"
            @click="loadTopics"
          />
        </template>
      </q-banner>

      <!-- Topics List -->
      <div v-else class="topics-list">
        <div
          v-for="topic in forumStore.topics"
          :key="topic.id"
          class="topic-card"
          :class="{ 'active': selectedTopic?.id === topic.id }"
          @click="selectTopic(topic)"
        >
          <div class="topic-header">
            <div class="topic-icon" :style="{ backgroundColor: topic.color }">
              <q-icon :name="topic.icon" size="1.5rem" />
            </div>
            <div class="topic-info">
              <h3 class="topic-title">{{ topic.title }}</h3>
              <p class="topic-description">{{ topic.description }}</p>
            </div>
          </div>
          
          <div class="topic-stats">
            <div class="stat">
              <q-icon name="forum" />
              <span>{{ topic.post_count || 0 }} discussions</span>
            </div>
            <div class="stat" v-if="topic.last_post_date">
              <q-icon name="schedule" />
              <span>{{ formatDate(topic.last_post_date) }}</span>
            </div>
          </div>

          <q-btn
            v-if="selectedTopic?.id === topic.id"
            @click.stop="viewTopicDetails(topic)"
            color="primary"
            label="View Discussions"
            class="view-btn"
            rounded
          />
        </div>
      </div>
    </div>

    <!-- Create Post Dialog -->
    <CreatePostDialog
      v-model="showCreatePost"
      :topics="forumStore.topics"
      @post-created="handlePostCreated"
    />

    <!-- Topic Posts View -->
    <TopicPostsView
      v-if="showTopicPosts"
      :topic="selectedTopic"
      @back="showTopicPosts = false"
      @create-post="showCreatePost = true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useForumStore } from '../stores/forum'
import { useQuasar } from 'quasar'
import CreatePostDialog from '../components/CreatePostDialog.vue'
import TopicPostsView from '../views/TopicPostsView.vue'

const $q = useQuasar()
const forumStore = useForumStore()

// Reactive data
const showCreatePost = ref(false)
const showTopicPosts = ref(false)
const selectedTopic = ref(null)
const searchQuery = ref('')
const sortBy = ref('newest')

// Computed
// eslint-disable-next-line no-unused-vars
const filteredTopics = computed(() => {
  if (!searchQuery.value) return forumStore.topics
  
  return forumStore.topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const loadTopics = async () => {
  await forumStore.fetchTopics()
}

const selectTopic = (topic) => {
  selectedTopic.value = topic
  forumStore.setCurrentTopic(topic)
}

const viewTopicDetails = (topic) => {
  selectedTopic.value = topic
  showTopicPosts.value = true
}

const handleSearch = (query) => {
  forumStore.setSearchQuery(query)
}

const clearSearch = () => {
  searchQuery.value = ''
  forumStore.setSearchQuery('')
}

const handleSortChange = (newSort) => {
  forumStore.setSortBy(newSort)
  if (selectedTopic.value) {
    // Reload posts with new sort
    forumStore.fetchPostsByTopic(selectedTopic.value.id, { sort: newSort })
  }
}

const handlePostCreated = (post) => {
  $q.notify({
    type: 'positive',
    message: 'Discussion created successfully!',
    position: 'top'
  })
  
  // If we're viewing the topic where the post was created, refresh
  if (selectedTopic.value && selectedTopic.value.id === post.topic_id) {
    forumStore.fetchPostsByTopic(selectedTopic.value.id)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
  return `${Math.ceil(diffDays / 365)} years ago`
}

// Lifecycle
onMounted(() => {
  loadTopics()
})

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  handleSearch(newQuery)
})
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
}

.forum-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.forum-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.forum-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.create-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 2rem auto;
}

.search-input {
  background: white;
  border-radius: 2rem;
}

.search-input :deep(.q-field__control) {
  border-radius: 2rem;
  padding: 0 1rem;
}

.topics-board {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.board-header h2 {
  margin: 0;
  color: #1e293b;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: #64748b;
}

.error-banner {
  margin: 1rem;
  border: 1px solid #ef4444;
  background: #fef2f2;
}

.topics-list {
  padding: 1rem;
}

.topic-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #a855f7;
}

.topic-card.active {
  border-color: #a855f7;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.2);
}

.topic-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.topic-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.topic-info {
  flex: 1;
}

.topic-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.topic-description {
  margin: 0.25rem 0 0 0;
  color: #64748b;
  line-height: 1.5;
}

.topic-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
}

@media (max-width: 768px) {
  .forum-container {
    padding: 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .forum-title {
    font-size: 1.5rem;
  }
  
  .board-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .topic-header {
    flex-direction: column;
    text-align: center;
  }
  
  .topic-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .view-btn {
    position: static;
    width: 100%;
    margin-top: 1rem;
  }
}
</style>