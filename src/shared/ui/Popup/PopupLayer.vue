<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import Popup from './Popup.vue'
import type { Marker } from '@/shared/types/marker'
import type Map from 'ol/Map'

const props = defineProps<{
  map: Map
}>()

const store = useMarkersStore()

const popupStyles: Record<string, { left: string; top: string }> = reactive({})

function updatePositions() {
  for (const marker of store.markers) {
    const [lon, lat] = marker.coordinates
    const pixel = props.map.getPixelFromCoordinate([lon, lat])

    if (!pixel) continue

    popupStyles[marker.id] = {
      left: `${pixel[0]}px`,
      top: `${pixel[1]}px`,
    }
  }
}

onMounted(() => {
  updatePositions()
  props.map.on('moveend', updatePositions)
  props.map.on('postrender', updatePositions)
})

onBeforeUnmount(() => {
  props.map.un('moveend', updatePositions)
  props.map.un('postrender', updatePositions)
})
</script>

<template>
  <div class="popup-layer">
    <Popup
      v-for="marker in store.markers"
      :key="marker.id"
      :marker="marker"
      state="icon"
      :style="{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        ...popupStyles[marker.id],
      }"
    />
  </div>
</template>

<style scoped>
.popup-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: 500;
}
</style>
