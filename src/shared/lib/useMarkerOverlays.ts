/**
 * Composable для управления оверлеями маркеров на карте
 * Отвечает за создание, отображение и управление состоянием всплывающих окон маркеров
 * Поддерживает три состояния: icon (иконка), view (просмотр), edit (редактирование)
 * Обрабатывает клики по карте для создания новых маркеров и управляет их жизненным циклом
 *
 * По хорошему бы разбить на три отдельных слоя:
 * - useMarkerRendering: рендеринг маркеров и их состояний (icon, view, edit)
 * - useMarkerEvents: обработка событий маркеров (клики, сохранение, удаление)
 * - useMarkerLifecycle: управление жизненным циклом маркеров (создание, обновление, удаление)
 */
import { ref, h, render, watch, onBeforeUnmount, type Ref } from 'vue'
import Overlay from 'ol/Overlay'
import { fromLonLat, toLonLat } from 'ol/proj'
import type Map from 'ol/Map'
import { v4 as uuidv4 } from 'uuid'
import { Popup, UserLocationMarker } from '@/shared/ui'
import type { Marker } from '@/shared/types/marker'
import type { OverlayState } from '@/shared/types/map'
import type { useMarkersStore } from '@/shared/stores/useMarkersStore'
import { TEXTS } from '../constants/texts'

interface Params {
  map: Ref<Map | null>
  store: ReturnType<typeof useMarkersStore>
  isAddingMarker: Ref<boolean>
  setAddingMarkerMode: (v: boolean) => void
  focusOnCoordinates: (coords: [number, number], zoom?: number) => void
}

