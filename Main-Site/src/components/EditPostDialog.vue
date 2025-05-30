<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="edit-post-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <q-icon name="edit" size="1.5rem" class="header-icon" />
            <h2>Edit Discussion</h2>
          </div>
          <q-btn
            flat
            round
            icon="close"
            @click="closeDialog"
            class="close-btn"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Form Content -->
      <q-card-section class="dialog-content">
        <div v-if="post" class="form-container">
          <!-- Current Post Info -->
          <div class="current-post-info">
            <div class="info-header">
              <q-icon name="info" />
              <span>Editing: "{{ post.title }}"</span>
            </div>
            <div class="info-details">
              <span>Created by {{ post.author_name }} on {{ formatDate(post.created_at) }}</span>
            </div>
          </div>

          <!-- Topic Selection (Read-only) -->
          <div class="form-group">
            <label class="form-label">Topic</label>
            <div class="topic-display">
              <div class="topic-display-icon" :style="{ backgroundColor: getCurrentTopic()?.color || '#6366f1' }">
                <q-icon :name="getCurrentTopic()?.icon || 'forum'" color="white" />
              </div>
              <div class="topic-display-info">
                <span class="topic-name">{{ getCurrentTopic()?.title || 'Unknown Topic' }}</span>
                <span class="topic-note">Topic cannot be changed when editing</span>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Discussion Title</label>
            <q-input
              v-model="form.title"
              outlined
              placeholder="Enter an engaging title for your discussion"
              maxlength="500"
              counter
              :rules="titleRules"
              ref="titleInput"
              class="title-input"
            />
          </div>

          <!-- Content Type Display -->
          <div class="form-group">
            <label class="form-label">Content Type</label>
            <div class="content-type-display">
              <q-chip 
                :icon="getContentTypeIcon(form.post_type)"
                :label="getContentTypeLabel(form.post_type)"
                color="primary"
                text-color="white"
              />
              <span class="content-type-note">Content type cannot be changed when editing</span>
            </div>
          </div>

          <!-- Current Media Display -->
          <div v-if="hasCurrentMedia" class="form-group">
            <label class="form-label">Current Media</label>
            <div class="current-media">
              <!-- Current Image -->
              <div v-if="form.post_type === 'image' && form.media_url" class="media-preview">
                <img :src="getMediaUrl(form.media_url)" alt="Current image" class="current-image" />
                <div class="media-actions">
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    @click="removeCurrentMedia"
                    label="Remove"
                  />
                </div>
              </div>

              <!-- Current Video -->
              <div v-else-if="form.post_type === 'video' && form.media_url" class="media-preview">
                <video :src="getMediaUrl(form.media_url)" controls class="current-video" />
                <div class="media-actions">
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    @click="removeCurrentMedia"
                    label="Remove"
                  />
                </div>
              </div>

              <!-- Current GIF -->
              <div v-else-if="form.post_type === 'gif' && form.media_url" class="media-preview">
                <img :src="form.media_url" alt="Current GIF" class="current-gif" />
                <div class="media-actions">
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    @click="removeCurrentMedia"
                    label="Remove"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- New Media Upload (for image/video types) -->
          <div v-if="canUploadNewMedia" class="form-group">
            <label class="form-label">
              {{ hasCurrentMedia ? 'Replace Media' : 'Add Media' }}
            </label>
            <q-file
              v-model="form.newMediaFile"
              outlined
              :accept="getAcceptedFileTypes(form.post_type)"
              :max-file-size="getMaxFileSize(form.post_type)"
              @rejected="onMediaRejected"
              class="media-upload"
            >
              <template v-slot:prepend>
                <q-icon :name="form.post_type === 'video' ? 'videocam' : 'image'" />
              </template>
            </q-file>
            
            <!-- New Media Preview -->
            <div v-if="newMediaPreview" class="media-preview">
              <img 
                v-if="form.post_type === 'image'"
                :src="newMediaPreview" 
                alt="New image preview" 
                class="new-media-preview" 
              />
              <video 
                v-else-if="form.post_type === 'video'"
                :src="newMediaPreview"
                controls 
                class="new-media-preview" 
              />
              <q-btn
                round
                color="negative"
                icon="close"
                size="sm"
                @click="removeNewMedia"
                class="remove-media-btn"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="form-group">
            <label class="form-label">Discussion Content</label>
            <q-input
              v-model="form.content"
              type="textarea"
              outlined
              placeholder="Share your thoughts, questions, or insights about black hole physics..."
              rows="8"
              maxlength="10000"
              counter
              :rules="contentRules"
              ref="contentInput"
              class="content-textarea"
            />
            
            <!-- Text Formatting Toolbar -->
            <div class="formatting-toolbar">
              <q-btn-group flat>
                <q-btn flat icon="format_bold" @click="formatText('**', '**')" title="Bold" />
                <q-btn flat icon="format_italic" @click="formatText('*', '*')" title="Italic" />
                <q-btn flat icon="format_quote" @click="formatText('> ', '')" title="Quote" />
                <q-btn flat icon="code" @click="formatText('`', '`')" title="Code" />
                <q-btn flat icon="link" @click="insertLink" title="Link" />
              </q-btn-group>
            </div>
          </div>

          <!-- Edit Summary -->
          <div class="form-group">
            <label class="form-label">Edit Summary (Optional)</label>
            <q-input
              v-model="form.editSummary"
              outlined
              placeholder="Briefly describe what you changed..."
              maxlength="200"
              counter
              class="edit-summary-input"
            />
            <p class="field-hint">This helps other users understand what was modified</p>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-else class="loading-state">
          <q-spinner-dots size="3rem" color="primary" />
          <p>Loading post data...</p>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-separator />
      <q-card-actions class="dialog-actions">
        <div class="actions-left">
          <q-btn
            flat
            label="Cancel"
            @click="closeDialog"
            class="cancel-btn"
          />
        </div>
        <div class="actions-right">
          <q-btn
            :loading="forumStore.isLoading"
            :disable="!isFormValid || !hasChanges"
            @click="saveChanges"
            color="primary"
            label="Save Changes"
            class="save-btn"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useForumStore } from '../stores/forum'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const forumStore = useForumStore()

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  post: Object,
  topics: Array
})

