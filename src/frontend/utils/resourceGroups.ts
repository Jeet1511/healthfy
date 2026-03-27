import { ResourceWithDistance } from "@/backend/types";

export function getDoctors(resources: ResourceWithDistance[]) {
  return resources.filter((item) => item.type === "Doctor");
}

export function getHospitals(resources: ResourceWithDistance[]) {
  return resources.filter((item) => item.type === "Hospital" || item.type === "Clinic");
}

export function getBloodResources(resources: ResourceWithDistance[]) {
  return resources.filter((item) => item.type === "Blood Bank" || item.type === "Hospital");
}
