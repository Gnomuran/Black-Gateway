import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useForumStore = defineStore('forum', () => {
  // LocalStorage implementation
  const loadFromStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // State (will be replaced with DB calls later)
  const threads = ref(loadFromStorage('forum-threads') || []);
  const posts = ref(loadFromStorage('forum-posts') || []);

  // Getters
  const threadPosts = computed((threadId) => {
    return posts.value.filter(post => post.threadId === threadId);
  });

  // Actions
  const createThread = () => {
    const newThread = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    threads.value.push(newThread);
    saveToStorage('forum-threads', threads.value);
    return newThread.id;
  };

  const createPost = ({ threadId, content, isAnonymous = true, media }) => {
    const newPost = {
      id: Date.now().toString(),
      threadId,
      content,
      isAnonymous,
      anonId: isAnonymous ? `Anon_${Math.random().toString(36).slice(2,8)}` : null,
      mediaUrl: media ? URL.createObjectURL(media) : null,
      createdAt: new Date().toISOString()
    };
    
    posts.value.push(newPost);
    saveToStorage('forum-posts', posts.value);
    return newPost;
  };

  // PostgreSQL-ready interface
  const api = {
    async fetchThreads() {
      // Will be replaced with: return axios.get('/api/threads');
      return threads.value;
    },
    
    async fetchPosts(threadId) {
      // Will be replaced with: return axios.get(`/api/threads/${threadId}/posts`);
      return threadPosts(threadId);
    }
  };

  return { threads, posts, createThread, createPost, api };
});