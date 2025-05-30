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

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Left Panel - Topics -->
      

      <div 
        class="left-panel" 
        :class="{ 'collapsed': leftPanelCollapsed }"
      >
        <div class="panel-header">

          <q-btn
            flat
            round
            :icon="leftPanelCollapsed ? 'menu' : 'menu_open'"
            @click="toggleLeftPanel"
            class="menu-toggle-btn"
          />

          <h3 v-if="!leftPanelCollapsed">Discussion Topics</h3>
          <q-btn
            flat
            round
            icon="close"
            @click="leftPanelCollapsed = true"
            class="close-panel-btn"
            v-if="!leftPanelCollapsed"
          />
        </div>

        <!-- Search Bar -->
        <div v-if="!leftPanelCollapsed" class="search-container">
          <q-input
            v-model="searchQuery"
            placeholder="Search topics..."
            outlined
            dense
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

        <!-- Topics List -->
        <div class="topics-list">
          <!-- Loading State -->
          <div v-if="forumStore.isLoading && !forumStore.topics.length" class="loading-container">
            <q-spinner-dots size="2rem" color="primary" />
            <p v-if="!leftPanelCollapsed">Loading topics...</p>
          </div>

          <!-- Error State -->
          <q-banner v-else-if="forumStore.hasError && !leftPanelCollapsed" class="error-banner" rounded>
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            {{ forumStore.error }}
            <template v-slot:action>
              <q-btn flat label="Retry" @click="loadTopics" />
            </template>
          </q-banner>

          <!-- Topics -->
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-item"
            :class="{ 'active': selectedTopic?.id === topic.id, 'collapsed': leftPanelCollapsed }"
            @click="selectTopic(topic)"
            :title="leftPanelCollapsed ? topic.title : ''"
          >
            <div class="topic-icon" :style="{ backgroundColor: topic.color }">
              <q-icon :name="topic.icon" size="1.5rem" />
            </div>
            <div v-if="!leftPanelCollapsed" class="topic-info">
              <h4 class="topic-title">{{ topic.title }}</h4>
              <p class="topic-description">{{ topic.description }}</p>
              <div class="topic-stats">
                <span class="stat">
                  <q-icon name="forum" size="0.875rem" />
                  {{ topic.post_count || 0 }} discussions
                </span>
                <span v-if="topic.last_post_date" class="stat">
                  <q-icon name="schedule" size="0.875rem" />
                  {{ formatDate(topic.last_post_date) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Posts -->
      <div class="right-panel">
        <!-- Topic Header -->
        <div v-if="selectedTopic" class="topic-header">
          <div class="topic-header-content">
            <div class="topic-header-left">
              <div class="topic-icon-large" :style="{ backgroundColor: selectedTopic.color }">
                <q-icon :name="selectedTopic.icon" size="2rem" color="white" />
              </div>
              <div class="topic-header-info">
                <h2>{{ selectedTopic.title }}</h2>
                <p>{{ selectedTopic.description }}</p>
              </div>
            </div>
            
          </div>
        </div>

        <!-- Controls Bar -->
        <div v-if="selectedTopic" class="controls-bar">
          <div class="controls-left">
            <q-input
              v-model="postSearchQuery"
              placeholder="Search discussions..."
              outlined
              dense
              class="search-input"
              debounce="300"
              @update:model-value="handlePostSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="postSearchQuery"
                  name="clear"
                  @click="postSearchQuery = ''"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
          </div>
          
          <div class="controls-right">
            <q-btn-toggle
              v-model="sortBy"
              toggle-color="primary"
              :options="[
                { label: 'Latest', value: 'newest' },
                { label: 'Popular', value: 'popular' },
                { label: 'Oldest', value: 'oldest' }
              ]"
              @update:model-value="handleSortChange"
              class="sort-toggle"
            />
            
            <q-btn
              flat
              round
              icon="refresh"
              @click="refreshPosts"
              class="refresh-btn"
              title="Refresh"
            />
          </div>
        </div>

        <!-- Posts Content -->
        <div class="posts-container">
          <!-- No Topic Selected -->
          <div v-if="!selectedTopic" class="no-topic-selected">
            <q-icon name="forum" size="4rem" color="grey-5" />
            <h3>Select a Topic</h3>
            <p>Choose a discussion topic from the left panel to view posts</p>
          </div>

          <!-- Loading Posts -->
          <div v-else-if="forumStore.isLoading && posts.length === 0" class="loading-container">
            <q-spinner-dots size="3rem" color="primary" />
            <p>Loading discussions...</p>
          </div>

          <!-- Posts Error -->
          <q-banner v-else-if="forumStore.hasError" class="error-banner" rounded>
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            {{ forumStore.error }}
            <template v-slot:action>
              <q-btn flat label="Retry" @click="loadPosts" />
            </template>
          </q-banner>

          <!-- No Posts -->
          <div v-else-if="filteredPosts.length === 0" class="empty-state">
            <q-icon name="forum" size="4rem" color="grey-5" />
            <h3>No discussions yet</h3>
            <p>Be the first to start a discussion in this topic!</p>
            <q-btn
              @click="createPostForTopic(selectedTopic)"
              color="primary"
              label="Create First Discussion"
              class="create-first-btn"
            />
          </div>

          <!-- Posts List -->
          <div v-else class="posts-grid">
            <PostCard
              v-for="post in filteredPosts"
              :key="post.id"
              :post="post"
              @click="viewPost(post)"
              @like="likePost"
              @edit="editPost"
              @delete="deletePost"
              class="post-card-item"
            />
          </div>

          <!-- Load More -->
          <div v-if="canLoadMore" class="load-more-container">
            <q-btn
              :loading="forumStore.isLoading"
              @click="loadMorePosts"
              color="primary"
              label="Load More Discussions"
              class="load-more-btn"
              outlined
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Post View Dialog -->
    <PostViewDialog
      v-model="showPostDialog"
      :post="selectedPost"
      @reply-created="handleReplyCreated"
      @post-updated="handlePostUpdated"
      @post-deleted="handlePostDeleted"
      @refresh="refreshPosts"
    />

    <!-- Create Post Dialog -->
    <CreatePostDialog
      v-model="showCreatePost"
      :topics="forumStore.topics"
      :selected-topic="topicForNewPost"
      @post-created="handlePostCreated"
    />

    <!-- Edit Post Dialog -->
    <EditPostDialog
      v-model="showEditDialog"
      :post="editingPost"
      :topics="[selectedTopic].filter(Boolean)"
      @post-updated="handlePostUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useForumStore } from '../stores/forum'
import { useQuasar } from 'quasar'
import CreatePostDialog from '../components/CreatePostDialog.vue'
import PostCard from '../components/PostCard.vue'
import PostViewDialog from '../views/PostViewDialog.vue'
import EditPostDialog from '../components/EditPostDialog.vue'

const $q = useQuasar()
const forumStore = useForumStore()

// Reactive data
const leftPanelCollapsed = ref(false)
const showCreatePost = ref(false)
const showPostDialog = ref(false)
const showEditDialog = ref(false)
const selectedTopic = ref(null)
const selectedPost = ref(null)
const editingPost = ref(null)
const topicForNewPost = ref(null)
const searchQuery = ref('')
const postSearchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const postsPerPage = 20

// Computed
const filteredTopics = computed(() => {
  if (!searchQuery.value) return forumStore.topics
  
  return forumStore.topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const posts = computed(() => forumStore.posts)

const filteredPosts = computed(() => {
  if (!postSearchQuery.value) return posts.value
  
  const query = postSearchQuery.value.toLowerCase()
  return posts.value.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query) ||
    post.author_name.toLowerCase().includes(query)
  )
})

const canLoadMore = computed(() => {
  return posts.value.length >= currentPage.value * postsPerPage && !forumStore.isLoading
})

// Methods
const toggleLeftPanel = () => {
  leftPanelCollapsed.value = !leftPanelCollapsed.value
}

const loadTopics = async () => {
  await forumStore.fetchTopics()
}

const selectTopic = async (topic) => {
  selectedTopic.value = topic
  forumStore.setCurrentTopic(topic)
  currentPage.value = 1
  await loadPosts()
}

const loadPosts = async (append = false) => {
  if (!selectedTopic.value?.id) return
  
  await forumStore.fetchPostsByTopic(selectedTopic.value.id, {
    page: append ? currentPage.value : 1,
    limit: postsPerPage,
    sort: sortBy.value,
    append
  })
}

const refreshPosts = async () => {
  if (!selectedTopic.value) return
  currentPage.value = 1
  await loadPosts()
  
  $q.notify({
    type: 'positive',
    message: 'Discussions refreshed',
    position: 'top'
  })
}

const loadMorePosts = async () => {
  currentPage.value += 1
  await loadPosts(true)
}

const createPostForTopic = (topic) => {
  topicForNewPost.value = topic
  showCreatePost.value = true
}

const viewPost = async (post) => {
  const fullPost = await forumStore.fetchPost(post.id)
  if (fullPost) {
    selectedPost.value = fullPost
    showPostDialog.value = true
  }
}

const editPost = (post) => {
  editingPost.value = post
  showEditDialog.value = true
}

const deletePost = async (post) => {
  if (confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
    const success = await forumStore.deletePost(post.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Discussion deleted successfully',
        position: 'top'
      })
      await refreshPosts()
    }
  }
}

