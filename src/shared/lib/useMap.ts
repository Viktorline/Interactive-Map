/**
 * Composable для инициализации и управления самой картой
 * Создает карту с базовым слоем OpenStreetMap и настраивает её параметры
 * Предоставляет функции для фокусировки на координатах и управления режимом добавления маркеров
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import type { MapOptions } from '@/shared/types/map'
import { MOSCOW_COORDINATES } from '../constants/constants'
import { TEXTS } from '../constants/texts'

export function useMap(target: Ref<HTMLElement | null>, options: MapOptions = {}) {
  const map = ref<Map | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isAddingMarker = ref(false)

  const defaultCenter = fromLonLat(MOSCOW_COORDINATES)
  const defaultZoom = 10

  const initializeMap = () => {
    try {
      if (!target.value) {
        error.value = TEXTS.elementNotFound
        return
      }

      map.value = new Map({
        target: target.value,
        layers: [
          new TileLayer({
            source: new OSM({
              attributions: TEXTS.openStreetMapAttribution,
            }),
          }),
        ],
        view: new View({
          center: options.center ? fromLonLat(options.center) : defaultCenter,
          zoom: options.zoom ?? defaultZoom,
          minZoom: 2,
          maxZoom: 19,
        }),
        controls: [],
      })

      if (map.value.getViewport()) {
        map.value.getViewport().style.cursor = 'default'
      }

      isLoading.value = false
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : TEXTS.errorInitializing
      isLoading.value = false
    }
  }

  const destroyMap = () => {
    map.value?.setTarget(undefined)
    map.value = null
  }

  const focusOnCoordinates = (coordinates: [number, number], zoom: number = 12) => {
    if (map.value) {
      const view = map.value.getView()
      view.animate({
        center: fromLonLat(coordinates),
        zoom: zoom,
        duration: 1000,
      })
    }
  }

  const setAddingMarkerMode = (enabled: boolean) => {
    isAddingMarker.value = enabled
    if (map.value && map.value.getViewport()) {
      map.value.getViewport().style.cursor = enabled ? 'crosshair' : 'default'
    }
  }

  onMounted(() => {
    initializeMap()
  })

  onUnmounted(() => {
    destroyMap()
  })

  return {
    map,
    isLoading,
    error,
    isAddingMarker,
    focusOnCoordinates,
    initializeMap,
    destroyMap,
    setAddingMarkerMode,
  }
}
