// src/stores/forum.js
import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/forum'  // Fixed: Using your working URL
})

export const useForumStore = defineStore('forum', {
  state: () => ({
    topics: [],
    currentTopic: null,
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      postsPerPage: 20
    },
    sortBy: 'newest', // newest, oldest, popular
    searchQuery: '',
    gifs: {
      results: [],
      trending: [],
      loading: false
    }
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    getTopicById: (state) => (id) => state.topics.find(topic => topic.id === id),
    getPostById: (state) => (id) => state.posts.find(post => post.id === id),
    filteredPosts: (state) => {
      if (!state.searchQuery) return state.posts
      
      return state.posts.filter(post =>
        post.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        post.author_name.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    },
    postsByTopic: (state) => (topicId) => {
      return state.posts.filter(post => post.topic_id === topicId)
    }
  },

  actions: {
    // Error handling
    handleError(error) {
      console.error('Forum store error:', error)
      this.error = error.response?.data?.error || error.message || 'An unexpected error occurred'
      this.loading = false
    },

    clearError() {
      this.error = null
    },

    // Topics
    async fetchTopics() {
      try {
        this.loading = true
        this.clearError()
        
        const response = await api.get('/topics')
        this.topics = response.data
        
        this.loading = false
      } catch (error) {
        this.handleError(error)
      }
    },

    setCurrentTopic(topic) {
      this.currentTopic = topic
    },

    // Posts
    async fetchPostsByTopic(topicId, options = {}) {
      try {
        this.loading = true
        this.clearError()
        
        const params = {
          page: options.page || this.pagination.currentPage,
          limit: options.limit || this.pagination.postsPerPage,
          sort: options.sort || this.sortBy
        }
        
        const response = await api.get(`/topics/${topicId}/posts`, { params })
        
        if (options.append) {
          this.posts = [...this.posts, ...response.data]
        } else {
          this.posts = response.data
        }
        
        // Update pagination info (you might need to get this from response headers)
        this.pagination.currentPage = params.page
        
        this.loading = false
      } catch (error) {
        this.handleError(error)
      }
    },

    async fetchPost(postId) {
      try {
        this.loading = true
        this.clearError()
        
        const response = await api.get(`/posts/${postId}`)
        
        // Ensure replies array exists and is properly formatted
        if (response.data.replies && Array.isArray(response.data.replies)) {
          response.data.replies = response.data.replies.map(reply => ({
            ...reply,
            likes_count: reply.likes_count || 0
          }))
        } else {
          response.data.replies = []
        }
        
        this.currentPost = response.data
        
        this.loading = false
        return response.data
      } catch (error) {
        this.handleError(error)
        return null
      }
    },

    async createPost(postData) {
      try {
        this.loading = true
        this.clearError()
        
        const formData = new FormData()
        
        // Add required fields - ensure topic_id is a number
        if (postData.topic_id) {
          const topicId = typeof postData.topic_id === 'object' ? postData.topic_id.value : postData.topic_id
          formData.append('topic_id', parseInt(topicId))
          console.log('Topic ID being sent:', parseInt(topicId))
        }
        if (postData.title) formData.append('title', postData.title)
        if (postData.content) formData.append('content', postData.content)
        if (postData.post_type) formData.append('post_type', postData.post_type)
        
        // Add media file if present
        if (postData.media) {
          formData.append('media', postData.media)
        }
        
        console.log('Sending post data:', {
          topic_id: parseInt(typeof postData.topic_id === 'object' ? postData.topic_id.value : postData.topic_id),
          title: postData.title,
          content: postData.content,
          post_type: postData.post_type,
          hasMedia: !!postData.media
        })
        
        const response = await api.post('/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        console.log('Post created successfully:', response.data)
        
        // Add the new post to the beginning of the posts array
        this.posts.unshift(response.data)
        
        this.loading = false
        return response.data
      } catch (error) {
        console.error('Create post error:', error.response?.data || error.message)
        this.handleError(error)
        return null
      }
    },

    async updatePost(postId, postData) {
      try {
        this.loading = true
        this.clearError()
        
        const formData = new FormData()
        Object.keys(postData).forEach(key => {
          if (postData[key] !== null && postData[key] !== undefined) {
            formData.append(key, postData[key])
          }
        })
        
        const response = await api.put(`/posts/${postId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // Update the post in the posts array
        const index = this.posts.findIndex(post => post.id === postId)
        if (index !== -1) {
          this.posts[index] = response.data
        }
        
        // Update current post if it's the same
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost = response.data
        }
        
        this.loading = false
        return response.data
      } catch (error) {
        this.handleError(error)
        return null
      }
    },

    async deletePost(postId) {
      try {
        this.loading = true
        this.clearError()
        
        await api.delete(`/posts/${postId}`)
        
        // Remove post from posts array
        this.posts = this.posts.filter(post => post.id !== postId)
        
        // Clear current post if it's the deleted one
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost = null
        }
        
        this.loading = false
        return true
      } catch (error) {
        this.handleError(error)
        return false
      }
    },

    async likePost(postId, action = 'like') {
      try {
        const response = await api.post(`/posts/${postId}/like`, { action })
        
        // Update likes count in posts array
        const post = this.posts.find(p => p.id === postId)
        if (post) {
          post.likes_count = response.data.likes_count
        }
        
        // Update current post if it's the same
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost.likes_count = response.data.likes_count
        }
        
        return response.data.likes_count
      } catch (error) {
        this.handleError(error)
        return null
      }
    },

    // Replies
    async createReply(postId, replyData) {
      try {
        this.loading = true
        this.clearError()
        
        console.log('Creating reply for post:', postId, 'with data:', replyData)
        
        const response = await api.post(`/posts/${postId}/replies`, replyData)
        
        console.log('Reply created successfully:', response.data)
        
        // Add reply to current post if it's loaded
        if (this.currentPost && this.currentPost.id === parseInt(postId)) {
          if (!this.currentPost.replies) {
            this.currentPost.replies = []
          }
          // Add new reply to the list
          this.currentPost.replies.push(response.data)
          
          // Update replies count from response if available
          if (response.data.post_replies_count !== undefined) {
            this.currentPost.replies_count = response.data.post_replies_count
          }
        }
        
        // Update replies count in posts array
        const post = this.posts.find(p => p.id === parseInt(postId))
        if (post) {
          if (response.data.post_replies_count !== undefined) {
            post.replies_count = response.data.post_replies_count
          } else {
            post.replies_count = (post.replies_count || 0) + 1
          }
        }
        
        this.loading = false
        return response.data
      } catch (error) {
        console.error('Create reply error:', error.response?.data || error.message)
        this.handleError(error)
        return null
      }
    },

    async updateReply(replyId, content) {
      try {
        this.loading = true
        this.clearError()
        
        const response = await api.put(`/replies/${replyId}`, { content })
        
        // Update reply in current post if it exists
        if (this.currentPost && this.currentPost.replies) {
          const replyIndex = this.currentPost.replies.findIndex(r => r.id === replyId)
          if (replyIndex !== -1) {
            this.currentPost.replies[replyIndex] = response.data
          }
        }
        
        this.loading = false
        return response.data
      } catch (error) {
        this.handleError(error)
        return null
      }
    },

    async deleteReply(replyId) {
      try {
        this.loading = true
        this.clearError()
        
        await api.delete(`/replies/${replyId}`)
        
        // Remove reply from current post if it exists
        if (this.currentPost && this.currentPost.replies) {
          this.currentPost.replies = this.currentPost.replies.filter(r => r.id !== replyId)
        }
        
        this.loading = false
        return true
      } catch (error) {
        this.handleError(error)
        return false
      }
    },

    // Reply likes functionality
    async likeReply(replyId, action = 'like') {
      try {
        const response = await api.post(`/replies/${replyId}/like`, { action })
        
        // Update likes count in current post replies if loaded
        if (this.currentPost && this.currentPost.replies) {
          const reply = this.currentPost.replies.find(r => r.id === replyId)
          if (reply) {
            reply.likes_count = response.data.likes_count
          }
        }
        
        return response.data.likes_count
      } catch (error) {
        this.handleError(error)
        return null
      }
    },

    // GIFs
    async searchGifs(query, limit = 20) {
      try {
        this.gifs.loading = true
        
        const response = await api.get('/gifs/search', {
          params: { q: query, limit }
        })
        
        this.gifs.results = response.data.results || []
        this.gifs.loading = false
        
        return this.gifs.results
      } catch (error) {
        console.error('Error searching GIFs:', error)
        this.gifs.loading = false
        return []
      }
    },

    async fetchTrendingGifs(limit = 20) {
      try {
        this.gifs.loading = true
        
        const response = await api.get('/gifs/trending', {
          params: { limit }
        })
        
        this.gifs.trending = response.data.results || []
        this.gifs.loading = false
        
        return this.gifs.trending
      } catch (error) {
        console.error('Error fetching trending GIFs:', error)
        this.gifs.loading = false
        return []
      }
    },

    // Utility actions
    setSortBy(sortBy) {
      this.sortBy = sortBy
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    clearPosts() {
      this.posts = []
      this.currentPost = null
    },

    resetPagination() {
      this.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        postsPerPage: 20
      }
    },

    // Method to refresh current post data
    async refreshCurrentPost() {
      if (this.currentPost && this.currentPost.id) {
        return await this.fetchPost(this.currentPost.id)
      }
      return null
    }
  }
})
