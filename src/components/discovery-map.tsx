"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { projectListing, LocationType } from "@/types/types";

// 🚫 Leaflet never runs on server
const LeafletMapClient = dynamic(() => import("./LeafletMapClient"), {
  ssr: false,
});

export default function DiscoveryMap({
  allFilteredData,
}: {
  allFilteredData: any;
}) {
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );
  const [selectedProperty, setSelectedProperty] =
    useState<projectListing | null>(null);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedLocation) {
      setSelectedProperty(null);
      return;
    }

    const found = allFilteredData.projects.find(
      (p: projectListing) => p.name === selectedLocation.name,
    );

    setSelectedProperty(found || null);
  }, [selectedLocation, allFilteredData.projects]);

  return (
    <section
      ref={sectionRef}
      className="flex h-full flex-col gap-4"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="relative size-full overflow-hidden">
        <LeafletMapClient
          projects={allFilteredData.projects}
          selectedProperty={selectedProperty}
          selectedLocation={selectedLocation}
          onMarkerClick={(project) =>
            setSelectedLocation({
              lat: project.latitude,
              lon: project.longitude,
              name: project.name,
              distance: 0,
              duration: 0,
            })
          }
          onMapClick={() => setSelectedLocation(null)}
        />
      </div>
    </section>
  );
}