const emit = defineEmits(['update:modelValue', 'post-updated'])

// Refs
const titleInput = ref(null)
const contentInput = ref(null)

// Reactive Data
const form = ref({
  topic_id: null,
  title: '',
  content: '',
  post_type: 'text',
  media_url: null,
  newMediaFile: null,
  editSummary: ''
})

const originalForm = ref({})

// Validation Rules
const titleRules = [
  val => !!val || 'Title is required',
  val => val.length >= 10 || 'Title must be at least 10 characters',
  val => val.length <= 500 || 'Title cannot exceed 500 characters'
]

const contentRules = [
  val => !!val || 'Content is required',
  val => val.length >= 20 || 'Content must be at least 20 characters',
  val => val.length <= 10000 || 'Content cannot exceed 10000 characters'
]

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getCurrentTopic = () => {
  if (!form.value.topic_id) return null
  return props.topics?.find(topic => topic.id === form.value.topic_id) || null
}

const hasCurrentMedia = computed(() => {
  return form.value.media_url && (form.value.post_type === 'image' || form.value.post_type === 'video' || form.value.post_type === 'gif')
})

const canUploadNewMedia = computed(() => {
  return form.value.post_type === 'image' || form.value.post_type === 'video'
})

const newMediaPreview = computed(() => {
  if (!form.value.newMediaFile) return null
  return URL.createObjectURL(form.value.newMediaFile)
})