export function useMarkerOverlays({ map, store, isAddingMarker, setAddingMarkerMode }: Params) {
  const overlays = ref<{ id: string; overlay: Overlay; state: OverlayState }[]>([])
  let removeMapClick: (() => void) | null = null

  function renderIcon(container: HTMLElement, marker: Marker) {
    const vnode = h(Popup, {
      state: 'icon',
      marker,
      onClick: () => openPopup(marker.id),
    })
    render(vnode, container)
  }

  function renderView(container: HTMLElement, marker: Marker) {
    const vnode = h(Popup, {
      state: 'view',
      marker,
      onClose: closeAllPopups,
      onClick: () => openPopup(marker.id),
    })
    render(vnode, container)
  }

  function renderEdit(container: HTMLElement, marker: Marker) {
    const vnode = h(Popup, {
      state: 'edit',
      marker,
      onSave: (text: string) => handleSave(marker.id, text),
      onClose: () => handleClose(marker.id),
      onDelete: () => handleDelete(marker.id),
    })
    render(vnode, container)
  }

  function addOverlayAt(
    coordsLonLat: [number, number],
    container: HTMLElement,
    id: string,
    state: OverlayState,
  ) {
    const overlay = new Overlay({
      element: container,
      positioning: 'bottom-center',
      stopEvent: state !== 'icon',
    })
    overlay.setPosition(fromLonLat(coordsLonLat))
    map.value!.addOverlay(overlay)
    overlays.value.push({ id, overlay, state })
  }

  function handleSave(id: string, text: string) {
    const marker = store.markers.find((m) => m.id === id)
    if (!marker) return
    marker.text = text || 'Новая локация'
    const idx = store.markers.findIndex((m) => m.id === id)
    if (idx !== -1) {
      store.markers[idx] = { ...marker }
      localStorage.setItem('map-markers', JSON.stringify(store.markers))
    }
    const rec = overlays.value.find((o) => o.id === id)
    if (!rec) return
    const container = rec.overlay.getElement() as HTMLElement
    renderIcon(container, marker)
    rec.state = 'icon'
    setAddingMarkerMode(false)
  }

  function handleClose(id: string) {
    const marker = store.markers.find((m) => m.id === id)
    if (!marker) return
    const rec = overlays.value.find((o) => o.id === id)
    if (!rec) return
    const container = rec.overlay.getElement() as HTMLElement
    renderIcon(container, marker)
    rec.state = 'icon'
    setAddingMarkerMode(false)
  }

  function handleDelete(id: string) {
    store.removeMarker(id)
    if (map.value) {
      const rec = overlays.value.find((o) => o.id === id)
      if (rec) {
        map.value.removeOverlay(rec.overlay as Overlay)
        overlays.value = overlays.value.filter((o) => o.id !== id)
      }
    }
    setAddingMarkerMode(false)
  }

  function createNewMarker(coordinates: [number, number]) {
    const newMarker: Marker = {
      id: uuidv4(),
      text: TEXTS.newLocation,
      createdAt: new Date().toLocaleString('ru-RU'),
      coordinates,
    }

    store.addMarker(newMarker)

    const container = document.createElement('div')
    renderEdit(container, newMarker)
    addOverlayAt(coordinates, container, newMarker.id, 'edit')
    setAddingMarkerMode(false)
  }

  function closeAllPopups() {
    overlays.value.forEach(({ id, overlay }) => {
      const container = overlay.getElement() as HTMLElement | null
      if (!container) return
      const marker = store.markers.find((m) => m.id === id)
      if (!marker) return
      renderIcon(container, marker)
    })
  }

  function openPopup(id: string) {
    overlays.value.forEach(({ id: otherId, overlay }) => {
      const container = overlay.getElement() as HTMLElement | null
      if (!container) return
      const marker = store.markers.find((m) => m.id === otherId)
      if (!marker) return
      if (id === otherId) {
        renderView(container, marker)
      } else {
        renderIcon(container, marker)
      }
    })
  }

  function bindMapClick() {
    if (!map.value) return

    const viewport = map.value.getViewport()
    const handler = (e: MouseEvent) => {
      const isInsidePopup = (e.target as HTMLElement).closest('.popup')
      if (!isInsidePopup) closeAllPopups()
      if (!isAddingMarker.value) return
      const rect = viewport.getBoundingClientRect()
      const coordinate = map.value!.getCoordinateFromPixel([
        e.clientX - rect.left,
        e.clientY - rect.top,
      ])
      if (coordinate) {
        createNewMarker(toLonLat(coordinate) as [number, number])
      }
    }
    viewport.addEventListener('click', handler)
    removeMapClick = () => viewport.removeEventListener('click', handler)
  }

  function rebuildOverlaysFromStore() {
    if (!map.value) return
    overlays.value.forEach(({ overlay }) => map.value!.removeOverlay(overlay as Overlay))
    overlays.value = []

    store.markers.forEach((marker) => {
      const container = document.createElement('div')
      renderIcon(container, marker as Marker)
      addOverlayAt(marker.coordinates as [number, number], container, marker.id, 'icon')
    })

    if (store.myLocationMarker) {
      const container = document.createElement('div')
      const markerVNode = h(UserLocationMarker)
      render(markerVNode, container)
      addOverlayAt(
        store.myLocationMarker.coordinates as [number, number],
        container,
        'my-location',
        'icon',
      )
    }
  }

  function onMyLocationChange() {
    if (!map.value) return
    overlays.value.forEach(({ id, overlay }) => {
      if (id === 'my-location') {
        map.value!.removeOverlay(overlay as Overlay)
      }
    })
    overlays.value = overlays.value.filter(({ id }) => id !== 'my-location')

    if (store.myLocationMarker) {
      const container = document.createElement('div')
      const markerVNode = h(UserLocationMarker)
      render(markerVNode, container)
      addOverlayAt(
        store.myLocationMarker.coordinates as [number, number],
        container,
        'my-location',
        'icon',
      )
    }
  }

  function mount() {
    watch(() => store.markers, rebuildOverlaysFromStore, { immediate: true })
    watch(() => store.myLocationMarker, onMyLocationChange, { immediate: true })
    bindMapClick()
  }

  function cleanup() {
    if (removeMapClick) {
      removeMapClick()
      removeMapClick = null
    }
    map.value?.getOverlays().clear()
    overlays.value = []
  }

  onBeforeUnmount(cleanup)

  return {
    overlays,
    createNewMarker,
    closeAllPopups,
    openPopup,
    mount,
    cleanup,
  }
}
