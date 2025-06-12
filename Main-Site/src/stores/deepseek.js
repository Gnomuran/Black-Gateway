import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../boot/axios'; // Ensure this path is correct for your project structure

export const useDeepseekStore = defineStore('deepseek', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const conversations = ref([]); // Store an array of conversations for navigation
  const currentConversationId = ref(null); // Keep track of the active conversation
  const messages = ref([]); // Messages for the current active conversation
  const modelLoading = ref(false); // Indicates if the AI model is actively processing

  // Function to load a specific conversation
  const loadConversation = async (conversationId) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/api/conversations/${conversationId}`);
      currentConversationId.value = response.data.conversation.id;
      messages.value = response.data.messages;
      // You might also want to update the conversation title if it's dynamic
    } catch (err) {
      console.error('Error loading conversation:', err);
      error.value = err.response?.data?.error || 'Failed to load conversation';
    } finally {
      isLoading.value = false;
    }
  };

  // Function to create a new conversation
  const createNewConversation = async (title = 'New Chat') => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/api/conversations', { title });
      const newConversation = response.data.conversation;
      conversations.value.unshift(newConversation); // Add to the top of the list
      currentConversationId.value = newConversation.id;
      messages.value = []; // Clear messages for the new conversation
      return newConversation;
    } catch (err) {
      console.error('Error creating new conversation:', err);
      error.value = err.response?.data?.error || 'Failed to create new conversation';
    } finally {
      isLoading.value = false;
    }
  };

  // Function to fetch all conversations
  const fetchConversations = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/api/conversations');
      conversations.value = response.data.conversations;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      error.value = err.response?.data?.error || 'Failed to fetch conversations';
    } finally {
      isLoading.value = false;
    }
  };

  // Function to update conversation title
  const updateConversationTitle = async (conversationId, newTitle) => {
    try {
      await api.put(`/api/conversations/${conversationId}`, { title: newTitle });
      // Update the title in the conversations array
      const convIndex = conversations.value.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        conversations.value[convIndex].title = newTitle;
      }
    } catch (err) {
      console.error('Error updating conversation title:', err);
      error.value = err.response?.data?.error || 'Failed to update conversation title';
      throw err;
    }
  };

  // Function to delete a conversation
  const deleteConversation = async (conversationId) => {
    try {
      await api.delete(`/api/conversations/${conversationId}`);
      conversations.value = conversations.value.filter(c => c.id !== conversationId);
      if (currentConversationId.value === conversationId) {
        currentConversationId.value = null;
        messages.value = [];
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      error.value = err.response?.data?.error || 'Failed to delete conversation';
      throw err;
    }
  };


  const askQuestion = async (prompt) => {
    isLoading.value = true;
    error.value = null;

    try {
      // If no conversation is active, create a new one
      if (!currentConversationId.value) {
        await createNewConversation(); // This will set currentConversationId and clear messages
      }

      // Add user message to local state immediately
      messages.value.push({
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      });

      // Show a temporary "thinking" message for the assistant
      const thinkingMessage = {
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        isThinking: true, // Custom flag
      };
      messages.value.push(thinkingMessage);

      // Try to get answer from AI
      const response = await api.post('/api/chat', { // Changed endpoint to /api/chat
        message: prompt,
        conversationId: currentConversationId.value,
        context: {}, // You can add more context here if needed
      });

      // Find and update the "thinking" message
      const thinkingMessageIndex = messages.value.findIndex(msg => msg.isThinking);
      if (thinkingMessageIndex !== -1) {
        messages.value[thinkingMessageIndex].content = response.data.response;
        messages.value[thinkingMessageIndex].isThinking = false;
        messages.value[thinkingMessageIndex].metadata = response.data.metadata;
        messages.value[thinkingMessageIndex].responseTime = response.data.responseTime;
        messages.value[thinkingMessageIndex].model = response.data.context.model;
        messages.value[thinkingMessageIndex].source = response.data.metadata.source;
      } else {
        // Fallback in case "thinking" message wasn't found (shouldn't happen with immediate push)
        messages.value.push({
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          metadata: response.data.metadata,
          responseTime: response.data.responseTime,
          model: response.data.context.model,
          source: response.data.metadata.source,
        });
      }

      modelLoading.value = false;
      return response.data.response;

    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to get answer';

      // Update the last message with an error
      if (messages.value.length > 0) {
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage.isThinking) {
          lastMessage.content = `I'm sorry, I couldn't process your request at the moment. Please try again later. Error: ${error.value}`;
          lastMessage.isError = true;
          lastMessage.isThinking = false;
        } else {
          // If the last message wasn't thinking, just add an error message
          messages.value.push({
            role: 'assistant',
            content: `I'm sorry, I couldn't process your request at the moment. Please try again later. Error: ${error.value}`,
            timestamp: new Date().toISOString(),
            isError: true,
          });
        }
      }
      console.error('Error in askQuestion:', err);
      throw err; // Re-throw to propagate the error if needed
    } finally {
      isLoading.value = false;
    }
  };

  // The retry logic within the client-side store might be overly complex given the backend's immediate fallback.
  // The backend already provides a fallback response if the DeepSeek API fails or is loading.
  // Therefore, a client-side retry for `isLoading` is likely not necessary if the backend handles it.
  // The `askQuestion` function directly gets the final answer (either AI or fallback).
  // If the backend *truly* means "model is still loading, try again later" for a non-error response,
  // then a simplified retry could be:
  /*
  const retryQuestion = async (prompt, conversationId, messageIndex) => {
    if (messageIndex >= messages.value.length) return; // Guard against out of bounds

    modelLoading.value = true;
    try {
      const response = await api.post('/api/chat', { prompt, conversationId }); // Re-send request
      if (response.data.isLoading) { // If backend explicitly says it's still loading
        setTimeout(() => retryQuestion(prompt, conversationId, messageIndex), 5000);
      } else {
        messages.value[messageIndex].content = response.data.response;
        messages.value[messageIndex].retried = true;
        messages.value[messageIndex].metadata = response.data.metadata;
        messages.value[messageIndex].responseTime = response.data.responseTime;
        messages.value[messageIndex].model = response.data.context.model;
        messages.value[messageIndex].source = response.data.metadata.source;
        modelLoading.value = false;
      }
    } catch (err) {
      console.error('Retry failed:', err);
      // If retry fails, update the message with an error or keep current state
    }
  };
  */

  const clearCurrentConversation = () => {
    messages.value = [];
    currentConversationId.value = null;
    error.value = null;
  };

  return {
    isLoading,
    error,
    conversations, // List of conversations
    currentConversationId,
    messages, // Messages for the active conversation
    modelLoading,
    askQuestion,
    clearCurrentConversation,
    loadConversation,
    createNewConversation,
    fetchConversations,
    updateConversationTitle,
    deleteConversation,
  };
});