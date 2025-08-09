<script setup lang="ts">
import { ref, onMounted, watch, h, render } from 'vue'
import Overlay from 'ol/Overlay'
import { useMap } from '@/shared/lib/useMap'
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import { fromLonLat } from 'ol/proj'
import { MOSCOW_COORDINATES } from '@/shared/constants/constants'
import { Popup, MyLocationMarker } from '@/shared/ui'
import { TEXTS } from '@/shared/constants/texts'
import type { Marker } from '@/shared/types/marker'

const mapTarget = ref<HTMLElement | null>(null)
const store = useMarkersStore()
const overlays = ref<{ id: string; overlay: Overlay; state: 'icon' | 'view' }[]>([])

const { map, isLoading, error, focusOnCoordinates } = useMap(mapTarget, {
  center: MOSCOW_COORDINATES,
  zoom: 10,
})

function closeAllPopups() {
  overlays.value.forEach(({ id, overlay }) => {
    const container = overlay.getElement()
    if (!container) return

    const marker = store.markers.find((m) => m.id === id)
    if (marker && marker.text === TEXTS.myLocation) return

    const popupVNode = h(Popup, {
      state: 'icon',
      marker: marker as Marker,
      onClick: () => openPopup(id),
    })
    render(popupVNode, container)
  })
}

function openPopup(id: string) {
  overlays.value.forEach(({ id: otherId, overlay }) => {
    const container = overlay.getElement()
    if (!container) return

    const marker = store.markers.find((m) => m.id === otherId)
    if (marker && marker.text === TEXTS.myLocation) return

    const state = id === otherId ? 'view' : 'icon'

    const popupVNode = h(Popup, {
      state,
      marker: marker as Marker,
      onClose: closeAllPopups,
      onClick: () => openPopup(otherId),
    })
    render(popupVNode, container)
  })
}

onMounted(async () => {
  await store.loadMarkersFromStorage()

  const myLocationMarker = store.markers.find((m) => m.text === TEXTS.myLocation)
  if (myLocationMarker && map.value) {
    focusOnCoordinates(myLocationMarker.coordinates as [number, number], 12)
  }

  watch(
    () => store.selectedMarker,
    (selectedMarker) => {
      if (selectedMarker && map.value) {
        focusOnCoordinates(selectedMarker.coordinates as [number, number])
      }
    },
  )

  watch(
    () => store.markers,
    async (markers) => {
      if (!map.value) return

      overlays.value.forEach(({ overlay }) => map.value!.removeOverlay(overlay as Overlay))
      overlays.value = []

      markers.forEach((marker) => {
        if (marker.text === TEXTS.myLocation) {
          const container = document.createElement('div')
          const markerVNode = h(MyLocationMarker)
          render(markerVNode, container)
          const overlay = new Overlay({
            element: container,
            positioning: 'bottom-center',
            stopEvent: false,
          })

          overlay.setPosition(fromLonLat(marker.coordinates as [number, number]))
          map.value!.addOverlay(overlay)
          overlays.value.push({ id: marker.id, overlay, state: 'icon' })
        } else {
          const container = document.createElement('div')

          const popupVNode = h(Popup, {
            state: 'icon',
            marker: marker as Marker,
            onClick: () => openPopup(marker.id),
          })
          render(popupVNode, container)

          const overlay = new Overlay({
            element: container,
            positioning: 'bottom-center',
            stopEvent: false,
          })

          overlay.setPosition(fromLonLat(marker.coordinates as [number, number]))
          map.value!.addOverlay(overlay)
          overlays.value.push({ id: marker.id, overlay, state: 'icon' })
        }
      })

      map.value.getViewport().addEventListener('click', (e) => {
        const isInsidePopup = (e.target as HTMLElement).closest('.popup')
        if (!isInsidePopup) {
          closeAllPopups()
        }
      })
    },
    { immediate: true },
  )
})

defineExpose({
  focusOnCoordinates,
})
</script>

<template>
  <div class="map-container">
    <div v-if="isLoading" class="loading">{{ TEXTS.loading }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
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
