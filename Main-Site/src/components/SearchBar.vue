<template>
    <q-input
      v-model="searchQuery"
      outlined
      placeholder="Search threads..."
      @keyup.enter="performSearch"
    >
      <template v-slot:append>
        <q-icon name="search" @click="performSearch" />
      </template>
    </q-input>
    
    <q-dialog v-model="showResults">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">Search Results</div>
        </q-card-section>
        
        <q-card-section>
          <q-list bordered separator>
            <q-item 
              v-for="result in searchResults" 
              :key="result.id"
              clickable
              v-ripple
              @click="goToThread(result.id)"
            >
              <q-item-section>
                <q-item-label>{{ result.title }}</q-item-label>
                <q-item-label caption>
                  Posted in {{ result.board_name }} by {{ result.username }} • 
                  {{ formatDate(result.created_at) }} • 
                  {{ result.comment_count }} comments
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { api } from 'boot/axios';
  import { useRouter } from 'vue-router';
  import { format } from 'date-fns';
  
  const router = useRouter();
  const searchQuery = ref('');
  const searchResults = ref([]);
  const showResults = ref(false);
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const performSearch = async () => {
    if (!searchQuery.value.trim()) return;
    
    try {
      const response = await api.get('/forum/search', {
        params: { q: searchQuery.value }
      });
      
      searchResults.value = response.data;
      showResults.value = true;
    } catch (error) {
      console.error('Search error:', error);
    }
  };
  
  const goToThread = (threadId) => {
    showResults.value = false;
    router.push({ name: 'thread', params: { threadId } });
  };
  </script>