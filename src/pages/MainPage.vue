<script setup lang="ts">
import MapView from '@/widgets/MapView/MapView.vue'
import Sidebar from '@/widgets/Sidebar/Sidebar.vue'
import { onMounted, ref } from 'vue'
import { TEXTS } from '@/shared/constants/texts'
import { useMarkersStore } from '@/shared/stores/useMarkersStore'

const markersStore = useMarkersStore()
const mapViewRef = ref<InstanceType<typeof MapView> | null>(null)

onMounted(() => {
  markersStore.setLoading(true)
  try {
    markersStore.loadMarkersFromStorage()
    markersStore.setError(null)
  } catch (err) {
    markersStore.setError(TEXTS.errorLoadingMarkers)
  } finally {
    markersStore.setLoading(false)
  }
})
</script>

<template>
  <div class="wrapper">
    <div class="sidebar ellipsis">
      <Sidebar
        :focus-on-coordinates="mapViewRef?.focusOnCoordinates"
        :set-adding-marker-mode="mapViewRef?.setAddingMarkerMode"
        :is-adding-marker="mapViewRef?.isAddingMarker"
      />
    </div>
    <div class="mapContainer">
      <MapView ref="mapViewRef" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 10px;
}

.sidebar {
  flex: 3;
}

.mapContainer {
  flex: 7;
}
</style>
