import type { Map as OLMap } from 'ol'

export interface MapInstance {
  map: OLMap | null
}

export interface MapOptions {
  center?: [number, number]
  zoom?: number
}

export type OverlayState = 'icon' | 'view' | 'edit'
