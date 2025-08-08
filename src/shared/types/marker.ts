export type Coordinates = readonly [number, number]

export interface Marker {
  id: string
  text: string
  createdAt: string
  coordinates: Coordinates
}
