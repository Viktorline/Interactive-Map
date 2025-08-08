import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Marker } from '@/shared/types/marker'
import { TEXTS } from '../constants/texts'

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

  const hasMarkers = computed(() => markers.value.length > 0)
  const isEmpty = computed(() => markers.value.length === 0)

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

  function loadMarkersFromStorage() {
    const storedMarkers = readMarkersFromStorage()
    setMarkers(storedMarkers)
  }

  return {
    markers: readonly(markers),
    loading: readonly(loading),
    error: readonly(error),

    hasMarkers,
    isEmpty,

    setMarkers,
    addMarker,
    removeMarker,
    setLoading,
    setError,
    loadMarkersFromStorage,
  }
})
