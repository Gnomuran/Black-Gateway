<template>
  <div class="vote-buttons">
    <q-btn
      round
      dense
      flat
      icon="arrow_upward"
      :color="userVote === 1 ? 'primary' : ''"
      @click="handleVote(1)"
      :disable="!authStore.isLoggedIn"
    />

    <span class="q-mx-sm" :class="voteClass">{{ votes }}</span>

    <q-btn
      round
      dense
      flat
      icon="arrow_downward"
      :color="userVote === -1 ? 'negative' : ''"
      @click="handleVote(-1)"
      :disable="!authStore.isLoggedIn"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const props = defineProps({
  votes: {
    type: Number,
    default: 0
  },
  itemId: {
    type: [Number, String],
    required: true
  },
  itemType: {
    type: String,
    required: true,
    validator: (value) => ['thread', 'comment'].includes(value)
  }
});

const emit = defineEmits(['vote']);

const userVote = ref(0);

const voteClass = computed(() => {
  if (props.votes > 0) return 'text-positive';
  if (props.votes < 0) return 'text-negative';
  return '';
});

const handleVote = async (value) => {
  if (!authStore.isLoggedIn) {
    return;
  }

  try {
    const newValue = userVote.value === value ? 0 : value;

    // This would call an API endpoint to handle votes
    // await api.post('/forum/vote', {
    //   item_id: props.itemId,
    //   item_type: props.itemType,
    //   vote: newValue
    // });

    // For now, just emit the event
    emit('vote', {
      itemId: props.itemId,
      itemType: props.itemType,
      vote: newValue
    });

    userVote.value = newValue;
  } catch (error) {
    console.error('Error voting:', error);
  }
};
</script>

<style scoped>
.vote-buttons {
  display: flex;
  align-items: center;
}

.text-positive {
  color: var(--q-positive);
}

.text-negative {
  color: var(--q-negative);
}
</style>