const likePost = async ({ postId, action }) => {
  await forumStore.likePost(postId, action)
}

const handleSearch = (query) => {
  forumStore.setSearchQuery(query)
}

const clearSearch = () => {
  searchQuery.value = ''
  forumStore.setSearchQuery('')
}

const handlePostSearch = () => {
  // Filtering is handled by computed property
}

const handleSortChange = async (newSort) => {
  sortBy.value = newSort
  currentPage.value = 1
  await loadPosts()
}

const handlePostCreated = (post) => {
  $q.notify({
    type: 'positive',
    message: 'Discussion created successfully!',
    position: 'top'
  })
  
  // If we're viewing the topic where the post was created, refresh
  if (selectedTopic.value?.id === post.topic_id) {
    refreshPosts()
  }
  
  // Close create dialog and reset
  showCreatePost.value = false
  topicForNewPost.value = null
}

const handleReplyCreated = (reply) => {
  $q.notify({
    type: 'positive',
    message: 'Reply posted successfully!',
    position: 'top'
  })
  
  // Refresh the current post to show the new reply
  if (selectedPost.value) {
    forumStore.fetchPost(selectedPost.value.id).then(updatedPost => {
      if (updatedPost) {
        selectedPost.value = updatedPost
      }
    })
  }
  
  // Also refresh the posts list to update reply count
  refreshPosts()
}

