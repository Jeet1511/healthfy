export const disasterData = {
  earthquake: {
    title: "Earthquake",
    banner: "Structural risk detected — avoid unstable zones.",
    instructions: [
      "Drop, cover, and hold under sturdy furniture.",
      "Move away from glass and exterior walls.",
      "After shaking stops, evacuate using stairs.",
    ],
    safeZones: ["City Hall Open Ground", "Sector 12 Stadium", "Community Shelter A"],
  },
  flood: {
    title: "Flood",
    banner: "Water level risk high — move to elevated safe zones.",
    instructions: [
      "Avoid walking or driving through flood water.",
      "Shut off electricity if safe to do so.",
      "Relocate to designated high-ground shelter.",
    ],
    safeZones: ["North Elevated Shelter", "Metro Bridge Camp", "Hill View School"],
  },
  fire: {
    title: "Fire",
    banner: "Fire threat active — evacuate immediately.",
    instructions: [
      "Use stairs, do not use elevators.",
      "Stay low to avoid smoke inhalation.",
      "Assemble at nearest safe point and call emergency services.",
    ],
    safeZones: ["Open Parking Zone B", "District Relief Camp", "Sports Complex Ground"],
  },
};
