<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="create-post-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <q-icon name="create" size="1.5rem" class="header-icon" />
            <h2>Create New Discussion</h2>
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
        <div class="form-container">
          <!-- Topic Selection -->
          <div class="form-group">
            <label class="form-label">Select Topic</label>
            <q-select
              v-model="form.topic_id"
              :options="topicOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              placeholder="Choose a discussion topic"
              class="topic-select"
              :rules="[val => !!val || 'Please select a topic']"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <div class="topic-option-icon" :style="{ backgroundColor: scope.opt.color }">
                      <q-icon :name="scope.opt.icon" color="white" />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
              :rules="[
                val => !!val || 'Title is required',
                val => val.length >= 10 || 'Title must be at least 10 characters',
                val => val.length <= 500 || 'Title cannot exceed 500 characters'
              ]"
              class="title-input"
            />
          </div>

          <!-- Content Type Tabs -->
          <div class="form-group">
            <label class="form-label">Content Type</label>
            <q-tabs
              v-model="contentType"
              class="content-tabs"
              indicator-color="primary"
              active-color="primary"
              align="justify"
            >
              <q-tab name="text" icon="text_fields" label="Text" />
              <q-tab name="image" icon="image" label="Image" />
              <q-tab name="video" icon="videocam" label="Video" />
              <q-tab name="gif" icon="gif" label="GIF" />
            </q-tabs>
          </div>

          <!-- Content Panels -->
          <q-tab-panels v-model="contentType" animated class="content-panels">
            <!-- Text Content -->
            <q-tab-panel name="text" class="content-panel">
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
                  :rules="[
                    val => !!val || 'Content is required',
                    val => val.length >= 20 || 'Content must be at least 20 characters'
                  ]"
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
            </q-tab-panel>

            <!-- Image Upload -->
            <q-tab-panel name="image" class="content-panel">
              <div class="form-group">
                <label class="form-label">Upload Image</label>
                <q-file
                  v-model="form.mediaFile"
                  outlined
                  accept="image/*"
                  max-file-size="10485760"
                  @rejected="onMediaRejected"
                  class="media-upload"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                
                <!-- Image Preview -->
                <div v-if="mediaPreview && contentType === 'image'" class="media-preview">
                  <img :src="mediaPreview" alt="Preview" class="image-preview" />
                  <q-btn
                    round
                    color="negative"
                    icon="close"
                    size="sm"
                    @click="removeMedia"
                    class="remove-media-btn"
                  />
                </div>
                
                <q-input
                  v-model="form.content"
                  type="textarea"
                  outlined
                  placeholder="Add a description or context for your image..."
                  rows="4"
                  class="content-textarea"
                />
              </div>
            </q-tab-panel>

            <!-- Video Upload -->
            <q-tab-panel name="video" class="content-panel">
              <div class="form-group">
                <label class="form-label">Upload Video</label>
                <q-file
                  v-model="form.mediaFile"
                  outlined
                  accept="video/*"
                  max-file-size="52428800"
                  @rejected="onMediaRejected"
                  class="media-upload"
                >
                  <template v-slot:prepend>
                    <q-icon name="videocam" />
                  </template>
                </q-file>
                
                <!-- Video Preview -->
                <div v-if="mediaPreview && contentType === 'video'" class="media-preview">
                  <video :src="mediaPreview" controls class="video-preview" />
                  <q-btn
                    round
                    color="negative"
                    icon="close"
                    size="sm"
                    @click="removeMedia"
                    class="remove-media-btn"
                  />
                </div>
                
                <q-input
                  v-model="form.content"
                  type="textarea"
                  outlined
                  placeholder="Add a description or context for your video..."
                  rows="4"
                  class="content-textarea"
                />
              </div>
            </q-tab-panel>

            <!-- GIF Selection -->
            <q-tab-panel name="gif" class="content-panel">
              <div class="form-group">
                <label class="form-label">Search GIFs</label>
                <q-input
                  v-model="gifSearch"
                  outlined
                  placeholder="Search for GIFs..."
                  debounce="500"
                  @update:model-value="searchGifs"
                  class="gif-search"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
                
                <!-- GIF Grid -->
                <div class="gif-grid" v-if="gifs.length > 0">
                  <div
                    v-for="gif in gifs"
                    :key="gif.id"
                    class="gif-item"
                    :class="{ selected: selectedGif?.id === gif.id }"
                    @click="selectGif(gif)"
                  >
                    <img :src="gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url" :alt="gif.content_description" />
                    <div class="gif-overlay">
                      <q-icon v-if="selectedGif?.id === gif.id" name="check_circle" size="2rem" color="positive" />
                    </div>
                  </div>
                </div>
                
                <!-- Trending GIFs -->
                <div v-else-if="!gifSearch && trendingGifs.length > 0" class="trending-section">
                  <h4>Trending GIFs</h4>
                  <div class="gif-grid">
                    <div
                      v-for="gif in trendingGifs"
                      :key="gif.id"
                      class="gif-item"
                      :class="{ selected: selectedGif?.id === gif.id }"
                      @click="selectGif(gif)"
                    >
                      <img :src="gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url" :alt="gif.content_description" />
                      <div class="gif-overlay">
                        <q-icon v-if="selectedGif?.id === gif.id" name="check_circle" size="2rem" color="positive" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Loading State -->
                <div v-if="forumStore.gifs.loading" class="gif-loading">
                  <q-spinner-dots size="2rem" color="primary" />
                  <p>Loading GIFs...</p>
                </div>
                
                <q-input
                  v-model="form.content"
                  type="textarea"
                  outlined
                  placeholder="Add a description or context for your GIF..."
                  rows="4"
                  class="content-textarea"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
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
            :disable="!isFormValid"
            @click="createPost"
            color="primary"
            label="Create Discussion"
            class="create-btn"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useForumStore } from '../stores/forum'
