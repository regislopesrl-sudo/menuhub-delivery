'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import L, { LatLngExpression, LeafletMouseEvent, DragEndEvent } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import React from 'react';

const AnyMapContainer = MapContainer as unknown as React.ComponentType<any>;
const AnyMarker = Marker as unknown as React.ComponentType<any>;
const AnyTileLayer = TileLayer as unknown as React.ComponentType<any>;

type LeafletMapPickerProps = {
  latitude?: number | string;
  longitude?: number | string;
  onPick: (lat: number, lng: number) => void;
};

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function MapPicker({ latitude, longitude, onPick }: LeafletMapPickerProps) {
  const initialLat = Number(latitude ?? -24.3203);
  const initialLng = Number(longitude ?? -46.9981);

  const initialPosition: LatLngExpression = [initialLat, initialLng];
  const [position, setPosition] = useState<LatLngExpression>(initialPosition);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setPosition([Number(latitude), Number(longitude)]);
    }
  }, [latitude, longitude]);

  const draggableHandlers = useMemo(
    () => ({
      dragend(event: DragEndEvent) {
        const marker = event.target;
        const latlng = marker.getLatLng();
        const newPosition: LatLngExpression = [latlng.lat, latlng.lng];
        setPosition(newPosition);
        onPick(latlng.lat, latlng.lng);
      },
    }),
    [onPick],
  );

  return (
    <div className="space-y-3">
      <div className="h-[320px] rounded-2xl overflow-hidden border border-slate-300">
        <AnyMapContainer center={position} zoom={16} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <AnyTileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AnyMarker position={position} draggable eventHandlers={draggableHandlers} icon={markerIcon} />
          <ClickHandler
            onPick={(lat, lng) => {
              setPosition([lat, lng]);
              onPick(lat, lng);
            }}
          />
        </AnyMapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          readOnly
          value={position[0]}
          placeholder="Latitude"
          className="rounded-xl border border-slate-300 px-4 py-3 bg-slate-50"
        />
        <input
          readOnly
          value={position[1]}
          placeholder="Longitude"
          className="rounded-xl border border-slate-300 px-4 py-3 bg-slate-50"
        />
      </div>
    </div>
  );
}
