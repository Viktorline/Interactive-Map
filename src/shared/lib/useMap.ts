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

      isLoading.value = false
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : TEXTS.errorInitializing
      isLoading.value = false
    }
  }

  const destroyMap = () => {
    if (map.value) {
      map.value.setTarget(undefined)
      map.value = null
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
    initializeMap,
    destroyMap,
  }
}
