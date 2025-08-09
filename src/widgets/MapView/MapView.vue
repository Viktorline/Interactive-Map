<script setup lang="ts">
import { ref, onMounted, watch, h, render } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Overlay from 'ol/Overlay'
import { useMap } from '@/shared/lib/useMap'
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import { fromLonLat, toLonLat } from 'ol/proj'
import { MOSCOW_COORDINATES } from '@/shared/constants/constants'
import { Popup, UserLocationMarker } from '@/shared/ui'
import { TEXTS } from '@/shared/constants/texts'
import type { Marker } from '@/shared/types/marker'

const mapTarget = ref<HTMLElement | null>(null)
const store = useMarkersStore()
const overlays = ref<{ id: string; overlay: any; state: 'icon' | 'view' | 'edit' }[]>([])

const { map, isLoading, error, focusOnCoordinates, isAddingMarker, setAddingMarkerMode } = useMap(
  mapTarget,
  {
    center: MOSCOW_COORDINATES,
    zoom: 10,
  },
)

function createNewMarker(coordinates: [number, number]) {
  const newMarker: Marker = {
    id: uuidv4(),
    text: 'Новая локация',
    createdAt: new Date().toLocaleString('ru-RU'),
    coordinates: coordinates,
  }

  store.addMarker(newMarker)

  const container = document.createElement('div')
  const popupVNode = h(Popup, {
    state: 'edit',
    marker: newMarker,
    onSave: (text: string) => {
      const marker = store.markers.find((m) => m.id === newMarker.id)
      if (marker) {
        marker.text = text || 'Новая локация'
        const markerIndex = store.markers.findIndex((m) => m.id === marker.id)
        if (markerIndex !== -1) {
          store.markers[markerIndex] = { ...marker }
          localStorage.setItem('map-markers', JSON.stringify(store.markers))
        }
        const iconVNode = h(Popup, {
          state: 'icon',
          marker: marker,
          onClick: () => openPopup(marker.id),
        })
        render(iconVNode, container)
      }
      setAddingMarkerMode(false)
    },
    onClose: () => {
      store.removeMarker(newMarker.id)
      if (map.value) {
        const overlayToRemove = overlays.value.find((o) => o.id === newMarker.id)
        if (overlayToRemove) {
          map.value.removeOverlay(overlayToRemove.overlay)
          overlays.value = overlays.value.filter((o) => o.id !== newMarker.id)
        }
      }
      setAddingMarkerMode(false)
    },
    onDelete: () => {
      store.removeMarker(newMarker.id)
      if (map.value) {
        const overlayToRemove = overlays.value.find((o) => o.id === newMarker.id)
        if (overlayToRemove) {
          map.value.removeOverlay(overlayToRemove.overlay)
          overlays.value = overlays.value.filter((o) => o.id !== newMarker.id)
        }
      }
      setAddingMarkerMode(false)
    },
  })
  render(popupVNode, container)

  const overlay = new Overlay({
    element: container,
    positioning: 'bottom-center',
    stopEvent: true,
  })

  overlay.setPosition(fromLonLat(coordinates))
  map.value!.addOverlay(overlay)
  overlays.value.push({ id: newMarker.id, overlay, state: 'edit' })

  setAddingMarkerMode(false)
}

function closeAllPopups() {
  overlays.value.forEach(({ id, overlay }) => {
    const container = overlay.getElement()
    if (!container) return

    const marker = store.markers.find((m) => m.id === id)
    if (!marker) return

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
    if (!marker) return

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

  if (store.myLocationMarker && map.value) {
    focusOnCoordinates(store.myLocationMarker.coordinates as [number, number], 12)
  }

  if (map.value) {
    map.value.getViewport().addEventListener('click', (e) => {
      const isInsidePopup = (e.target as HTMLElement).closest('.popup')
      if (!isInsidePopup) {
        closeAllPopups()
      }

      if (isAddingMarker.value) {
        const rect = map.value!.getViewport().getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const coordinate = map.value!.getCoordinateFromPixel([x, y])
        if (coordinate) {
          const lonLat = toLonLat(coordinate) as [number, number]
          createNewMarker(lonLat)
        }
      }
    })
  }

  watch(
    () => store.markers,
    async (markers) => {
      if (!map.value) return

      overlays.value.forEach(({ overlay }) => map.value!.removeOverlay(overlay as Overlay))
      overlays.value = []

      markers.forEach((marker) => {
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
      })

      if (store.myLocationMarker) {
        const container = document.createElement('div')
        const markerVNode = h(UserLocationMarker)
        render(markerVNode, container)
        const overlay = new Overlay({
          element: container,
          positioning: 'bottom-center',
          stopEvent: false,
        })

        overlay.setPosition(fromLonLat(store.myLocationMarker.coordinates as [number, number]))
        map.value!.addOverlay(overlay)
        overlays.value.push({ id: 'my-location', overlay, state: 'icon' })
      }
    },
    { immediate: true },
  )

  watch(
    () => store.myLocationMarker,
    async (myLocationMarker) => {
      if (!map.value) return

      overlays.value.forEach(({ id, overlay }) => {
        if (id === 'my-location') {
          map.value!.removeOverlay(overlay)
          overlays.value = overlays.value.filter(({ id: overlayId }) => overlayId !== 'my-location')
        }
      })

      if (myLocationMarker) {
        const container = document.createElement('div')
        const markerVNode = h(UserLocationMarker)
        render(markerVNode, container)
        const overlay = new Overlay({
          element: container,
          positioning: 'bottom-center',
          stopEvent: false,
        })

        overlay.setPosition(fromLonLat(myLocationMarker.coordinates as [number, number]))
        map.value!.addOverlay(overlay)
        overlays.value.push({ id: 'my-location', overlay, state: 'icon' })
      }
    },
    { immediate: true },
  )
})

defineExpose({
  focusOnCoordinates,
  setAddingMarkerMode,
  isAddingMarker,
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
