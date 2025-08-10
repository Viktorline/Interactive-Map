/**
 * Composable для работы с геолокацией пользователя
 * Возвращает функции для получения текущего местоположения
 * Добавляет маркер отображения местоположения пользователя на карте
 * Имеет обработку ошибок геолокации (отказ в разрешении, недоступность, таймаут)
 */
import { ref } from 'vue'
import type { Marker } from '@/shared/types/marker'
import { TEXTS } from '../constants/texts'

export function useGeolocation() {
  const isSupported = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCurrentPosition = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      isLoading.value = true
      error.value = null
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          isLoading.value = false
          resolve([longitude, latitude])
        },
        (err) => {
          isLoading.value = false
          let errorMessage = TEXTS.failedToGetLocation

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = TEXTS.geolocationPermissionDenied
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = TEXTS.geolocationUnavailable
              break
            case err.TIMEOUT:
              errorMessage = TEXTS.geolocationTimeout
              break
          }

          error.value = errorMessage
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  const createMyLocationMarker = (coordinates: [number, number]): Marker => {
    const now = new Date().toLocaleString('ru-RU')
    return {
      id: 'my-location',
      text: TEXTS.myLocation,
      createdAt: now,
      coordinates: coordinates,
    }
  }

  return {
    isSupported,
    isLoading,
    error,
    getCurrentPosition,
    createMyLocationMarker,
  }
}