const isFormValid = computed(() => {
  const hasTitle = form.value.title && form.value.title.length >= 10 && form.value.title.length <= 500
  const hasContent = form.value.content && form.value.content.length >= 20 && form.value.content.length <= 10000
  const hasTopic = form.value.topic_id
  
  return hasTitle && hasContent && hasTopic
})

const hasChanges = computed(() => {
  return (
    form.value.title !== originalForm.value.title ||
    form.value.content !== originalForm.value.content ||
    form.value.newMediaFile !== null ||
    (form.value.media_url !== originalForm.value.media_url)
  )
})

// Methods
const initializeForm = () => {
  if (!props.post) return
  
  form.value = {
    topic_id: props.post.topic_id,
    title: props.post.title || '',
    content: props.post.content || '',
    post_type: props.post.post_type || 'text',
    media_url: props.post.media_url || null,
    newMediaFile: null,
    editSummary: ''
  }
  
  // Store original values for comparison
  originalForm.value = {
    title: props.post.title || '',
    content: props.post.content || '',
    media_url: props.post.media_url || null
  }
  
  console.log('Form initialized:', form.value)
}

const closeDialog = () => {
  if (forumStore.isLoading) return
  
  if (hasChanges.value) {
    $q.dialog({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to close?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      resetForm()
      dialogVisible.value = false
    })
  } else {
    resetForm()
    dialogVisible.value = false
  }
}

const resetForm = () => {
  form.value = {
    topic_id: null,
    title: '',
    content: '',
    post_type: 'text',
    media_url: null,
    newMediaFile: null,
    editSummary: ''
  }
  originalForm.value = {}
  
  // Clear file preview URLs
  if (newMediaPreview.value) {
    URL.revokeObjectURL(newMediaPreview.value)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getContentTypeIcon = (type) => {
  const icons = {
    text: 'text_fields',
    image: 'image',
    video: 'videocam',
    gif: 'gif'
  }
  return icons[type] || 'text_fields'
}

const getContentTypeLabel = (type) => {
  const labels = {
    text: 'Text',
    image: 'Image',
    video: 'Video',
    gif: 'GIF'
  }
  return labels[type] || 'Text'
}

const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('/forum/media/')) {
    return `http://localhost:5000${url}`
  }
  return url
}

const getAcceptedFileTypes = (type) => {
  if (type === 'image') return 'image/*'
  if (type === 'video') return 'video/*'
  return '*/*'
}

const getMaxFileSize = (type) => {
  if (type === 'image') return 10485760 // 10MB
  if (type === 'video') return 52428800 // 50MB
  return 10485760
}

const removeCurrentMedia = () => {
  $q.dialog({
    title: 'Remove Media',
    message: 'Are you sure you want to remove the current media?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    form.value.media_url = null
  })
}

const removeNewMedia = () => {
  if (newMediaPreview.value) {
    URL.revokeObjectURL(newMediaPreview.value)
  }
  form.value.newMediaFile = null
}

const onMediaRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `File rejected: ${rejectedEntries[0].failedPropValidation}`,
    position: 'top'
  })
}

const formatText = (before, after) => {
  nextTick(() => {
    const textarea = contentInput.value?.$el.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = form.value.content
      const selectedText = text.substring(start, end) || 'text'
      
      const newContent = text.substring(0, start) + before + selectedText + after + text.substring(end)
      form.value.content = newContent
      
      // Reset cursor position
      nextTick(() => {
        const newPosition = start + before.length + selectedText.length + after.length
        textarea.focus()
        textarea.setSelectionRange(newPosition, newPosition)
      })
    }
  })
}

const insertLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    const linkText = prompt('Enter link text:', url)
    const markdown = `[${linkText || url}](${url})`
    form.value.content += markdown
  }
}

