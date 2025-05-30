<template>
  <div class="ai-assistant-container">
    <!-- Collapsible Chat Panel -->
    <div class="chat-panel" :class="{ 'collapsed': chatPanelCollapsed }">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="panel-title" v-if="!chatPanelCollapsed">
          <q-icon name="psychology" class="title-icon" />
          <span>DeepSeek</span>
        </div>
        <div class="panel-controls">
          <q-btn
            flat
            round
            :icon="chatPanelCollapsed ? 'chevron_right' : 'chevron_left'"
            @click="toggleChatPanel"
            class="collapse-btn"
            size="sm"
          />
          <q-btn
            v-if="!chatPanelCollapsed"
            flat
            round
            icon="add"
            @click="createNewChat"
            class="new-chat-btn"
            size="sm"
            :loading="creatingChat"
          />
        </div>
      </div>

      <!-- Chat List -->
      <div v-if="!chatPanelCollapsed" class="chat-list">
        <!-- Loading State -->
        <div v-if="loadingChats" class="loading-state">
          <q-spinner-dots size="1.5rem" color="grey-6" />
          <span>Loading chats...</span>
        </div>

        <!-- Chat Items -->
        <div v-else class="chat-items">
          <div
            v-for="chat in conversations"
            :key="chat.id"
            class="chat-item"
            :class="{ 'active': currentConversationId === chat.id }"
            @click="selectChat(chat)"
          >
            <div class="chat-content">
              <div class="chat-title">{{ chat.title }}</div>
              <div class="chat-preview">
                {{ formatChatPreview(chat.last_message_preview) }}
              </div>
              <div class="chat-date">{{ formatChatDate(chat.updated_at) }}</div>
            </div>
            <div class="chat-actions">
              <q-btn
                flat
                round
                icon="edit"
                size="xs"
                @click.stop="startRenameChat(chat)"
                class="action-btn"
              />
              <q-btn
                flat
                round
                icon="delete"
                size="xs"
                @click.stop="deleteChat(chat)"
                class="action-btn delete-btn"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="conversations.length === 0 && !loadingChats" class="empty-state">
            <q-icon name="chat_bubble_outline" size="2rem" color="grey-5" />
            <span>No chats yet</span>
            <q-btn
              flat
              label="Start chatting"
              @click="createNewChat"
              class="start-chat-btn"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <h1>
          <q-icon name="psychology" class="brain-icon" />
          AI Physics Assistant
        </h1>
        <p>Your advanced AI companion powered by DeepSeek R1, specializing in quantum mechanics, relativity, black holes, and cutting-edge physics research.</p>
      </div>

      <!-- Chat Container -->
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="ai-model-info">
              <q-icon name="smart_toy" class="ai-icon" />
              <div class="model-details">
                <span class="model-name">Physics AI Assistant</span>
                <span class="model-powered">Powered by DeepSeek R1</span>
              </div>
            </div>
            <div class="header-actions">
              <div class="connection-status">
                <q-chip 
                  :color="connectionStatus.color" 
                  :icon="connectionStatus.icon"
                  size="sm"
                  :label="connectionStatus.text"
                  class="status-chip"
                />
              </div>
              <q-btn
                v-if="currentConversationId"
                flat
                round
                icon="refresh"
                @click="refreshChat"
                class="refresh-btn"
                title="Refresh Chat"
              />
            </div>
          </div>
        </div>
        
        <!-- Chat Messages -->
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message', message.role === 'assistant' ? 'ai' : 'user']"
          >
            <div class="message-bubble">
              <div v-if="message.role === 'assistant'" class="ai-avatar">
                <q-icon name="smart_toy" />
              </div>
              <div class="message-content" v-html="formatMessage(message.content, message.metadata)"></div>
              <div class="message-footer">
                <div class="message-time">{{ formatTime(message.created_at || message.timestamp) }}</div>
                <div v-if="message.metadata && message.role === 'assistant'" class="message-metadata">
                  <q-chip 
                    v-if="message.metadata.source === 'deepseek-r1'"
                    color="secondary" 
                    size="xs"
                    label="DeepSeek R1"
                    class="model-chip"
                  />
                  <q-chip 
                    v-else-if="message.metadata.source === 'local-fallback'"
                    color="warning" 
                    size="xs"
                    label="Offline Mode"
                    class="model-chip"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message ai">
            <div class="message-bubble typing-bubble">
              <div class="ai-avatar">
                <q-icon name="smart_toy" />
              </div>
              <div class="typing-indicator">
                <div class="typing-text">DeepSeek R1 is thinking</div>
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Welcome Message for New Chats -->
          <div v-if="messages.length === 0 && !isTyping" class="welcome-message">
            <div class="welcome-content">
              <q-icon name="psychology" size="3rem" class="welcome-icon" />
              <h3>Welcome to DeepSeek R1</h3>
              <p>Your advanced AI physics assistant is ready to help with quantum mechanics, relativity, black holes, particle physics, and more!</p>
              <div class="quick-examples">
                <q-btn
                  flat
                  no-caps
                  label="Explain quantum entanglement"
                  @click="sendQuickMessage('Explain quantum entanglement and its implications for physics')"
                  class="example-btn"
                />
                <q-btn
                  flat
                  no-caps
                  label="Black hole physics"
                  @click="sendQuickMessage('Tell me about black hole physics and Hawking radiation')"
                  class="example-btn"
                />
                <q-btn
                  flat
                  no-caps
                  label="Einstein's relativity"
                  @click="sendQuickMessage('Explain Einstein\'s theories of special and general relativity')"
                  class="example-btn"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-container">
          <!-- Input Row -->
          <div class="input-row">
            <q-input
              v-model="currentMessage"
              outlined
              placeholder="Ask me anything about physics..."
              class="message-input"
              @keypress.enter="sendMessage"
              :disable="isTyping"
              maxlength="2000"
              counter
              autogrow
              :rows="1"
            >
              <template v-slot:prepend>
                <q-icon name="psychology" color="primary" />
              </template>
            </q-input>
            <q-btn
              round
              color="primary"
              icon="send"
              :disable="!currentMessage.trim() || isTyping"
              @click="sendMessage"
              class="send-button"
              :loading="isTyping"
            />
          </div>
          
          <!-- Input Footer -->
          <div class="input-footer">
            <div class="footer-info">
              <q-icon name="info" size="xs" />
              <span>Ask about quantum mechanics, relativity, black holes, or any physics topic</span>
            </div>
            <div class="character-count">
              {{ currentMessage.length }}/2000
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rename Chat Dialog -->
    <q-dialog v-model="showRenameDialog" persistent>
      <q-card class="rename-dialog">
        <q-card-section>
          <h3>Rename Chat</h3>
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model="renameTitle"
            outlined
            placeholder="Enter new chat title"
            maxlength="100"
            counter
            ref="renameTitleInput"
            :rules="[val => !!val.trim() || 'Title is required']"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelRename" />
          <q-btn 
            :loading="renamingChat"
            :disable="!renameTitle.trim()"
            @click="confirmRename"
            color="primary"
            label="Rename"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Floating particles for visual effect -->
    <div class="particles-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :style="particle.style"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()

