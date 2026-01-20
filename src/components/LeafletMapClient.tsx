"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  LayersControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, JSX } from "react";
import { renderToString } from "react-dom/server";

import Link from "next/link";
import Image from "next/image";

import { Badge } from "./badge";
import {
  cn,
  formatDate,
  formatPrice,
  concatenateTypologies,
  para,
} from "@/utils/helpers";

import { LocationIcon } from "@/assets/location-icon";
import { BudgetIcon } from "@/assets/budget-icon";
import { HouseIcon } from "@/assets/house-icon";
import { CalendarIcon } from "@/assets/utility";
import { PropscoreRating } from "@/assets/PropsochRating";

interface Location {
  lat: number;
  lon: number;
  name: string;
}

interface Props {
  projects: any[];
  selectedProperty: any;
  selectedLocation: Location | null;
  onMarkerClick: (project: any) => void;
  onMapClick: () => void;
}

/* ---------- ICON HELPERS ---------- */

const renderIcon = (
  icon: JSX.Element,
  label: string,
  transform = "translate(-50%, -100%)",
) =>
  `<div style="transform:${transform}" aria-label="${label}">
    ${renderToString(icon)}
  </div>`;

const labelIcon = (label: string, active: boolean) =>
  L.divIcon({
    className: "marker-label",
    html: renderIcon(
      <Badge variant="white">{label}</Badge>,
      label,
      active ? "translate(-50%, -120%)" : "translate(-50%, -100%)",
    ),
  });

const dotIcon = (active: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:${active ? 14 : 10}px;
      height:${active ? 14 : 10}px;
      border-radius:50%;
      background:#111;
      border:2px solid white;
    "></div>`,
  });

/* ---------- MAP HELPERS ---------- */

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick });
  return null;
}

function MapController({
  selectedLocation,
}: {
  selectedLocation: Location | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.panTo([selectedLocation.lat, selectedLocation.lon], {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();

  useEffect(() => {
    onZoom(map.getZoom());
    map.on("zoomend", () => onZoom(map.getZoom()));
  }, [map, onZoom]);

  return null;
}

/* ---------- MAIN MAP ---------- */

export default function LeafletMapClient({
  projects,
  selectedProperty,
  selectedLocation,
  onMarkerClick,
  onMapClick,
}: Props) {
  const zoomRef = useRef(12);

  return (
    <MapContainer
      center={[12.97, 77.59]}
      zoom={12}
      className="size-full rounded-lg border"
    >
      <ZoomWatcher onZoom={(z) => (zoomRef.current = z)} />
      <MapClickHandler onClick={onMapClick} />
      <MapController selectedLocation={selectedLocation} />

      <LayersControl position="bottomleft">
        <LayersControl.BaseLayer checked name="Street">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
      </LayersControl>

      {projects.map((project) => {
        const markerRef = useRef<L.Marker | null>(null);
        const isActive = selectedProperty?.id === project.id;

        useEffect(() => {
          if (isActive && markerRef.current) {
            markerRef.current.openPopup();
          }
        }, [isActive]);

        return (
          <Marker
            key={project.id}
            ref={markerRef}
            position={[project.latitude, project.longitude]}
            icon={
              zoomRef.current >= 14
                ? labelIcon(project.name, isActive)
                : dotIcon(isActive)
            }
            eventHandlers={{
              click: () => onMarkerClick(project),
            }}
          >
            {isActive && (
              <Popup minWidth={400} closeButton autoClose={false}>
                <Link
                  href={`/property-for-sale-in/${project.city.toLowerCase()}/${project.slug.toLowerCase()}/${project.id}`}
                  target="_blank"
                >
                  <div className="flex flex-col gap-3">
                    <Image
                      src={project.image}
                      alt={project.alt}
                      width={500}
                      height={300}
                      className="rounded-lg object-cover"
                    />

                    <h3 className={cn(para({ size: "lg" }), "font-semibold")}>
                      {project.name}
                    </h3>

                    <div className="flex justify-between text-sm">
                      <span className="flex gap-2">
                        <LocationIcon width={16} /> {project.micromarket}
                      </span>
                      <PropscoreRating rating={project.propscore} width={100} />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="flex gap-2">
                        <BudgetIcon width={16} />
                        {formatPrice(project.minPrice, false)} –{" "}
                        {formatPrice(project.maxPrice, false)}
                      </span>
                      <span className="flex gap-2">
                        <CalendarIcon width={16} />
                        {formatDate(project.possessionDate)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="flex gap-2">
                        <HouseIcon width={16} />
                        {concatenateTypologies(project.typologies)}
                      </span>
                      <span>
                        {project.minSaleableArea} – {project.maxSaleableArea}{" "}
                        sqft
                      </span>
                    </div>
                  </div>
                </Link>
              </Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
