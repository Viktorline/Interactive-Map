export type Coordinates = [number, number]

export interface Marker {
  id: string
  text: string
  createdAt: string
  coordinates: Coordinates
}