// Reactive data
const messages = ref([])
const conversations = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const chatMessages = ref(null)
const particles = ref([])
const particleId = ref(0)

// Chat panel state
const chatPanelCollapsed = ref(false)
const loadingChats = ref(false)
const creatingChat = ref(false)
const currentConversationId = ref(null)

// Rename dialog state
const showRenameDialog = ref(false)
const renameTitle = ref('')
const renamingChat = ref(false)
const renamingChatId = ref(null)
const renameTitleInput = ref(null)

// Connection status
const connectionStatus = ref({
  color: 'positive',
  icon: 'wifi',
  text: 'Connected'
})

// Computed
const currentUser = computed(() => authStore.currentUser())

// Methods
const toggleChatPanel = () => {
  chatPanelCollapsed.value = !chatPanelCollapsed.value
}

const loadConversations = async () => {
  if (!currentUser.value) return

  loadingChats.value = true
  try {
    const response = await fetch('http://localhost:5000/ai-assistant/conversations', {
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      conversations.value = data.conversations
      console.log('✅ Loaded conversations:', data.conversations.length)
    } else {
      throw new Error('Failed to load conversations')
    }
  } catch (error) {
    console.error('❌ Error loading conversations:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load chat history',
      position: 'top'
    })
  } finally {
    loadingChats.value = false
  }
}

