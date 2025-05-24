<template>
  <div class="post-card" @click="$emit('click', post)" role="button" tabindex="0">
    <!-- Post Header -->
    <div class="post-header">
      <div class="author-info">
        <div class="author-avatar">
          <q-icon name="person" size="1.25rem" />
        </div>
        <div class="author-details">
          <span class="author-name">{{ post.author_name }}</span>
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
        </div>
      </div>
      
      <div class="post-actions">
        <q-btn
          flat
          round
          icon="more_vert"
          size="sm"
          @click.stop="showMenu = !showMenu"
          class="menu-btn"
        >
          <q-menu v-model="showMenu" anchor="bottom right" self="top right">
            <q-list>
              <q-item clickable @click="$emit('edit', post)">
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable @click="$emit('delete', post)">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" />
                </q-item-section>
                <q-item-section>Delete</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="sharePost">
                <q-item-section avatar>
                  <q-icon name="share" />
                </q-item-section>
                <q-item-section>Share</q-item-section>
              </q-item>
              <q-item clickable @click="reportPost">
                <q-item-section avatar>
                  <q-icon name="flag" />
                </q-item-section>
                <q-item-section>Report</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- Post Title -->
    <h3 class="post-title">{{ post.title }}</h3>

    <!-- Post Content Preview -->
    <div class="post-content">
      <!-- Text Content -->
      <div v-if="post.post_type === 'text'" class="text-content">
        <p>{{ truncatedContent }}</p>
        <span v-if="isContentTruncated" class="read-more">... Read more</span>
      </div>

      <!-- Image Content -->
      <div v-else-if="post.post_type === 'image' && post.media_url" class="media-content">
        <img 
          :src="getMediaUrl(post.media_url)"
          :alt="post.title"
          class="post-image"
          @error="handleImageError"
        />
        <p v-if="post.content" class="media-caption">{{ truncatedContent }}</p>
      </div>

      <!-- Video Content -->
      <div v-else-if="post.post_type === 'video' && post.media_url" class="media-content">
        <video 
          :src="getMediaUrl(post.media_url)"
          class="post-video"
          controls
          preload="metadata"
          @error="handleVideoError"
        />
        <p v-if="post.content" class="media-caption">{{ truncatedContent }}</p>
      </div>

      <!-- GIF Content -->
      <div v-else-if="post.post_type === 'gif' && post.media_url" class="media-content">
        <img 
          :src="getMediaUrl(post.media_url)"
          :alt="post.title"
          class="post-gif"
          @error="handleImageError"
          @load="handleImageLoad"
          loading="lazy"
        />
        <p v-if="post.content" class="media-caption">{{ truncatedContent }}</p>
      </div>

      <!-- Fallback for unsupported content -->
      <div v-else class="text-content">
        <p>{{ truncatedContent }}</p>
      </div>
    </div>

    <!-- Post Stats -->
    <div class="post-stats">
      <div class="stats-group">
        <div class="stat-item">
          <q-icon name="forum" size="1rem" />
          <span>{{ post.replies_count || 0 }} {{ post.replies_count === 1 ? 'reply' : 'replies' }}</span>
        </div>
        
        <div class="stat-item">
          <q-icon name="visibility" size="1rem" />
          <span>{{ formatNumber(post.views_count || 0) }} views</span>
        </div>
      </div>

      <div class="interaction-buttons">
        <q-btn
          flat
          :icon="isLiked ? 'favorite' : 'favorite_border'"
          :color="isLiked ? 'pink' : 'grey-6'"
          :label="formatNumber(post.likes_count || 0)"
          size="sm"
          @click.stop="toggleLike"
          class="like-btn"
        />
        
        <q-btn
          flat
          icon="reply"
          label="Reply"
          size="sm"
          color="grey-6"
          @click.stop="$emit('click', post)"
          class="reply-btn"
        />
      </div>
    </div>

    <!-- Post Tags/Categories (if any) -->
    <div v-if="post.tags && post.tags.length > 0" class="post-tags">
      <q-chip
        v-for="tag in post.tags"
        :key="tag"
        :label="tag"
        size="sm"
        color="primary"
        text-color="white"
        class="post-tag"
      />
    </div>

    <!-- Pinned Indicator -->
    <div v-if="post.is_pinned" class="pinned-indicator">
      <q-icon name="push_pin" size="1rem" />
      <span>Pinned</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// import { useQuasar } from 'quasar'  // Removed for now

