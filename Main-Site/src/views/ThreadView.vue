<script setup>
import { ref, onMounted } from 'vue';
import { useForumStore } from '../stores/forum';
import PostEditor from '../components/PostEditor.vue';

const props = defineProps(['threadId']);
const forum = useForumStore();
const posts = ref([]);

onMounted(async () => {
  posts.value = await forum.api.fetchPosts(props.threadId);
});
</script>

<template>
  <div class="thread-view">
    <h2>Thread #{{ threadId }}</h2>
    
    <PostEditor :threadId="threadId" />
    
    <div class="posts">
      <div v-for="post in posts" :key="post.id" class="post">
        <div class="meta">
          <span class="anon-id">{{ post.anonId }}</span>
          <span class="date">{{ new Date(post.createdAt).toLocaleString() }}</span>
        </div>
        
        <div class="content">{{ post.content }}</div>
        
        <div v-if="post.mediaUrl" class="media">
          <img v-if="post.mediaUrl.match(/\.(jpe?g|png|gif)$/i)" :src="post.mediaUrl">
          <video v-else-if="post.mediaUrl.match(/\.(mp4|webm)$/i)" controls :src="post.mediaUrl"></video>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #eee;
}
.meta {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.anon-id {
  font-weight: bold;
  margin-right: 1rem;
}
.media img, .media video {
  max-width: 100%;
  max-height: 300px;
}
</style>