<template>
  <div class="learning-modules">
    <!-- Simplified Header -->
    <div class="modules-header">
      <h2 class="modules-title">
        <q-icon name="mdi-school" class="q-mr-sm" />
        Lernmodule
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <q-skeleton
        v-for="n in 3"
        :key="n"
        type="QItem"
        class="q-mb-sm"
        height="80px"
      />
    </div>

    <!-- Modules List -->
    <q-list
      v-else
      bordered
      separator
      class="modules-list"
    >
      <q-item
        v-for="subcategory in subcategories"
        :key="subcategory.id"
        clickable
        @click="handleSubcategoryClick(subcategory)"
        :class="getItemClasses(subcategory)"
        class="module-item"
      >
        <!-- Status Icon -->
        <q-item-section avatar class="status-section">
          <div class="status-wrapper">
            <q-icon
              :name="getStatusIcon(subcategory.id)"
              :color="getStatusColor(subcategory.id)"
              size="28px"
              class="status-icon"
            />
            <q-tooltip :delay="500">
              {{ isSubcategoryCompleted(subcategory.id) ? 'Abgeschlossen' : 'Noch offen' }}
            </q-tooltip>
          </div>
        </q-item-section>

        <!-- Content -->
        <q-item-section class="content-section">
          <q-item-label class="module-name">
            {{ subcategory.name }}
          </q-item-label>
          <q-item-label caption class="module-meta">
            <span v-if="isSubcategoryCompleted(subcategory.id)" class="completed-badge">
              <q-icon name="mdi-check" size="xs" />
              Abgeschlossen
            </span>
            <span v-else class="status-text">
              Klicke zum Öffnen
            </span>
          </q-item-label>
        </q-item-section>

        <!-- Expand/Collapse Icon -->
        <q-item-section side class="expand-section">
          <q-icon
            :name="getExpandIcon(subcategory.id)"
            color="accent"
            size="sm"
            class="expand-icon"
          />
        </q-item-section>

        <!-- Ripple Effect -->
        <q-ripple />
      </q-item>
    </q-list>

    <!-- Empty State -->
    <div v-if="!loading && subcategories.length === 0" class="empty-state">
      <q-icon name="mdi-school-outline" size="64px" color="grey-5" />
      <h3 class="text-grey-5 q-mt-md">Keine Module verfügbar</h3>
      <p class="text-grey-6">Lernmodule werden geladen...</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  subcategories: {
    type: Array,
    default: () => []
  },
  activeSubcategoryId: {
    type: Number,
    default: null
  },
  completedSubcategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['subcategory-selected']);

// Methods
const isSubcategoryCompleted = (id) => {
  return props.completedSubcategories.some((sc) => sc.subcategoryId === id);
};

const getStatusIcon = (id) => {
  return isSubcategoryCompleted(id) 
    ? 'mdi-checkbox-marked-circle' 
    : 'mdi-play-circle-outline';
};

const getStatusColor = (id) => {
  return isSubcategoryCompleted(id) ? 'positive' : 'accent';
};

const getExpandIcon = (id) => {
  return props.activeSubcategoryId === id 
    ? 'mdi-chevron-up' 
    : 'mdi-chevron-right';
};

const getItemClasses = (subcategory) => {
  return {
    'module-item--active': props.activeSubcategoryId === subcategory.id,
    'module-item--completed': isSubcategoryCompleted(subcategory.id)
  };
};

const handleSubcategoryClick = (subcategory) => {
  emit('subcategory-selected', subcategory.id);
};
</script>

<style scoped>
.learning-modules {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.modules-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modules-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--q-accent);
  margin: 0;
  display: flex;
  align-items: center;
}

.modules-list {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.module-item {
  min-height: 80px;
  padding: 1rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: rgba(255, 255, 255, 0.02);
}

.module-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(8px);
}

.module-item--active {
  background: rgba(var(--q-accent-rgb), 0.1) !important;
  border-left: 4px solid var(--q-accent);
}

.module-item--completed {
  background: rgba(76, 175, 80, 0.05);
}

.status-section {
  min-width: 60px;
}

.status-wrapper {
  position: relative;
}

.status-icon {
  transition: all 0.3s ease;
}

.module-item:hover .status-icon {
  transform: scale(1.1);
}

.content-section {
  flex: 1;
  padding: 0 1rem;
}

.module-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
}

.module-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.completed-badge {
  background: rgba(76, 175, 80, 0.2);
  color: var(--q-positive);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.status-text {
  color: var(--q-accent);
  font-style: italic;
}

.expand-section {
  min-width: 40px;
}

.expand-icon {
  transition: all 0.3s ease;
}

.module-item--active .expand-icon {
  transform: rotate(90deg);
}

.loading-state {
  padding: 1rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .module-item {
    padding: 0.75rem 1rem;
  }
  
  .module-item:hover {
    transform: translateX(4px);
  }
}

@media (max-width: 480px) {
  .learning-modules {
    padding: 1rem;
  }
  
  .modules-title {
    font-size: 1.25rem;
  }
}
</style>