const saveChanges = async () => {
  console.log('Saving changes...')
  
  if (!isFormValid.value || !hasChanges.value || !props.post) {
    console.log('Form validation failed:', {
      isFormValid: isFormValid.value,
      hasChanges: hasChanges.value,
      hasPost: !!props.post
    })
    return
  }
  
  // Validate form inputs manually
  if (titleInput.value) {
    titleInput.value.validate()
    if (titleInput.value.hasError) {
      $q.notify({
        type: 'negative',
        message: 'Please fix the title errors',
        position: 'top'
      })
      return
    }
  }
  
  if (contentInput.value) {
    contentInput.value.validate()
    if (contentInput.value.hasError) {
      $q.notify({
        type: 'negative',
        message: 'Please fix the content errors',
        position: 'top'
      })
      return
    }
  }
  
  const updateData = {
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    post_type: form.value.post_type,
    edit_summary: form.value.editSummary?.trim() || null
  }
  
  console.log('Update data:', updateData)
  
  // Handle media changes
  if (form.value.newMediaFile) {
    updateData.media = form.value.newMediaFile
    console.log('Adding new media file:', form.value.newMediaFile.name)
  } else if (form.value.media_url !== originalForm.value.media_url) {
    // Media was removed
    updateData.media_url = form.value.media_url
    console.log('Media URL changed:', form.value.media_url)
  }
  
  try {
    const result = await forumStore.updatePost(props.post.id, updateData)
    
    if (result) {
      console.log('Post updated successfully:', result)
      emit('post-updated', result)
      
      $q.notify({
        type: 'positive',
        message: 'Discussion updated successfully!',
        position: 'top'
      })
      
      resetForm()
      dialogVisible.value = false
    } else {
      throw new Error('Update failed - no result returned')
    }
  } catch (error) {
    console.error('Error updating post:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update discussion. Please try again.',
      position: 'top'
    })
  }
}

// Watchers
watch(() => props.post, (newPost) => {
  console.log('Post prop changed:', newPost)
  if (newPost) {
    initializeForm()
  }
}, { immediate: true })

watch(dialogVisible, (isVisible) => {
  console.log('Dialog visibility changed:', isVisible)
  if (isVisible && props.post) {
    initializeForm()
  } else if (!isVisible) {
    // Clean up when dialog closes
    if (newMediaPreview.value) {
      URL.revokeObjectURL(newMediaPreview.value)
    }
  }
})

// Debug watchers
watch(() => form.value.title, (newTitle) => {
  console.log('Title changed:', newTitle)
})

watch(() => form.value.content, (newContent) => {
  console.log('Content changed, length:', newContent?.length)
})
</script>

<style scoped>
.edit-post-dialog {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  padding: 1rem 2rem;
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

.header-left h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 50%;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state p {
  margin-top: 1rem;
  color: #64748b;
}

.current-post-info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 2rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 0.25rem;
}

.info-details {
  color: #0284c7;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-hint {
  margin: 0.5rem 0 0 0;
  color: #64748b;
  font-size: 0.75rem;
  font-style: italic;
}

.topic-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.topic-display-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-display-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.topic-name {
  font-weight: 600;
  color: #1e293b;
}

.topic-note {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.content-type-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.content-type-note {
  color: #64748b;
  font-size: 0.875rem;
  font-style: italic;
}

.current-media {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
}

.media-preview {
  position: relative;
  display: inline-block;
}

.current-image, .current-gif, .current-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
}

.current-video {
  width: 100%;
}

.new-media-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.media-actions {
  margin-top: 0.75rem;
}

.remove-media-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.media-upload {
  background: white;
}

.title-input, .content-textarea, .edit-summary-input {
  background: white;
}

.formatting-toolbar {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.dialog-actions {
  padding: 1rem 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-btn {
  color: #64748b;
}

.save-btn {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

.save-btn:disabled {
  opacity: 0.5;
}

@media (max-width: 600px) {
  .dialog-content {
    padding: 1rem;
  }
  
  .current-post-info {
    padding: 0.75rem;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions-left, .actions-right {
    width: 100%;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
  }
  
  .content-type-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .topic-display {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>