const handlePostUpdated = (updatedPost) => {
  if (selectedPost.value && selectedPost.value.id === updatedPost.id) {
    selectedPost.value = updatedPost
  }
  
  // Close edit dialog
  showEditDialog.value = false
  editingPost.value = null
  
  $q.notify({
    type: 'positive',
    message: 'Discussion updated successfully!',
    position: 'top'
  })
  
  // Refresh posts list to show updated post
  refreshPosts()
}

const handlePostDeleted = (deletedPost) => {
  showPostDialog.value = false
  selectedPost.value = null
  
  $q.notify({
    type: 'positive',
    message: 'Discussion deleted successfully!',
    position: 'top'
  })
  
  // Refresh posts list
  refreshPosts()
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

watch(postSearchQuery, () => {
  handlePostSearch()
})
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.forum-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  color: rgb(20, 15, 15);
  backdrop-filter: blur(10px);
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

.main-content {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 0;
}

.left-panel {
  width: 350px;
  background: white;
  border-right: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-panel.collapsed {
  width: 80px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.close-panel-btn {
  color: #64748b;
}

.search-container {
  padding: 1rem;
}

.search-input {
  background: white;
}

.topics-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.topic-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.topic-item.active {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #a855f7;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.2);
}

.topic-item.collapsed {
  justify-content: center;
  padding: 1rem 0.5rem;
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
  min-width: 0;
}

.topic-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.topic-description {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.right-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topic-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.topic-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.topic-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.topic-icon-large {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-header-info h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.topic-header-info p {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
  line-height: 1.4;
}

.controls-bar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.controls-left {
  flex: 1;
  max-width: 400px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-toggle {
  background: #f8fafc;
  border-radius: 0.5rem;
}

.refresh-btn {
  color: #64748b;
}

.posts-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.no-topic-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.no-topic-selected h3 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.no-topic-selected p {
  margin: 0;
  font-size: 1rem;
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
  margin-bottom: 2rem;
  border: 1px solid #ef4444;
  background: #fef2f2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: #f8fafc;
  border-radius: 1rem;
  border: 2px dashed #cbd5e1;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #64748b;
  font-size: 1rem;
}

.create-first-btn {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

.posts-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

.post-card-item {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  border: 2px solid #a855f7;
  color: #a855f7;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .left-panel.collapsed {
    width: 100%;
    max-height: 60px;
  }
  
  .topics-list {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5rem;
  }
  
  .topic-item {
    min-width: 250px;
    margin-right: 0.5rem;
    margin-bottom: 0;
  }
  
  .topic-item.collapsed {
    min-width: 60px;
  }
  
  .right-panel {
    flex: none;
    height: calc(100vh - 200px);
  }
}

@media (max-width: 768px) {
  .forum-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .forum-title {
    font-size: 1.5rem;
  }
  
  .controls-bar {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .controls-left, .controls-right {
    width: 100%;
  }
  
  .controls-right {
    justify-content: space-between;
  }
  
  .posts-container {
    padding: 1rem;
  }
  
  .topic-header {
    padding: 1rem;
  }
  
  .topic-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .topic-header-info h2 {
    font-size: 1.25rem;
  }
  
  .create-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>