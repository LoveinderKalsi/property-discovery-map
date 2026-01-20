import DiscoveryMap from "@/components/discovery-map";
import { PropertyListing } from "@/data/property-listing";
import Link from "next/link";

export const metadata = {
  title: "Property Discovery",
  description: "Explore properties on map and list",
};

type Project = (typeof PropertyListing.projects)[number];

const PAGE_SIZE = 8;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // ✅ IMPORTANT: await searchParams
  const resolvedSearchParams = await searchParams;

  const page = Math.max(Number(resolvedSearchParams.page) || 1, 1);

  const allProjects: Project[] = PropertyListing.projects;

  const totalItems = allProjects.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const paginatedProjects = allProjects.slice(start, end);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* LEFT: LIST */}
      <div className="w-[420px] border-r overflow-y-auto p-4">
        <h1 className="text-lg font-semibold mb-4">
          Properties ({totalItems})
        </h1>

        <div className="space-y-4">
          {paginatedProjects.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border p-3 hover:shadow transition"
            >
              <img
                src={p.image}
                alt={p.alt}
                className="h-32 w-full object-cover rounded"
              />

              <h3 className="mt-2 font-medium">{p.name}</h3>

              <p className="text-sm text-gray-500">
                {p.micromarket}, {p.city}
              </p>

              <p className="text-sm mt-1">
                ₹{p.minPrice.toLocaleString()} – ₹{p.maxPrice.toLocaleString()}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {p.typologies.join(", ")} • {p.type}
              </p>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href={{ pathname: "/", query: { page: page - 1 } }}
            className={`px-3 py-1 border rounded ${
              page === 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Prev
          </Link>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Link
            href={{ pathname: "/", query: { page: page + 1 } }}
            className={`px-3 py-1 border rounded ${
              page === totalPages ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Next
          </Link>
        </div>
      </div>

      {/* RIGHT: MAP */}
      <div className="flex-1">
        <DiscoveryMap
          allFilteredData={{
            ...PropertyListing,
            projects: paginatedProjects, // ✅ map shows current page only
          }}
        />
      </div>
    </div>
  );
}
