<template>
  <q-dialog
    v-model="dialogVisible"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="post-view-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <q-btn
              flat
              round
              icon="arrow_back"
              @click="closeDialog"
              class="back-btn"
            />
            <div class="header-info">
              <h2>Discussion Details</h2>
              <p v-if="post">{{ post.topic_title }}</p>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              round
              icon="share"
              @click="sharePost"
              class="action-btn"
              title="Share"
            />
            <q-btn
              flat
              round
              icon="more_vert"
              @click="showMenu = !showMenu"
              class="action-btn"
            >
              <q-menu v-model="showMenu" anchor="bottom right" self="top right">
                <q-list>
                  <q-item clickable @click="editPost">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Edit Post</q-item-section>
                  </q-item>
                  <q-item clickable @click="deletePost">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Delete Post</q-item-section>
                  </q-item>
                  <q-separator />
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
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="dialog-content">
        <div v-if="post" class="post-content-container">
          <!-- Post Content -->
          <div class="main-post">
            <!-- Post Header -->
            <div class="post-header">
              <div class="author-info">
                <div class="author-avatar">
                  <q-icon name="person" size="1.5rem" />
                </div>
                <div class="author-details">
                  <span class="author-name">{{ post.author_name }}</span>
                  <span class="post-date">{{ formatDate(post.created_at) }}</span>
                  <span v-if="post.updated_at !== post.created_at" class="edited-badge">
                    (edited {{ formatDate(post.updated_at) }})
                  </span>
                </div>
              </div>
              
              <div class="post-actions">
                <q-btn
                  flat
                  :icon="isLiked ? 'favorite' : 'favorite_border'"
                  :color="isLiked ? 'pink' : 'grey-6'"
                  :label="formatNumber(post.likes_count || 0)"
                  @click="toggleLike"
                  class="like-btn"
                />
              </div>
            </div>

            <!-- Post Title -->
            <h1 class="post-title">{{ post.title }}</h1>

            <!-- Post Content -->
            <div class="post-body">
              <!-- Text Content -->
              <div v-if="post.post_type === 'text'" class="text-content">
                <div v-html="formatContent(post.content)" class="formatted-content"></div>
              </div>

              <!-- Image Content -->
              <div v-else-if="post.post_type === 'image' && post.media_url" class="media-content">
                <img 
                  :src="getMediaUrl(post.media_url)"
                  :alt="post.title"
                  class="post-image"
                  @click="showImageFullscreen"
                />
                <div v-if="post.content" v-html="formatContent(post.content)" class="media-caption"></div>
              </div>

              <!-- Video Content -->
              <div v-else-if="post.post_type === 'video' && post.media_url" class="media-content">
                <video 
                  :src="getMediaUrl(post.media_url)"
                  class="post-video"
                  controls
                />
                <div v-if="post.content" v-html="formatContent(post.content)" class="media-caption"></div>
              </div>

              <!-- GIF Content -->
              <div v-else-if="post.post_type === 'gif' && post.media_url" class="media-content">
                <img 
                  :src="post.media_url"
                  :alt="post.title"
                  class="post-gif"
                />
                <div v-if="post.content" v-html="formatContent(post.content)" class="media-caption"></div>
              </div>
            </div>

            <!-- Post Stats -->
            <div class="post-stats">
              <div class="stat-item">
                <q-icon name="forum" />
                <span>{{ post.replies?.length || 0 }} {{ (post.replies?.length || 0) === 1 ? 'reply' : 'replies' }}</span>
              </div>
              <div class="stat-item">
                <q-icon name="visibility" />
                <span>{{ formatNumber(post.views_count || 0) }} views</span>
              </div>
              <div class="stat-item">
                <q-icon name="schedule" />
                <span>{{ formatDate(post.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Reply Form -->
          <div class="reply-form-container">
            <h3>Add a Reply</h3>
            <div class="reply-form">
              <div class="form-row">
                <div class="reply-avatar">
                  <q-icon name="person" size="1.25rem" />
                </div>
                <div class="reply-input-container">
                  <q-input
                    v-model="replyContent"
                    type="textarea"
                    placeholder="Share your thoughts on this discussion..."
                    outlined
                    rows="4"
                    maxlength="5000"
                    counter
                    class="reply-input"
                  />
                  <div class="reply-actions">
                    <div class="reply-tools">
                      <q-btn flat icon="format_bold" @click="formatReply('**', '**')" title="Bold" size="sm" />
                      <q-btn flat icon="format_italic" @click="formatReply('*', '*')" title="Italic" size="sm" />
                      <q-btn flat icon="format_quote" @click="formatReply('> ', '')" title="Quote" size="sm" />
                      <q-btn flat icon="code" @click="formatReply('`', '`')" title="Code" size="sm" />
                    </div>
                    <q-btn
                      :loading="forumStore.isLoading"
                      :disable="!replyContent.trim()"
                      @click="submitReply"
                      color="primary"
                      label="Post Reply"
                      class="submit-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Replies List -->
          <div class="replies-section">
            <h3 v-if="post.replies && post.replies.length > 0">
              Replies ({{ post.replies.length }})
            </h3>
            
            <div v-if="post.replies && post.replies.length > 0" class="replies-list">
              <ReplyCard
                v-for="reply in post.replies"
                :key="reply.id"
                :reply="reply"
                @edit="editReply"
                @delete="deleteReply"
                @like="likeReply"
                class="reply-item"
              />
            </div>
            
            <div v-else-if="!forumStore.isLoading" class="no-replies">
              <q-icon name="chat_bubble_outline" size="3rem" color="grey-4" />
              <p>No replies yet. Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="forumStore.isLoading" class="loading-container">
          <q-spinner-dots size="3rem" color="primary" />
          <p>Loading discussion...</p>
        </div>

        <!-- Error State -->
        <div v-else class="error-container">
          <q-icon name="error_outline" size="3rem" color="negative" />
          <p>Failed to load discussion. Please try again.</p>
          <q-btn @click="$emit('refresh')" color="primary" label="Retry" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Edit Reply Dialog -->
    <q-dialog v-model="showEditReplyDialog" persistent>
      <q-card class="edit-reply-dialog">
        <q-card-section>
          <h3>Edit Reply</h3>
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model="editingReplyContent"
            type="textarea"
            outlined
            rows="4"
            maxlength="5000"
            counter
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelEditReply" />
          <q-btn 
            :loading="forumStore.isLoading"
            @click="saveEditReply"
            color="primary"
            label="Save Changes"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForumStore } from '../stores/forum'
// import { useQuasar } from 'quasar'  // Removed for now
import ReplyCard from '../components/ReplyCard.vue'

// const $q = useQuasar()  // Removed for now
const forumStore = useForumStore()

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  post: Object
})

