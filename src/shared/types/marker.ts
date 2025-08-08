export type Coordinates = readonly [number, number]

export interface Marker {
  id: string
  text: string
  createdAt: string
  coordinates: Coordinates
}

export type PopupState = 'icon' | 'view' | 'edit' // не здесь должно быть
