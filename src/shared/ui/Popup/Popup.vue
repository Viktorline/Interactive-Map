<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { MapPin, Clock, X } from 'lucide-vue-next'
import type { Marker } from '@/shared/types/marker'

defineProps<{
  state: 'icon' | 'view' | 'edit'
  marker: Marker
}>()

const emit = defineEmits(['close', 'save', 'click', 'delete'])
</script>

<template>
  <Transition name="popup-fade">
    <div class="popup" @click.stop="emit('click')">
      <template v-if="state === 'icon'">
        <div class="icon-wrapper" @mouseenter.stop @mouseleave.stop>
          <MapPin class="icon" />
        </div>
      </template>

      <template v-else-if="state === 'view'">
        <div class="card">
          <div class="text">{{ marker.text }}</div>

          <div class="id"><strong>ID:</strong> {{ marker.id }}</div>

          <div class="created">
            <Clock class="clock-icon" />
            {{ new Date(marker.createdAt).toLocaleDateString() }}
          </div>

          <button class="close-btn" @click.stop="emit('close')">
            <X class="close-icon" />
          </button>
        </div>
      </template>

      <template v-else>
        <div class="edit-form">
          <input v-model="marker.text" placeholder="Введите название локации" class="edit-input" />
          <div class="edit-buttons">
            <button @click="emit('save', marker.text)" class="save-btn" title="Сохранить">
              💾
            </button>
            <button @click="emit('delete')" class="delete-btn" title="Удалить">🗑️</button>
            <button @click="emit('close')" class="cancel-btn" title="Отменить">✖</button>
          </div>
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.3s ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.popup-fade-enter-to,
.popup-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.popup {
  user-select: none;
  pointer-events: auto;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;
}

.icon-wrapper:hover .icon {
  transform: scale(1.2);
}

.icon {
  width: 24px;
  height: 24px;
  color: #28a745;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card {
  background: #ecfdf5;
  border: 1px solid #d1d5db;
  padding: 16px;
  border-radius: 10px;
  min-width: 200px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 15px;
  line-height: 1.4;
  user-select: none; /* Предотвращаем выделение текста */
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: 600;
}

.id {
  font-size: 14px;
  margin-bottom: 4px;
  color: #4b5563;
}

.text {
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2937;
}

.created {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.clock-icon {
  width: 16px;
  height: 16px;
  stroke-width: 1.5;
}

.close-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  border: none;
  background: none;
  font-size: 12px;
  cursor: pointer;
  color: #9ca3af;
}

.edit-form {
  background: white;
  border: 1px solid #d1d5db;
  padding: 12px;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  user-select: none; /* Предотвращаем выделение текста в popup */
}

.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  user-select: text; /* Разрешаем выделение текста в инпуте */
}

.edit-buttons {
  display: flex;
  gap: 4px;
  justify-content: space-between;
}

.save-btn,
.delete-btn,
.cancel-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>
