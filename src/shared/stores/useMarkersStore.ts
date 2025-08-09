import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Marker } from '@/shared/types/marker'
import { TEXTS } from '../constants/texts'
import { useGeolocation } from '../lib/useGeolocation'
import { STORAGE_KEY, MY_LOCATION_STORAGE_KEY } from '../constants/constants'

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

function readMyLocationFromStorage(): Marker | null {
  try {
    const raw = localStorage.getItem(MY_LOCATION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeMyLocationToStorage(marker: Marker | null): void {
  try {
    if (marker) {
      localStorage.setItem(MY_LOCATION_STORAGE_KEY, JSON.stringify(marker))
    } else {
      localStorage.removeItem(MY_LOCATION_STORAGE_KEY)
    }
  } catch {
    console.error(TEXTS.errorWritingToStorage)
  }
}

export const useMarkersStore = defineStore('markers', () => {
  const markers = ref<Marker[]>([])
  const originalMarkers = ref<Marker[]>([])
  const myLocationMarker = ref<Marker | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setMarkers(newMarkers: Marker[]) {
    markers.value = newMarkers
    originalMarkers.value = [...newMarkers]
  }

  function addMarker(marker: Marker) {
    markers.value.push(marker)
    originalMarkers.value.push(marker)
    writeMarkersToStorage(markers.value)
  }

  function removeMarker(id: string) {
    markers.value = markers.value.filter((m) => m.id !== id)
    originalMarkers.value = originalMarkers.value.filter((m) => m.id !== id)
    writeMarkersToStorage(markers.value)
  }

  function setMyLocationMarker(marker: Marker | null) {
    myLocationMarker.value = marker
    writeMyLocationToStorage(marker)
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  function searchMarkers(query: string) {
    if (!query.trim()) {
      markers.value = [...originalMarkers.value]
    } else {
      const filteredMarkers = originalMarkers.value.filter((marker) =>
        marker.text.toLowerCase().includes(query.toLowerCase()),
      )
      markers.value = filteredMarkers
    }
  }

  function clearSearch() {
    markers.value = [...originalMarkers.value]
  }

  async function loadMarkersFromStorage() {
    const savedMarkers = readMarkersFromStorage()
    setMarkers(savedMarkers)

    const savedMyLocation = readMyLocationFromStorage()
    if (savedMyLocation) {
      setMyLocationMarker(savedMyLocation)
    } else {
      try {
        const { getCurrentPosition, createMyLocationMarker } = useGeolocation()
        const coordinates = await getCurrentPosition()
        const newMyLocationMarker = createMyLocationMarker(coordinates)
        setMyLocationMarker(newMyLocationMarker)
      } catch (err) {
        setMyLocationMarker(null)
      }
    }
  }

  return {
    markers,
    myLocationMarker,
    loading,
    error,

    setMarkers,
    addMarker,
    removeMarker,
    setMyLocationMarker,
    setLoading,
    setError,
    searchMarkers,
    clearSearch,
    loadMarkersFromStorage,
  }
})