const createNewChat = async () => {
  if (!currentUser.value) return

  creatingChat.value = true
  try {
    const response = await fetch('http://localhost:5000/ai-assistant/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: 'New Chat' })
    })

    if (response.ok) {
      const data = await response.json()
      conversations.value.unshift(data.conversation)
      currentConversationId.value = data.conversation.id
      messages.value = []
      
      $q.notify({
        type: 'positive',
        message: 'New chat created',
        position: 'top'
      })
    } else {
      throw new Error('Failed to create chat')
    }
  } catch (error) {
    console.error('❌ Error creating chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to create new chat',
      position: 'top'
    })
  } finally {
    creatingChat.value = false
  }
}

const selectChat = async (chat) => {
  if (currentConversationId.value === chat.id) return

  currentConversationId.value = chat.id
  messages.value = []

  try {
    const response = await fetch(`http://localhost:5000/ai-assistant/conversations/${chat.id}`, {
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      messages.value = data.messages
      await scrollToBottom()
      console.log('✅ Loaded chat messages:', data.messages.length)
    } else {
      throw new Error('Failed to load chat')
    }
  } catch (error) {
    console.error('❌ Error loading chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load chat messages',
      position: 'top'
    })
  }
}

const startRenameChat = (chat) => {
  renamingChatId.value = chat.id
  renameTitle.value = chat.title
  showRenameDialog.value = true
  
  nextTick(() => {
    if (renameTitleInput.value) {
      renameTitleInput.value.focus()
      renameTitleInput.value.select()
    }
  })
}

const cancelRename = () => {
  showRenameDialog.value = false
  renameTitle.value = ''
  renamingChatId.value = null
}

const confirmRename = async () => {
  if (!renameTitle.value.trim() || !renamingChatId.value) return

  renamingChat.value = true
  try {
    const response = await fetch(`http://localhost:5000/ai-assistant/conversations/${renamingChatId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: renameTitle.value.trim() })
    })

    if (response.ok) {
      const data = await response.json()
      
      // Update the conversation in the list
      const chatIndex = conversations.value.findIndex(c => c.id === renamingChatId.value)
      if (chatIndex !== -1) {
        conversations.value[chatIndex].title = data.conversation.title
      }
      
      $q.notify({
        type: 'positive',
        message: 'Chat renamed successfully',
        position: 'top'
      })
      
      cancelRename()
    } else {
      throw new Error('Failed to rename chat')
    }
  } catch (error) {
    console.error('❌ Error renaming chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to rename chat',
      position: 'top'
    })
  } finally {
    renamingChat.value = false
  }
}

const deleteChat = async (chat) => {
  const confirmed = await new Promise(resolve => {
    $q.dialog({
      title: 'Delete Chat',
      message: `Are you sure you want to delete "${chat.title}"? This action cannot be undone.`,
      cancel: true,
      persistent: true
    }).onOk(() => resolve(true)).onCancel(() => resolve(false))
  })

  if (!confirmed) return

  try {
    const response = await fetch(`http://localhost:5000/ai-assistant/conversations/${chat.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (response.ok) {
      // Remove from conversations list
      conversations.value = conversations.value.filter(c => c.id !== chat.id)
      
      // If this was the current chat, clear it
      if (currentConversationId.value === chat.id) {
        currentConversationId.value = null
        messages.value = []
      }
      
      $q.notify({
        type: 'positive',
        message: 'Chat deleted successfully',
        position: 'top'
      })
    } else {
      throw new Error('Failed to delete chat')
    }
  } catch (error) {
    console.error('❌ Error deleting chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to delete chat',
      position: 'top'
    })
  }
}

const refreshChat = async () => {
  if (!currentConversationId.value) return
  
  const currentChat = conversations.value.find(c => c.id === currentConversationId.value)
  if (currentChat) {
    await selectChat(currentChat)
  }
}

