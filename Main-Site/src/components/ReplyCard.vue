<template>
  <div class="reply-card">
    <!-- Reply Header -->
    <div class="reply-header">
      <div class="author-info">
        <div class="author-avatar">
          <q-icon name="person" size="1rem" />
        </div>
        <div class="author-details">
          <span class="author-name">{{ reply.author_name }}</span>
          <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
          <span v-if="reply.updated_at !== reply.created_at" class="edited-badge">
            (edited {{ formatRelativeDate(reply.updated_at) }})
          </span>
        </div>
      </div>
      
      <div class="reply-actions">
        <q-btn
          flat
          round
          icon="more_vert"
          size="sm"
          @click="showMenu = !showMenu"
          class="menu-btn"
        >
          <q-menu v-model="showMenu" anchor="bottom right" self="top right">
            <q-list>
              <q-item clickable @click="editReply" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable @click="deleteReply" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" />
                </q-item-section>
                <q-item-section>Delete</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="replyToReply" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="reply" />
                </q-item-section>
                <q-item-section>Reply</q-item-section>
              </q-item>
              <q-item clickable @click="reportReply" v-close-popup>
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

    <!-- Reply Content -->
    <div class="reply-content">
      <!-- Parent Reply Reference (if it's a nested reply) -->
      <div v-if="reply.parent_reply_id" class="parent-reference">
        <q-icon name="reply" size="1rem" />
        <span>Replying to a previous comment</span>
      </div>

      <!-- Reply Text -->
      <div class="reply-text">
        <div v-html="formatContent(reply.content)" class="formatted-content"></div>
      </div>

      <!-- Reply Media (if any) -->
      <div v-if="reply.media_url" class="reply-media">
        <img 
          v-if="isImage(reply.media_type)"
          :src="getMediaUrl(reply.media_url)"
          :alt="'Reply media'"
          class="reply-image"
          @click="showImageFullscreen"
          @error="handleImageError"
        />
        <video 
          v-else-if="isVideo(reply.media_type)"
          :src="getMediaUrl(reply.media_url)"
          class="reply-video"
          controls
          preload="metadata"
          @error="handleVideoError"
        />
      </div>
    </div>

    <!-- Reply Footer -->
    <div class="reply-footer">
      <div class="reply-stats">
        <span class="reply-time">{{ formatRelativeDate(reply.created_at) }}</span>
      </div>
      
      <div class="reply-interactions">
        <q-btn
          flat
          :icon="isLiked ? 'favorite' : 'favorite_border'"
          :color="isLiked ? 'pink' : 'grey-6'"
          :label="formatNumber(reply.likes_count || 0)"
          size="sm"
          @click="toggleLike"
          class="like-btn"
        />
        
        <q-btn
          flat
          icon="reply"
          label="Reply"
          size="sm"
          color="grey-6"
          @click="replyToReply"
          class="reply-btn"
        />
      </div>
    </div>

    <!-- Nested Reply Form (if replying to this reply) -->
    <div v-if="showReplyForm" class="nested-reply-form">
      <div class="reply-form-row">
        <div class="reply-avatar">
          <q-icon name="person" size="1rem" />
        </div>
        <div class="reply-input-container">
          <q-input
            v-model="nestedReplyContent"
            type="textarea"
            placeholder="Write your reply..."
            outlined
            rows="3"
            maxlength="2000"
            counter
            class="nested-reply-input"
            ref="nestedReplyInput"
            :rules="[val => !!val || 'Reply is required', val => val.length >= 5 || 'Reply must be at least 5 characters']"
          />
          <div class="nested-reply-actions">
            <q-btn
              flat
              label="Cancel"
              @click="cancelNestedReply"
              class="cancel-btn"
            />
            <q-btn
              :loading="isSubmitting"
              :disable="!nestedReplyContent.trim()"
              @click="submitNestedReply"
              color="primary"
              label="Reply"
              class="submit-btn"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props & Emits
const props = defineProps({
  reply: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'like', 'reply'])

// Refs
const nestedReplyInput = ref(null)

// Reactive Data
const showMenu = ref(false)
const isLiked = ref(false) // You could track this in localStorage or user state
const showReplyForm = ref(false)
const nestedReplyContent = ref('')
const isSubmitting = ref(false)

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  
  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
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

const isImage = (mediaType) => {
  return mediaType && mediaType.startsWith('image/')
}

const isVideo = (mediaType) => {
  return mediaType && mediaType.startsWith('video/')
}

const handleImageError = (event) => {
  console.warn('Failed to load reply image:', event.target.src)
  event.target.style.display = 'none'
  
  // Show a simple error placeholder
  const errorDiv = document.createElement('div')
  errorDiv.className = 'media-error'
  errorDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; padding: 1rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem;"><span>Failed to load image</span></div>'
  
  if (event.target.parentNode) {
    event.target.parentNode.insertBefore(errorDiv, event.target)
  }
}

const handleVideoError = (event) => {
  console.warn('Failed to load reply video:', event.target.src)
  handleImageError(event) // Reuse the same error handling
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  emit('like', {
    replyId: props.reply.id,
    action: isLiked.value ? 'like' : 'unlike'
  })
}

const editReply = () => {
  console.log('Edit reply clicked:', props.reply.id)
  emit('edit', props.reply)
}

const deleteReply = () => {
  console.log('Delete reply clicked:', props.reply.id)
  emit('delete', props.reply)
}

const replyToReply = () => {
  showReplyForm.value = true
  nestedReplyContent.value = `@${props.reply.author_name} `
  
  // Focus on the input after it's rendered
  setTimeout(() => {
    const input = nestedReplyInput.value?.$el.querySelector('textarea')
    if (input) {
      input.focus()
      // Set cursor to end
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, 100)
}

const cancelNestedReply = () => {
  showReplyForm.value = false
  nestedReplyContent.value = ''
}

const submitNestedReply = async () => {
  if (!nestedReplyContent.value.trim()) return
  
  // Validate the input
  if (nestedReplyInput.value) {
    nestedReplyInput.value.validate()
    if (nestedReplyInput.value.hasError) {
      return
    }
  }
  
  isSubmitting.value = true
  
  try {
    emit('reply', {
      parentReplyId: props.reply.id,
      content: nestedReplyContent.value.trim()
    })
    
    // Reset form
    nestedReplyContent.value = ''
    showReplyForm.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Reply posted successfully!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error submitting nested reply:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to post reply. Please try again.',
      position: 'top'
    })
  } finally {
    isSubmitting.value = false
  }
}

const showImageFullscreen = () => {
  if (!props.reply.media_url) return
  
  $q.dialog({
    component: 'q-img',
    componentProps: {
      src: getMediaUrl(props.reply.media_url),
      alt: 'Reply image'
    }
  })
}

const reportReply = () => {
  $q.dialog({
    title: 'Report Reply',
    message: 'Please select a reason for reporting this reply:',
    options: {
      type: 'radio',
      model: 'spam',
      items: [
        { label: 'Spam or misleading', value: 'spam' },
        { label: 'Inappropriate content', value: 'inappropriate' },
        { label: 'Harassment or abuse', value: 'harassment' },
        { label: 'Other', value: 'other' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Thank you for your report. We will review it shortly.',
      position: 'top'
    })
  })
}
</script>

<style scoped>
.reply-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.reply-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 2rem;
  height: 2rem;
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

.reply-date {
  color: #64748b;
  font-size: 0.75rem;
}

.edited-badge {
  color: #64748b;
  font-size: 0.65rem;
  font-style: italic;
}

.menu-btn {
  color: #64748b;
}

.reply-content {
  margin-bottom: 0.75rem;
}

.parent-reference {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  font-style: italic;
}

.reply-text {
  margin-bottom: 0.5rem;
}

.formatted-content {
  color: #374151;
  line-height: 1.6;
  font-size: 0.875rem;
}

.formatted-content :deep(strong) {
  font-weight: 700;
  color: #1e293b;
}

.formatted-content :deep(em) {
  font-style: italic;
}

.formatted-content :deep(code) {
  background: #e2e8f0;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.8125rem;
}

.formatted-content :deep(blockquote) {
  border-left: 3px solid #a855f7;
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: #64748b;
  font-style: italic;
}

.reply-media {
  margin-top: 0.75rem;
}

.reply-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reply-image:hover {
  transform: scale(1.02);
}

.reply-video {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.reply-stats {
  color: #64748b;
  font-size: 0.75rem;
}

.reply-interactions {
  display: flex;
  gap: 0.5rem;
}

.like-btn, .reply-btn {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
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

.nested-reply-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.reply-form-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.reply-avatar {
  width: 1.75rem;
  height: 1.75rem;
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

.nested-reply-input {
  margin-bottom: 0.75rem;
  background: white;
}

.nested-reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-btn {
  color: #64748b;
}

.submit-btn {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  font-weight: 600;
}

@media (max-width: 640px) {
  .reply-card {
    padding: 0.75rem;
  }
  
  .reply-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .reply-interactions {
    width: 100%;
    justify-content: space-between;
  }
  
  .like-btn, .reply-btn {
    flex: 1;
    justify-content: center;
  }
  
  .reply-form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .nested-reply-actions {
    justify-content: stretch;
  }
  
  .cancel-btn, .submit-btn {
    flex: 1;
  }
  
  .nested-reply-form {
    padding: 0.75rem;
  }
}
</style>