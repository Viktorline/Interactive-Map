import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Marker } from '@/shared/types/marker'
import { TEXTS } from '../constants/texts'
import { useGeolocation } from '../lib/useGeolocation'

const STORAGE_KEY = 'map-markers'

function readMarkersFromStorage(): Marker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsedMarkers: Marker[] = JSON.parse(raw)
    return parsedMarkers
  } catch {
    return []
  }
}

function writeMarkersToStorage(markers: Marker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers))
  } catch {
    console.error(TEXTS.errorWritingToStorage)
  }
}

export const useMarkersStore = defineStore('markers', () => {
  const markers = ref<Marker[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setMarkers(newMarkers: Marker[]) {
    markers.value = newMarkers
  }

  function addMarker(marker: Marker) {
    markers.value.push(marker)
    writeMarkersToStorage(markers.value)
  }

  function removeMarker(id: string) {
    markers.value = markers.value.filter((m) => m.id !== id)
    writeMarkersToStorage(markers.value)
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  async function loadMarkersFromStorage() {
    const savedMarkers = readMarkersFromStorage()
    const hasMyLocationMarker = savedMarkers.some((m) => m.text === TEXTS.myLocation)

    if (hasMyLocationMarker) {
      setMarkers(savedMarkers)
    } else {
      try {
        const { getCurrentPosition, createMyLocationMarker } = useGeolocation()
        const coordinates = await getCurrentPosition()
        const myLocationMarker = createMyLocationMarker(coordinates)
        setMarkers([myLocationMarker])
        writeMarkersToStorage([myLocationMarker])
      } catch (err) {
        setMarkers([])
        writeMarkersToStorage([])
      }
    }
  }

  return {
    markers,

    loading,
    error,

    setMarkers,
    addMarker,
    removeMarker,
    setLoading,
    setError,
    loadMarkersFromStorage,
  }
})