const emit = defineEmits(['update:modelValue', 'reply-created', 'post-updated', 'post-deleted'])

// Reactive Data
const showMenu = ref(false)
const isLiked = ref(false)
const replyContent = ref('')
const showEditReplyDialog = ref(false)
const editingReply = ref(null)
const editingReplyContent = ref('')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const closeDialog = () => {
  dialogVisible.value = false
  replyContent.value = ''
}

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
  } else {
    return date.toLocaleDateString()
  }
}

const formatNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  return (num / 1000000).toFixed(1) + 'M'
}

const formatContent = (content) => {
  if (!content) return ''
  
  // Simple markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/\n/g, '<br>')
}

const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('/forum/media/')) {
    return `http://localhost:5000${url}`
  }
  return url
}

const toggleLike = async () => {
  if (!props.post) return
  
  const action = isLiked.value ? 'unlike' : 'like'
  isLiked.value = !isLiked.value
  
  await forumStore.likePost(props.post.id, action)
}

const sharePost = () => {
  if (!props.post) return
  
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

const editPost = () => {
  emit('edit', props.post)
}

const deletePost = () => {
  if (confirm(`Are you sure you want to delete "${props.post.title}"? This action cannot be undone.`)) {
    emit('post-deleted', props.post)
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

const showImageFullscreen = () => {
  if (!props.post?.media_url) return
  
  $q.dialog({
    component: 'q-img',
    componentProps: {
      src: getMediaUrl(props.post.media_url),
      alt: props.post.title
    }
  })
}

const formatReply = (before, after) => {
  const textarea = document.querySelector('.reply-input textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = replyContent.value
    const selectedText = text.substring(start, end) || 'text'
    
    replyContent.value = text.substring(0, start) + before + selectedText + after + text.substring(end)
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim() || !props.post) {
    console.log('Cannot submit reply: missing content or post')
    return
  }
  
  try {
    console.log('Submitting reply to post:', props.post.id, 'content:', replyContent.value.trim())
    
    const reply = await forumStore.createReply(props.post.id, {
      content: replyContent.value.trim()
    })
    
    if (reply) {
      console.log('Reply created successfully:', reply)
      emit('reply-created', reply)
      replyContent.value = ''
      
      console.log('Reply posted successfully!')
    } else {
      console.error('Failed to create reply - no reply returned')
    }
  } catch (error) {
    console.error('Error in submitReply:', error)
  }
}

const editReply = (reply) => {
  editingReply.value = reply
  editingReplyContent.value = reply.content
  showEditReplyDialog.value = true
}

const cancelEditReply = () => {
  editingReply.value = null
  editingReplyContent.value = ''
  showEditReplyDialog.value = false
}

const saveEditReply = async () => {
  if (!editingReply.value || !editingReplyContent.value.trim()) return
  
  const updatedReply = await forumStore.updateReply(editingReply.value.id, editingReplyContent.value.trim())
  
  if (updatedReply) {
    cancelEditReply()
    
    console.log('Reply updated successfully!')
    // $q.notify({
    //   type: 'positive',
    //   message: 'Reply updated successfully!',
    //   position: 'top'
    // })
  }
}

const deleteReply = (reply) => {
  if (confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
    forumStore.deleteReply(reply.id).then((success) => {
      if (success) {
        console.log('Reply deleted successfully!')
        // $q.notify({
        //   type: 'positive',
        //   message: 'Reply deleted successfully!',
        //   position: 'top'
        // })
      }
    })
  }
}

const likeReply = async (reply) => {
  // Implementation for liking replies would be similar to posts
  console.log('Like reply:', reply.id)
}
</script>

<style scoped>
.post-view-dialog {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  padding: 1rem 2rem;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.header-info h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-info p {
  margin: 0.25rem 0 0 0;
  opacity: 0.8;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.post-content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.main-post {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.post-date {
  color: #64748b;
  font-size: 0.875rem;
}

.edited-badge {
  color: #64748b;
  font-size: 0.75rem;
  font-style: italic;
}

.like-btn {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  font-weight: 600;
}

.post-title {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.post-body {
  margin-bottom: 2rem;
}

.formatted-content {
  color: #374151;
  line-height: 1.7;
  font-size: 1rem;
}

.formatted-content :deep(strong) {
  font-weight: 700;
  color: #1e293b;
}

.formatted-content :deep(em) {
  font-style: italic;
}

.formatted-content :deep(code) {
  background: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.formatted-content :deep(blockquote) {
  border-left: 4px solid #a855f7;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
}

.media-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-image, .post-gif {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.post-image:hover, .post-gif:hover {
  transform: scale(1.02);
}

.post-video {
  width: 100%;
  max-height: 500px;
  border-radius: 0.75rem;
}

.media-caption {
  color: #374151;
  line-height: 1.7;
}

.post-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reply-form-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reply-form-container h3 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.reply-avatar {
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

.reply-input-container {
  flex: 1;
}

.reply-input {
  margin-bottom: 1rem;
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-tools {
  display: flex;
  gap: 0.25rem;
}

.submit-btn {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  font-weight: 600;
}

.replies-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.replies-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-replies {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  text-align: center;
  color: #64748b;
}

.no-replies p {
  margin: 1rem 0 0 0;
  font-size: 1rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-container p, .error-container p {
  margin-top: 1rem;
  color: #64748b;
}

.edit-reply-dialog {
  min-width: 500px;
}

.edit-reply-dialog h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .post-content-container {
    padding: 1rem;
  }
  
  .main-post, .reply-form-container, .replies-section {
    padding: 1.5rem;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .reply-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .reply-tools {
    justify-content: center;
  }
  
  .post-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .edit-reply-dialog {
    min-width: auto;
    width: 90vw;
  }
}
</style>