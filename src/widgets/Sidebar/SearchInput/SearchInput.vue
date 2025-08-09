<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import { TEXTS } from '@/shared/constants/texts'

const store = useMarkersStore()
const searchQuery = ref('')

watch(searchQuery, (newQuery) => {
  store.searchMarkers(newQuery)
})

const clearSearch = () => {
  searchQuery.value = ''
  store.clearSearch()
}
</script>

<template>
  <div class="search-container">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="TEXTS.searchPlaceholder"
      class="search-input"
    />
    <button v-if="searchQuery" @click="clearSearch" class="clear-btn" :title="'Очистить поиск'">
      <X class="clear-icon" />
    </button>
    <Search v-else class="search-icon" />
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-right: 16px;
}

.search-input {
  flex: 1;
  background: #ffffff;
  border: 1px solid #000000;
  padding: 8px;
  color: black;
  border-radius: 10px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-icon,
.clear-icon {
  font-size: 18px;
  color: black;
  flex-shrink: 0;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background-color: #f0f0f0;
}

.clear-btn:active {
  background-color: #e0e0e0;
}
</style>
