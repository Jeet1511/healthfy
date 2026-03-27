"use client";

import { useEffect, useState } from "react";
import { ResourceWithDistance, ResourceType } from "@/backend/types";

type UseResourcesOptions = {
  type?: ResourceType;
  bloodGroup?: string;
  specialty?: string;
  maxDistanceKm?: number;
};

export function useResources(options: UseResourcesOptions = {}) {
  const [resources, setResources] = useState<ResourceWithDistance[] | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    if (options.type) query.set("type", options.type);
    if (options.bloodGroup) query.set("bloodGroup", options.bloodGroup);
    if (options.specialty) query.set("specialty", options.specialty);
    query.set("maxDistanceKm", String(options.maxDistanceKm ?? 35));

    fetch(`/api/resources?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => setResources(data.resources ?? []));
  }, [options.type, options.bloodGroup, options.specialty, options.maxDistanceKm]);

  return { resources: resources ?? [], loading: resources === null };
}
