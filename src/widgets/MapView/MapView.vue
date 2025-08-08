<script setup lang="ts">
import { ref } from 'vue'
import { useMap } from '@/shared/lib/useMap'
import { TEXTS } from '@/shared/constants/texts'
import { MOSCOW_COORDINATES } from '@/shared/constants/constants'

const mapTarget = ref<HTMLElement | null>(null)

const { isLoading, error } = useMap(mapTarget, {
  center: MOSCOW_COORDINATES,
  zoom: 10,
})
</script>

<template>
  <div class="map-container">
    <div v-if="isLoading" class="loading">{{ TEXTS.loading }}</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div ref="mapTarget" class="map" :class="{ 'map-loading': isLoading }" />
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  overflow: hidden;
}

.map-loading {
  opacity: 0.5;
}

.loading,
.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 500;
}

.loading {
  background-color: rgba(255, 255, 255, 0.9);
  color: #666;
  border: 1px solid #e0e0e0;
}

.error {
  background-color: #fee;
  color: #c53030;
  border: 1px solid #feb2b2;
}
</style>
