export type UrgencyLevel = "Safe" | "Moderate" | "Critical";

export type ResourceType = "Hospital" | "Clinic" | "Doctor" | "Blood Bank";

export interface EmergencyResponse {
  urgency: UrgencyLevel;
  message: string;
  steps: string[];
  actions: string[];
}

export interface HealthcareResource {
  id: string;
  name: string;
  type: ResourceType;
  specialty: "General" | "Cardiology" | "Trauma" | "Pediatrics" | "Orthopedic";
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  bloodGroupsAvailable: string[];
}

export interface ResourceWithDistance extends HealthcareResource {
  distanceKm: number;
}

export type CrisisScenario = "Accident" | "Fire" | "Explosion";

export interface CrisisPlaybook {
  scenario: CrisisScenario;
  actions: string[];
  emergencyContacts: {
    ambulance: string;
    police: string;
    fire: string;
  };
}
