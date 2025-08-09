<script setup lang="ts">
import type { Marker } from '@/shared/types/marker'
import { Trash, LocateFixed, MapPinned } from 'lucide-vue-next'

defineProps<{
  marker: Marker
}>()
const emit = defineEmits<{
  (e: 'focus', id: string): void
  (e: 'remove', id: string): void
}>()
</script>

<template>
  <div class="marker">
    <div class="marker-main-info ellipsis">
      <div class="marker-icon">
        <MapPinned />
      </div>
      <div class="marker-name-date ellipsis">
        <strong class="ellipsis">{{ marker.text }}</strong>
        <span class="date">{{ marker.createdAt }}</span>
      </div>
    </div>

    <div class="marker-actions">
      <button @click="emit('focus', marker.id)" aria-label="Показать на карте">
        <LocateFixed />
      </button>
      <button @click="emit('remove', marker.id)" aria-label="Удалить">
        <Trash />
      </button>
    </div>
  </div>
</template>

<style scoped>
.marker {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #deddddc8;
  gap: 10px;
}

.marker-main-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.marker-name-date {
  display: flex;
  flex-direction: column;
}

.marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  min-height: 50px;
  border-radius: 50%;
  padding: 10px;
  background-color: #d3ebd3;
}

.date {
  font-size: 12px;
  color: #aaa;
}

.marker-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
}

.marker-actions button {
  margin-left: 8px;
  background: none;
  border: none;
  color: #cbcbcb;
  transition: color 0.3s ease;
  cursor: pointer;
}

.marker-actions button:hover {
  color: #656565;
}
</style>