// const $q = useQuasar()  // Removed for now

// Props & Emits
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'like', 'edit', 'delete'])

// Reactive Data
const showMenu = ref(false)
const isLiked = ref(false) // You could track this in localStorage or user state
const maxContentLength = 200

// Computed
const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  
  if (props.post.content.length <= maxContentLength) {
    return props.post.content
  }
  
  return props.post.content.substring(0, maxContentLength)
})

const isContentTruncated = computed(() => {
  return props.post.content && props.post.content.length > maxContentLength
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    return `${Math.ceil(diffDays / 7)} weeks ago`
  } else if (diffDays < 365) {
    return `${Math.ceil(diffDays / 30)} months ago`
  } else {
    return `${Math.ceil(diffDays / 365)} years ago`
  }
}

const formatNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  return (num / 1000000).toFixed(1) + 'M'
}

const getMediaUrl = (url) => {
  if (!url) return ''
  
  // The URLs should point to the backend server on port 5000
  if (url.startsWith('/forum/media/')) {
    return `http://localhost:5000${url}`
  }
  
  return url
}

const toggleLike = async () => {
  const action = isLiked.value ? 'unlike' : 'like'
  isLiked.value = !isLiked.value
  
  emit('like', {
    postId: props.post.id,
    action
  })
}

const sharePost = () => {
  const url = `${window.location.origin}/post/${props.post.id}`
  
  if (navigator.share) {
    navigator.share({
      title: props.post.title,
      text: props.post.content.substring(0, 100) + '...',
      url: url
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      console.log('Link copied to clipboard!')
      // $q.notify({
      //   type: 'positive',
      //   message: 'Link copied to clipboard!',
      //   position: 'top'
      // })
    })
  }
}

const reportPost = () => {
  const reason = prompt('Please select a reason for reporting this post:\n\n1. Spam or misleading\n2. Inappropriate content\n3. Harassment or abuse\n4. Copyright violation\n5. Other\n\nEnter 1-5:')
  
  if (reason && ['1', '2', '3', '4', '5'].includes(reason)) {
    console.log('Thank you for your report. We will review it shortly.')
    // $q.notify({
    //   type: 'positive',
    //   message: 'Thank you for your report. We will review it shortly.',
    //   position: 'top'
    // })
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  console.error('Failed to load image:', event.target.src)
}

const handleVideoError = (event) => {
  event.target.style.display = 'none'
  console.error('Failed to load video:', event.target.src)
}
</script>

<style scoped>
.post-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.post-card:hover {
  border-color: #a855f7;
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.post-date {
  color: #64748b;
  font-size: 0.75rem;
}

.menu-btn {
  color: #64748b;
}

.post-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-content {
  margin-bottom: 1rem;
}

.text-content p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  color: #a855f7;
  font-weight: 500;
  cursor: pointer;
}

.media-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-image, .post-gif {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.post-video {
  width: 100%;
  max-height: 300px;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.media-caption {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.stats-group {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  font-size: 0.875rem;
}

.interaction-buttons {
  display: flex;
  gap: 0.5rem;
}

.like-btn, .reply-btn {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.like-btn:hover {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.reply-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.post-tag {
  font-size: 0.75rem;
  height: 1.5rem;
}

.pinned-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 640px) {
  .post-card {
    padding: 1rem;
  }
  
  .post-title {
    font-size: 1.125rem;
  }
  
  .stats-group {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .post-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .interaction-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .like-btn, .reply-btn {
    flex: 1;
    justify-content: center;
  }
  
  .pinned-indicator {
    position: static;
    align-self: flex-start;
    margin-bottom: 0.5rem;
  }
}
</style>