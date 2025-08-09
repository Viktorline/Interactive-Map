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
    <div class="sidebar">
      <Sidebar :focus-on-coordinates="mapViewRef?.focusOnCoordinates" />
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mapContainer {
  flex: 7;
}

h2 {
  margin: 0;
  color: #333;
}
</style>