// import { useQuasar } from 'quasar'  // Removed for now

// const $q = useQuasar()  // Removed for now
const forumStore = useForumStore()

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  topics: Array
})

const emit = defineEmits(['update:modelValue', 'post-created'])

// Reactive Data
const form = ref({
  topic_id: null,
  title: '',
  content: '',
  post_type: 'text',
  mediaFile: null
})

const contentType = ref('text')
const gifSearch = ref('')
const selectedGif = ref(null)
const gifs = ref([])
const trendingGifs = ref([])

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const topicOptions = computed(() => {
  return props.topics?.map(topic => ({
    label: topic.title,
    value: topic.id,
    description: topic.description,
    icon: topic.icon,
    color: topic.color
  })) || []
})

const mediaPreview = computed(() => {
  if (!form.value.mediaFile) return null
  return URL.createObjectURL(form.value.mediaFile)
})

const isFormValid = computed(() => {
  const hasTitle = form.value.title && form.value.title.length >= 10
  const hasContent = form.value.content && form.value.content.length >= 20
  const hasTopic = form.value.topic_id && (typeof form.value.topic_id === 'number' || typeof form.value.topic_id === 'string')
  const hasMedia = contentType.value !== 'text' ? (form.value.mediaFile || selectedGif.value) : true
  
  console.log('Form validation:', {
    hasTitle,
    hasContent, 
    hasTopic,
    hasMedia,
    topic_id: form.value.topic_id,
    topic_id_type: typeof form.value.topic_id
  })
  
  return hasTitle && hasContent && hasTopic && hasMedia
})

// Methods
const closeDialog = () => {
  if (forumStore.isLoading) return
  
  resetForm()
  dialogVisible.value = false
}

const resetForm = () => {
  form.value = {
    topic_id: null,
    title: '',
    content: '',
    post_type: 'text',
    mediaFile: null
  }
  contentType.value = 'text'
  gifSearch.value = ''
  selectedGif.value = null
  gifs.value = []
  console.log('Form reset, topic_id:', form.value.topic_id)
}

const formatText = (before, after) => {
  // Simple text formatting - you could enhance this with actual cursor position
  const textarea = document.querySelector('.content-textarea textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = form.value.content
    const selectedText = text.substring(start, end) || 'text'
    
    form.value.content = text.substring(0, start) + before + selectedText + after + text.substring(end)
  }
}

const insertLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    const linkText = prompt('Enter link text:', url)
    const markdown = `[${linkText || url}](${url})`
    form.value.content += markdown
  }
}

const onMediaRejected = (rejectedEntries) => {
  console.log(`File rejected: ${rejectedEntries[0].failedPropValidation}`)
  // $q.notify({
  //   type: 'negative',
  //   message: `File rejected: ${rejectedEntries[0].failedPropValidation}`
  // })
}

const removeMedia = () => {
  form.value.mediaFile = null
  if (mediaPreview.value) {
    URL.revokeObjectURL(mediaPreview.value)
  }
}

const searchGifs = async (query) => {
  if (!query) {
    gifs.value = []
    return
  }
  
  const results = await forumStore.searchGifs(query, 20)
  gifs.value = results
}

