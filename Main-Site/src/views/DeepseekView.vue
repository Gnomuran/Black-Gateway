<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-md-8 col-sm-12">
        <q-card class="my-card">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h5">AI Assistant</div>
                <div class="text-subtitle2">Powered by Mistral AI</div>
              </div>
              <div class="col-auto">
                <q-avatar>
                  <q-icon name="smart_toy" size="32px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="chat-container q-pa-none">
            <q-scroll-area style="height: 60vh; max-height: 60vh;" ref="scrollArea">
              <div class="q-pa-md">
                <div v-if="conversation.length === 0" class="text-center q-pa-lg text-grey">
                  <q-icon name="chat" size="48px" />
                  <div class="text-h6 q-mt-md">Start a conversation</div>
                  <div class="text-body2">Ask me anything about science, programming, or general knowledge.</div>
                </div>

                <div v-for="(item, index) in conversation" :key="index" class="q-mb-md">
                  <div class="question text-right q-pa-sm bg-blue-1 rounded-borders q-mb-xs">
                    <div class="row items-center justify-end q-mb-xs">
                      <q-avatar size="24px" color="primary" text-color="white" icon="person" class="q-mr-xs" />
                      <strong>You</strong>
                    </div>
                    <div>{{ item.question }}</div>
                    <div class="text-caption text-right q-mt-xs text-grey">
                      {{ formatTime(item.timestamp) }}
                    </div>
                  </div>

                  <div 
                    :class="[
                      'answer text-left q-pa-sm rounded-borders',
                      item.isError ? 'bg-red-1' : 'bg-green-1'
                    ]"
                  >
                    <div class="row items-center q-mb-xs">
                      <q-avatar size="24px" color="secondary" text-color="white" icon="smart_toy" class="q-mr-xs" />
                      <strong>AI Assistant</strong>
                      <q-badge v-if="item.retried" color="positive" class="q-ml-sm">Updated</q-badge>
                    </div>
                    
                    <div v-if="item.answer">
                      <div v-html="formatAnswer(item.answer)"></div>
                    </div>
                    <div v-else class="text-center">
                      <q-spinner color="primary" size="2em" />
                      <div class="q-mt-xs text-grey">Thinking...</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="modelLoading" class="bg-amber-1 q-pa-sm">
            <div class="row items-center">
              <q-icon name="info" color="amber-9" size="24px" class="q-mr-sm" />
              <div>
                The AI model is warming up. Initial responses may be simplified.
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-input
              v-model="prompt"
              label="Ask anything..."
              filled
              type="textarea"
              class="full-width"
              :disable="isLoading"
              @keyup.enter.prevent="handleSubmit"
              :loading="isLoading"
              :rows="2"
              autogrow
              maxlength="1000"
              counter
            >
              <template v-slot:append>
                <q-icon v-if="prompt" name="close" @click="prompt = ''" class="cursor-pointer" />
              </template>
            </q-input>
            
            <div class="row full-width justify-between q-mt-sm">
              <q-btn
                label="Clear Chat"
                color="negative"
                flat
                @click="clearConversation"
                :disable="isLoading || conversation.length === 0"
                icon="delete"
              />
              <q-btn
                label="Send"
                color="primary"
                @click="handleSubmit"
                :loading="isLoading"
                :disable="!prompt.trim()"
                icon-right="send"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useDeepseekStore } from '../stores/deepseek';
import { useQuasar } from 'quasar';

const deepseekStore = useDeepseekStore();
const prompt = ref('');
const $q = useQuasar();
const scrollArea = ref(null);

const { conversation, isLoading, error, modelLoading } = deepseekStore;

// Format timestamps
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// Format AI responses with markdown-like syntax
const formatAnswer = (text) => {
  if (!text) return '';
  
  // Convert code blocks
  text = text.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre class="code-block"><code>$2</code></pre>');
  
  // Convert inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert line breaks
  text = text.replace(/\n/g, '<br>');
  
  return text;
};

const handleSubmit = async () => {
  if (!prompt.value.trim()) return;
  
  try {
    await deepseekStore.askQuestion(prompt.value);
    prompt.value = '';
    
    // Scroll to bottom after adding new message
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Error:', err);
    $q.notify({
      color: 'negative',
      message: `Error: ${error.value || 'Failed to get response'}`,
      icon: 'error',
      position: 'top'
    });
  }
};

const clearConversation = () => {
  $q.dialog({
    title: 'Clear Conversation',
    message: 'Are you sure you want to clear the entire conversation?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deepseekStore.clearConversation();
  });
};

const scrollToBottom = () => {
  if (scrollArea.value) {
    const scrollEl = scrollArea.value.getScrollTarget();
    const scrollHeight = scrollEl.scrollHeight;
    scrollArea.value.setScrollPosition('vertical', scrollHeight, 300);
  }
};

// Auto-scroll to bottom when conversation updates
watch(() => conversation.value.length, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

// Also watch for changes to the last answer
watch(() => {
  if (conversation.value.length > 0) {
    return conversation.value[conversation.value.length - 1].answer;
  }
  return null;
}, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

onMounted(() => {
  // Focus the input field when component mounts
  setTimeout(() => {
    const inputEl = document.querySelector('textarea');
    if (inputEl) inputEl.focus();
  }, 500);
});
</script>

<style scoped>
.chat-container {
  background-color: #f5f5f5;
}

.question {
  margin-left: 20%;
  position: relative;
}

.answer {
  margin-right: 20%;
  position: relative;
}

:deep(.code-block) {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

:deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
  </style>