// Enhanced AI response using conversation context
const getAIResponse = async (message) => {
  try {
    connectionStatus.value = {
      color: 'warning',
      icon: 'sync',
      text: 'Thinking...'
    }
    
    const response = await fetch('http://localhost:5000/ai-assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        conversationId: currentConversationId.value,
        context: {
          timestamp: new Date().toISOString(),
          sessionId: Date.now(),
          clientInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language
          }
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Update conversation ID if this was a new chat
    if (!currentConversationId.value && data.conversationId) {
      currentConversationId.value = data.conversationId
      await loadConversations() // Refresh the conversations list
    }
    
    connectionStatus.value = {
      color: 'positive',
      icon: 'wifi',
      text: 'Connected'
    }
    
    return {
      content: data.response,
      metadata: data.metadata
    }
    
  } catch (error) {
    console.error('❌ AI API error:', error)
    
    connectionStatus.value = {
      color: 'negative',
      icon: 'wifi_off',
      text: 'Offline'
    }
    
    throw error
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim()) return
  
  // Check if user is logged in
  if (!currentUser.value) {
    $q.notify({
      type: 'warning',
      message: 'Please log in to start chatting',
      position: 'top'
    })
    return
  }

  const userMessage = currentMessage.value.trim()
  
  // Add user message to UI immediately
  const userMsg = {
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
    created_at: new Date()
  }
  messages.value.push(userMsg)
  currentMessage.value = ''
  await scrollToBottom()
  
  // Show typing indicator
  isTyping.value = true
  await scrollToBottom()
  
  try {
    // Get AI response
    const aiResponseData = await getAIResponse(userMessage)
    
    // Add some realistic thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))
    
    isTyping.value = false
    
    // Add AI response
    const aiMsg = {
      role: 'assistant',
      content: aiResponseData.content,
      metadata: aiResponseData.metadata,
      timestamp: new Date(),
      created_at: new Date()
    }
    messages.value.push(aiMsg)
    
    await scrollToBottom()
    
    // Refresh conversations list to update last message and timestamp
    await loadConversations()
    
  } catch (error) {
    console.error('❌ Error getting AI response:', error)
    isTyping.value = false
    
    const errorMsg = {
      role: 'assistant',
      content: "I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment.",
      metadata: { source: 'error', error: error.message },
      timestamp: new Date(),
      created_at: new Date()
    }
    messages.value.push(errorMsg)
    
    await scrollToBottom()
  }
}

const sendQuickMessage = (message) => {
  currentMessage.value = message
  sendMessage()
}

// Message formatting
const formatMessage = (text, metadata = null) => {
  let formattedText = text.replace(/\n/g, '<br/>')
  
  // Enhanced formatting for equations and scientific notation
  formattedText = formattedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="physics-equation">$1</code>')
    .replace(/_{(.*?)}/g, '<sub>$1</sub>')
    .replace(/\^{(.*?)}/g, '<sup>$1</sup>')
    // Enhanced equation formatting
    .replace(/E\s*=\s*mc²/g, '<span class="famous-equation">E = mc²</span>')
    .replace(/ψ/g, '<span class="greek-letter">ψ</span>')
    .replace(/Δ/g, '<span class="greek-letter">Δ</span>')
    .replace(/∞/g, '<span class="math-symbol">∞</span>')
    .replace(/ℏ/g, '<span class="math-symbol">ℏ</span>')
  
  return formattedText
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatChatPreview = (preview) => {
  if (!preview) return 'No messages yet'
  return preview.length > 50 ? preview.substring(0, 47) + '...' : preview
}

const formatChatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

// Test DeepSeek connection
const testConnection = async () => {
  try {
    connectionStatus.value = {
      color: 'warning',
      icon: 'sync',
      text: 'Testing...'
    }
    
    const response = await fetch('http://localhost:5000/ai-assistant/health', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const health = await response.json()
      connectionStatus.value = {
        color: health.config.apiConfigured ? 'positive' : 'warning',
        icon: health.config.apiConfigured ? 'wifi' : 'wifi_off',
        text: health.config.apiConfigured ? 'Connected' : 'API Not Configured'
      }
      
      console.log('🏥 Health Check:', health)
    } else {
      throw new Error('Health check failed')
    }
  } catch (error) {
    connectionStatus.value = {
      color: 'negative',
      icon: 'wifi_off',
      text: 'Connection Failed'
    }
    console.error('❌ Connection test failed:', error)
  }
}

// Particle animation
const createParticle = () => {
  const particle = {
    id: particleId.value++,
    style: {
      left: Math.random() * 100 + '%',
      animationDuration: (3 + Math.random() * 3) + 's',
      animationDelay: Math.random() * 2 + 's'
    }
  }
  
  particles.value.push(particle)
  
  setTimeout(() => {
    particles.value = particles.value.filter(p => p.id !== particle.id)
  }, 8000)
}

let particleInterval

// Watch for user changes
watch(() => currentUser.value, (newUser) => {
  if (newUser) {
    loadConversations()
  } else {
    conversations.value = []
    messages.value = []
    currentConversationId.value = null
  }
})

// Lifecycle
onMounted(async () => {
  if (currentUser.value) {
    await loadConversations()
  }
  await testConnection()
  
  // Start particle animation
  particleInterval = setInterval(createParticle, 2000)
})

onUnmounted(() => {
  if (particleInterval) {
    clearInterval(particleInterval)
  }
})
</script>

<style scoped>
.ai-assistant-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: grid;
  grid-template-columns: auto 1fr;
  position: relative;
  overflow: hidden;
}

.chat-panel {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  display: flex;
  flex-direction: column;
  width: 320px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-panel.collapsed {
  width: 60px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #63b3ed;
}

.title-icon {
  font-size: 1.5rem;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(99, 179, 237, 0.5));
    transform: scale(1);
  }
  50% { 
    filter: drop-shadow(0 0 15px rgba(99, 179, 237, 0.8));
    transform: scale(1.05);
  }
}

