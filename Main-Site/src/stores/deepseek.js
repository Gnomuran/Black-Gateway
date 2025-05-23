import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../boot/axios';

export const useDeepseekStore = defineStore('deepseek', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const conversation = ref([]);
  const modelLoading = ref(false);

  const askQuestion = async (prompt) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Add user question to conversation immediately
      const questionEntry = {
        question: prompt,
        answer: null,
        timestamp: new Date().toISOString()
      };
      
      conversation.value.push(questionEntry);
      
      // Try to get answer from AI
      const response = await api.post('/api/deepseek/ask', { prompt });
      
      // Check if model is still loading
      if (response.data.isLoading) {
        modelLoading.value = true;
        questionEntry.answer = response.data.answer;
        
        // Set a timeout to retry after a few seconds
        setTimeout(() => {
          retryQuestion(prompt, conversation.value.length - 1);
        }, 5000);
      } else {
        // Normal response - update the conversation
        questionEntry.answer = response.data.answer;
        modelLoading.value = false;
      }
      
      return questionEntry.answer;
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to get answer';
      
      // Update the conversation with error
      if (conversation.value.length > 0) {
        const lastEntry = conversation.value[conversation.value.length - 1];
        if (lastEntry.question === prompt) {
          lastEntry.answer = `I'm sorry, I couldn't process your request at the moment. Please try again later.`;
          lastEntry.isError = true;
        }
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  const retryQuestion = async (prompt, index) => {
    try {
      const response = await api.post('/api/deepseek/ask', { prompt });
      
      // If still loading, try again later
      if (response.data.isLoading) {
        modelLoading.value = true;
        setTimeout(() => {
          retryQuestion(prompt, index);
        }, 5000);
      } else {
        // Update the conversation with the real answer
        if (index < conversation.value.length) {
          conversation.value[index].answer = response.data.answer;
          conversation.value[index].retried = true;
        }
        modelLoading.value = false;
      }
    } catch (err) {
      console.error('Retry failed:', err);
      // Keep the fallback answer
    }
  };

  const clearConversation = () => {
    conversation.value = [];
    error.value = null;
  };

  return {
    isLoading,
    error,
    conversation,
    modelLoading,
    askQuestion,
    clearConversation
  };
});
