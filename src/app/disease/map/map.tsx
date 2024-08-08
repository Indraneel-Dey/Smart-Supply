"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { HeatmapLayerFactory } from "@vgrid/react-leaflet-heatmap-layer";

import markerIcon from "../../../../public/marker.png";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon.src,
  iconSize: [20, 25],
  iconAnchor: [10, 10],
});

// export function ChangeView({ coords }) {
//   const map = useMap();
//   map.setView(coords, 5);
//   return null;
// }
export function ChangeView() {
  const map = useMap();
  map.setView([31.19288554417288, 71.92537054572638], 5);
  return null;
}

// warehouse = {
//   "name": "KPK-PK",
//   "type": "External Distribution Center",
//   "latitude": 33.885,
//   "longitude": 71.875
// },

export interface warehouse {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

export interface MapProps {
  points: [number, number][];
  warehouses: warehouse[];
}

export default function Map({ points, warehouses }: MapProps) {
  const [geoData, setGeoData] = useState({
    lat: 31.19288554417288,
    lng: 71.92537054572638,
  });

  const center = [geoData.lat, geoData.lng];
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return (
    <MapContainer
      center={[31.19288554417288, 71.92537054572638]}
      zoom={5}
      // scrollWheelZoom={false}
      // dragging={false
      style={{ height: "100%", width: "100%" }}
    >
      <HeatmapLayer
        // fitBoundsOnLoad
        // fitBoundsOnUpdate
        points={points.map((point) => [point[0], point[1], 0.4])}
        longitudeExtractor={(m: any[]) => m[1]}
        latitudeExtractor={(m: any[]) => m[0]}
        intensityExtractor={(m: any) => 1}
        radius={20}
        blur={15}
        minOpacity={0.5}
      />

      <TileLayer
        url={
          prefersDarkMode
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        }
      />
      {/* {geoData.lat && geoData.lng && (
        <Marker position={[geoData.lat, geoData.lng]} />
      )} */}

      {/* add marker for each warehouse  */}
      {warehouses.map((warehouse: warehouse) => (
        <Marker
          key={warehouse.name}
          position={[warehouse.latitude, warehouse.longitude]}
          icon={customMarkerIcon}
        >
          <Tooltip>
            <p className={`${inter.className}`}>
              <b>{warehouse.name}</b>
              <br />
              {warehouse.type}
            </p>
          </Tooltip>
        </Marker>
      ))}

      <ChangeView />
      {/* <ChangeView coords={center} /> */}
    </MapContainer>
  );
}
