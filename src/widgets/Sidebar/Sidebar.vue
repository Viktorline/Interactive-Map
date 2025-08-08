<script setup lang="ts">
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import MarkerItem from './MarkerItem/MarkerItem.vue'
import { Search } from 'lucide-vue-next'

const store = useMarkersStore()
</script>

<template>
  <aside class="sidebar">
    <header class="sidebar-header">
      <input type="text" placeholder="Поиск..." class="search-input" />
      <Search />
    </header>

    <section class="marker-list">
      <MarkerItem v-for="marker in store.markers" :key="marker.id" :marker="marker" />
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  color: black;
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 16px;
  width: 100%;
  height: 100%;
}

.sidebar-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-header {
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
}

.search-icon {
  font-size: 18px;
  color: black;
}

.marker-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;

  max-height: 100%;
  position: relative;
  padding-right: 16px;
}

.marker-list::-webkit-scrollbar {
  width: 2px;
  left: -10px !important;
}

.marker-list::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 4px;
}
</style>
