declare module 'leaflet' {
  export type LatLngExpression = [number, number];

  export interface LeafletMouseEvent {
    latlng: { lat: number; lng: number };
  }

  export interface DragEndEvent {
    target: {
      getLatLng(): { lat: number; lng: number };
    };
  }

  export class Icon {
    constructor(options: IconOptions);
  }

  export interface IconOptions {
    iconUrl: string;
    shadowUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }
}
