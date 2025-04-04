<script setup>
import { ref } from 'vue';
import { useForumStore } from '../stores/forum';

const forum = useForumStore();
const content = ref('');
const mediaFile = ref(null);
const isAnonymous = ref(true);

const handleFileChange = (e) => {
  mediaFile.value = e.target.files[0];
};

const submitPost = async () => {
  if (!content.value.trim()) return;
  
  await forum.createPost({
    threadId: props.threadId || forum.createThread(),
    content: content.value,
    isAnonymous: isAnonymous.value,
    media: mediaFile.value
  });
  
  content.value = '';
  mediaFile.value = null;
};
</script>

<template>
  <div class="post-editor">
    <textarea v-model="content" placeholder="What's on your mind?"></textarea>
    
    <div class="controls">
      <label>
        <input type="checkbox" v-model="isAnonymous"> Post Anonymously
      </label>
      
      <input 
        type="file" 
        accept="image/*,video/*" 
        @change="handleFileChange"
      >
      
      <button @click="submitPost">Post</button>
    </div>
    
    <div v-if="mediaFile" class="media-preview">
      {{ mediaFile.name }} ({{ (mediaFile.size / 1024).toFixed(1) }}KB)
    </div>
  </div>
</template>

<style scoped>
.post-editor {
  border: 1px solid #ddd;
  padding: 1rem;
}
textarea {
  width: 100%;
  min-height: 100px;
}
.media-preview {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}
</style>