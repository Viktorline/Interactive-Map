import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Marker } from '@/shared/types/marker'
import { TEXTS } from '../constants/texts'

const STORAGE_KEY = 'map-markers'

// function readMarkersFromStorage(): Marker[] {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY)
//     if (!raw) return []
//     const parsedMarkers: Marker[] = JSON.parse(raw)
//     return parsedMarkers
//   } catch {
//     return []
//   }
// }

function generateTestMarkers(): Marker[] {
  const now = new Date().toLocaleString('ru-RU')

  const cities = [
    { name: 'Москва', coords: [37.6176, 55.7558] },
    { name: 'Санкт-Петербург', coords: [30.3141, 59.9386] },
    { name: 'Новосибирск', coords: [82.9204, 55.0302] },
    { name: 'Екатеринбург', coords: [60.6122, 56.8389] },
    { name: 'Казань', coords: [49.1064, 55.7963] },
    { name: 'Нижний Новгород', coords: [44.002, 56.3287] },
    { name: 'Челябинск', coords: [61.4026, 55.1599] },
    { name: 'Самара', coords: [50.15, 53.2] },
    { name: 'Ростов-на-Дону', coords: [39.7015, 47.2357] },
    { name: 'Уфа', coords: [56.0409, 54.7388] },
    { name: 'Челябинск', coords: [61.4026, 55.1599] },
    { name: 'Самара', coords: [50.15, 53.2] },
    { name: 'Ростов-на-Дону', coords: [39.7015, 47.2357] },
    { name: 'Уфа', coords: [56.0409, 54.7388] },
    { name: 'Челябинск', coords: [61.4026, 55.1599] },
    { name: 'Самара', coords: [50.15, 53.2] },
    { name: 'Ростов-на-Дону', coords: [39.7015, 47.2357] },
    { name: 'Уфа', coords: [56.0409, 54.7388] },
  ]

  return cities.map((city, index) => ({
    id: `test-${index}`,
    text: city.name,
    createdAt: now,
    coordinates: city.coords as [number, number],
  }))
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
    const testMarkers = generateTestMarkers()
    setMarkers(testMarkers)
    writeMarkersToStorage(testMarkers)
  }

  return {
    markers,
    loading,
    error,

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