.panel-controls {
  display: flex;
  gap: 0.5rem;
}

.collapse-btn, .new-chat-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
}

.collapse-btn:hover, .new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.chat-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(99, 179, 237, 0.5);
  transform: translateY(-1px);
}

.chat-item.active {
  background: rgba(99, 179, 237, 0.2);
  border-color: #63b3ed;
  box-shadow: 0 0 10px rgba(99, 179, 237, 0.3);
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-preview {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-date {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
}

.chat-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  width: 24px;
  height: 24px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.start-chat-btn {
  color: #63b3ed;
  border: 1px solid rgba(99, 179, 237, 0.5);
}

.main-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brain-icon {
  font-size: 3rem !important;
  margin-right: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.chat-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 500px;
}

.chat-header {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  padding: 1rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.ai-model-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-icon {
  font-size: 1.8rem;
  color: #ffd700;
  animation: pulse-glow 2s infinite;
}

.model-details {
  display: flex;
  flex-direction: column;
}

.model-name {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1;
}

.model-powered {
  font-size: 0.8rem;
  opacity: 0.9;
  font-weight: 400;
  color: #ffd700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.status-chip {
  font-size: 0.75rem;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: linear-gradient(45deg, #f7fafc 0%, #edf2f7 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
}

.message.ai {
  align-self: flex-start;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  position: relative;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem 1.5rem 0.5rem 1.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.message.ai .message-bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #2d3748;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem 1.5rem 1.5rem 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.ai-avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.5rem;
  align-self: flex-start;
}

.message-content {
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
  align-self: flex-end;
}

.message-metadata {
  display: flex;
  gap: 0.25rem;
}

.model-chip {
  font-size: 0.65rem;
  height: 18px;
}

.typing-bubble {
  background: white !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.typing-text {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #4299e1;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.welcome-content {
  text-align: center;
  color: #64748b;
  max-width: 500px;
}

.welcome-icon {
  color: #4299e1;
  margin-bottom: 1rem;
}

.welcome-content h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.welcome-content p {
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.quick-examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example-btn {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
  border: 1px solid rgba(66, 153, 225, 0.3);
  padding: 0.75rem 1rem;
}

.example-btn:hover {
  background: #4299e1;
  color: white;
}

.chat-input-container {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.message-input :deep(.q-field__control) {
  border-radius: 1.5rem;
  background: #f7fafc;
}

.send-button {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.send-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.character-count {
  font-weight: 500;
}

.rename-dialog {
  min-width: 400px;
}

.rename-dialog h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Enhanced equation and scientific notation styling */
.physics-equation {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #3730a3;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-family: 'Latin Modern Math', 'Computer Modern', serif;
  font-weight: 500;
  border: 1px solid #c7d2fe;
}

.famous-equation {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  border: 1px solid #f59e0b;
}

.greek-letter {
  color: #7c3aed;
  font-weight: 600;
  font-size: 1.1em;
}

.math-symbol {
  color: #059669;
  font-weight: 600;
  font-size: 1.1em;
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: fall linear infinite;
  top: -10px;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ai-assistant-container {
    grid-template-columns: 1fr;
  }
  
  .chat-panel {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
  }
  
  .chat-panel:not(.collapsed) {
    transform: translateX(0);
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .quick-examples {
    flex-direction: column;
  }
}
</style>