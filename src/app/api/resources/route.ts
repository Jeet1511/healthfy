import { NextResponse } from "next/server";
import { MOCK_RESOURCES } from "@/backend/data/mockData";
import { distanceInKm } from "@/backend/lib/location";
import { ResourceType } from "@/backend/types";

const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.209,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const latitude = Number(searchParams.get("latitude") ?? DEFAULT_LOCATION.latitude);
  const longitude = Number(
    searchParams.get("longitude") ?? DEFAULT_LOCATION.longitude,
  );
  const maxDistanceKm = Number(searchParams.get("maxDistanceKm") ?? 20);
  const type = searchParams.get("type") as ResourceType | null;
  const specialty = searchParams.get("specialty");
  const bloodGroup = searchParams.get("bloodGroup");

  const enriched = MOCK_RESOURCES.map((item) => ({
    ...item,
    distanceKm: distanceInKm(latitude, longitude, item.latitude, item.longitude),
  }));

  const filtered = enriched
    .filter((item) => item.distanceKm <= maxDistanceKm)
    .filter((item) => (type ? item.type === type : true))
    .filter((item) => (specialty ? item.specialty === specialty : true))
    .filter((item) =>
      bloodGroup ? item.bloodGroupsAvailable.includes(bloodGroup) : true,
    )
    .sort((first, second) => first.distanceKm - second.distanceKm);

  return NextResponse.json({
    resources: filtered,
    center: { latitude, longitude },
    count: filtered.length,
  });
}
