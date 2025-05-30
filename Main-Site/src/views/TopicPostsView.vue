<template>
  <div class="topic-posts-view">
    <!-- Header -->
    <div class="topic-header">
      <div class="header-content">
        <div class="header-left">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="$emit('back')"
            class="back-btn"
          />
          <div class="topic-icon" :style="{ backgroundColor: topic?.color }">
            <q-icon :name="topic?.icon" size="1.5rem" color="white" />
          </div>
          <div class="topic-info">
            <h1>{{ topic?.title }}</h1>
            <p>{{ topic?.description }}</p>
          </div>
        </div>
        <q-btn
          @click="$emit('create-post')"
          color="primary"
          icon="add"
          label="New Discussion 1"
          class="create-btn"
          rounded
        />
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div class="controls-left">
        <q-input
          v-model="searchQuery"
          placeholder="Search discussions..."
          outlined
          dense
          class="search-input"
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="searchQuery"
              name="clear"
              @click="searchQuery = ''"
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

    <!-- Posts List -->
    <div class="posts-container">
      <!-- Loading State -->
      <div v-if="forumStore.isLoading && posts.length === 0" class="loading-container">
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
          <q-btn flat label="Retry" @click="loadPosts" />
        </template>
      </q-banner>

      <!-- Empty State -->
      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <q-icon name="forum" size="4rem" color="grey-5" />
        <h3>No discussions yet</h3>
        <p>Be the first to start a discussion in this topic!</p>
        <q-btn
          @click="$emit('create-post')"
          color="primary"
          label="Create First Discussion"
          class="create-first-btn"
        />
      </div>

      <!-- Posts Grid -->
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

      <!-- Load More Button -->
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

    <!-- Post View Dialog -->
    <PostViewDialog
      v-model="showPostDialog"
      :post="selectedPost"
      @reply-created="handleReplyCreated"
      @post-updated="handlePostUpdated"
      @post-deleted="handlePostDeleted"
    />

    <!-- Edit Post Dialog -->
    <EditPostDialog
      v-model="showEditDialog"
      :post="editingPost"
      :topics="[topic]"
      @post-updated="handlePostUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useForumStore } from '../stores/forum'
// import { useQuasar } from 'quasar'  // Removed for now
import PostCard from '../components/PostCard.vue'
import PostViewDialog from '../views/PostViewDialog.vue'
import EditPostDialog from '../components/EditPostDialog.vue'

// const $q = useQuasar()  // Removed for now
const forumStore = useForumStore()

// Props & Emits
const props = defineProps({
  topic: Object
})

const emit = defineEmits(['back', 'create-post'])

// Reactive Data
const searchQuery = ref('')
const sortBy = ref('newest')
const showPostDialog = ref(false)
const showEditDialog = ref(false)
const selectedPost = ref(null)
const editingPost = ref(null)
const currentPage = ref(1)
const postsPerPage = 20

// Computed
const posts = computed(() => forumStore.posts)

const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value
  
  const query = searchQuery.value.toLowerCase()
  return posts.value.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query) ||
    post.author_name.toLowerCase().includes(query)
  )
})

const canLoadMore = computed(() => {
  // This would depend on your pagination implementation
  // For now, assume we can load more if we have exactly postsPerPage posts
  return posts.value.length >= currentPage.value * postsPerPage && !forumStore.isLoading
})

// Methods
const loadPosts = async (append = false) => {
  if (!props.topic?.id) return
  
  await forumStore.fetchPostsByTopic(props.topic.id, {
    page: append ? currentPage.value : 1,
    limit: postsPerPage,
    sort: sortBy.value,
    append
  })
}

const refreshPosts = async () => {
  currentPage.value = 1
  await loadPosts()
  
  console.log('Discussions refreshed')
  // $q.notify({
  //   type: 'positive',
  //   message: 'Discussions refreshed',
  //   position: 'top'
  // })
}

const loadMorePosts = async () => {
  currentPage.value += 1
  await loadPosts(true)
}

const handleSortChange = async (newSort) => {
  sortBy.value = newSort
  currentPage.value = 1
  await loadPosts()
}

const viewPost = async (post) => {
  // Load full post details with replies
  const fullPost = await forumStore.fetchPost(post.id)
  if (fullPost) {
    selectedPost.value = fullPost
    showPostDialog.value = true
  }
}

const likePost = async ({ postId, action }) => {
  await forumStore.likePost(postId, action)
}

const editPost = (post) => {
  editingPost.value = post
  showEditDialog.value = true
}

const deletePost = async (post) => {
  // Use native confirm instead of $q.dialog for now
  if (confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
    const success = await forumStore.deletePost(post.id)
    if (success) {
      console.log('Discussion deleted successfully')
      // $q.notify({
      //   type: 'positive',
      //   message: 'Discussion deleted successfully',
      //   position: 'top'
      // })
    }
  }
}

const handleReplyCreated = (reply) => {
  try {
    console.log('Reply posted successfully!', reply)
    
    // Optionally refresh the current post to show the new reply
    if (selectedPost.value) {
      forumStore.fetchPost(selectedPost.value.id)
    }
  } catch (error) {
    console.error('Error in handleReplyCreated:', error)
  }
}

const handlePostUpdated = (updatedPost) => {
  if (selectedPost.value && selectedPost.value.id === updatedPost.id) {
    selectedPost.value = updatedPost
  }
  
  console.log('Discussion updated successfully!')
  // $q.notify({
  //   type: 'positive',
  //   message: 'Discussion updated successfully!',
  //   position: 'top'
  // })
}

const handlePostDeleted = (deletedPost) => {
  showPostDialog.value = false
  selectedPost.value = null
  
  console.log('Discussion deleted successfully!')
  // $q.notify({
  //   type: 'positive',
  //   message: 'Discussion deleted successfully!',
  //   position: 'top'
  // })
}

// Watchers
watch(() => props.topic, (newTopic) => {
  if (newTopic?.id) {
    currentPage.value = 1
    loadPosts()
  }
}, { immediate: true })

watch(searchQuery, () => {
  // Search is handled by computed property
})

// Lifecycle
onMounted(() => {
  if (props.topic?.id) {
    loadPosts()
  }
})
</script>

<style scoped>
.topic-posts-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.topic-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.topic-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-info h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.topic-info p {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
  line-height: 1.4;
}

.create-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  white-space: nowrap;
}

.controls-bar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.controls-left {
  flex: 1;
  max-width: 400px;
}

.search-input {
  background: #f8fafc;
  border-radius: 2rem;
}

.search-input :deep(.q-field__control) {
  border-radius: 2rem;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

.post-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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

.load-more-btn:hover {
  background: #a855f7;
  color: white;
}

@media (max-width: 768px) {
  .topic-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-left {
    width: 100%;
  }
  
  .create-btn {
    width: 100%;
    justify-content: center;
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
  
  .topic-info h1 {
    font-size: 1.25rem;
  }
  
  .topic-info p {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .topic-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .topic-info {
    text-align: left;
  }
}
</style>