const selectGif = (gif) => {
  selectedGif.value = gif
}

const loadTrendingGifs = async () => {
  const results = await forumStore.fetchTrendingGifs(20)
  trendingGifs.value = results
}

const createPost = async () => {
  if (!isFormValid.value) {
    console.log('Form is not valid:', {
      hasTitle: form.value.title && form.value.title.length >= 10,
      hasContent: form.value.content && form.value.content.length >= 20,
      hasTopic: form.value.topic_id,
      hasMedia: contentType.value !== 'text' ? (form.value.mediaFile || selectedGif.value) : true
    })
    return
  }
  
  // Ensure topic_id is a number
  const topicId = typeof form.value.topic_id === 'object' ? form.value.topic_id.value : form.value.topic_id
  const numericTopicId = parseInt(topicId)
  
  console.log('Creating post with data:', {
    topic_id: numericTopicId,
    title: form.value.title,
    content: form.value.content,
    post_type: contentType.value,
    hasFile: !!form.value.mediaFile,
    hasGif: !!selectedGif.value
  })
  
  const postData = {
    topic_id: numericTopicId,  // Ensure it's a number
    title: form.value.title,
    content: form.value.content,
    post_type: contentType.value
  }
  
  // Handle different content types
  if (contentType.value === 'gif' && selectedGif.value) {
    // For GIFs, we need to download and store the image data
    try {
      console.log('Downloading GIF from:', selectedGif.value.media_formats?.gif?.url)
      
      const response = await fetch(selectedGif.value.media_formats?.gif?.url, {
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download GIF: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('Downloaded GIF blob:', {
        size: blob.size,
        type: blob.type
      })
      
      // Create a proper File object with correct MIME type
      const file = new File([blob], `tenor-gif-${Date.now()}.gif`, { 
        type: 'image/gif',
        lastModified: Date.now()
      })
      
      console.log('Created GIF file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
      
      postData.media = file
      postData.post_type = 'gif'
      console.log('GIF processed successfully, file size:', file.size)
    } catch (error) {
      console.error('Error downloading GIF:', error)
      console.log('Failed to process GIF. Please try again.')
      return
    }
  } else if (form.value.mediaFile) {
    postData.media = form.value.mediaFile
    console.log('Media file attached:', form.value.mediaFile.name, form.value.mediaFile.size)
  }
  
  console.log('Sending post data to store...')
  const result = await forumStore.createPost(postData)
  
  if (result) {
    console.log('Post created successfully:', result)
    emit('post-created', result)
    closeDialog()
  } else {
    console.error('Failed to create post')
  }
}

// Watchers
watch(contentType, (newType) => {
  form.value.post_type = newType
  if (newType !== 'gif') {
    selectedGif.value = null
  }
  if (newType === 'text') {
    form.value.mediaFile = null
  }
})

// Debug topic selection
watch(() => form.value.topic_id, (newTopicId, oldTopicId) => {
  console.log('Topic ID changed:', {
    old: oldTopicId,
    new: newTopicId,
    type: typeof newTopicId
  })
})

// Lifecycle
onMounted(() => {
  loadTrendingGifs()
  console.log('CreatePostDialog mounted, available topics:', props.topics?.length)
})
</script>

<style scoped>
.create-post-dialog {
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

.topic-select {
  background: white;
}

.topic-option-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-input, .content-textarea {
  background: white;
}

.content-tabs {
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.content-panels {
  background: transparent;
}

.content-panel {
  padding: 1rem 0;
}

.formatting-toolbar {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.media-upload {
  background: white;
}

.media-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  display: inline-block;
}

.image-preview, .video-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
}

.video-preview {
  width: 100%;
}

.remove-media-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.gif-search {
  background: white;
  margin-bottom: 1rem;
}

.gif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.gif-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.gif-item:hover {
  border-color: #a855f7;
  transform: scale(1.02);
}

.gif-item.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.gif-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gif-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gif-item.selected .gif-overlay {
  opacity: 1;
}

.trending-section h4 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
  font-weight: 600;
}

.gif-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.gif-loading p {
  margin-top: 0.5rem;
  color: #64748b;
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

.create-btn {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

@media (max-width: 600px) {
  .dialog-content {
    padding: 1rem;
  }
  
  .gif-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions-left, .actions-right {
    width: 100%;
  }
  
  .cancel-btn, .create-btn {
    width: 100%;
  }
}
</style>