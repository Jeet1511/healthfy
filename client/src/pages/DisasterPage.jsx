import { useEffect, useMemo, useState } from "react";
import DisasterSelector from "../components/disaster/DisasterSelector";
import InstructionCards from "../components/disaster/InstructionCards";
import SafeZonesList from "../components/disaster/SafeZonesList";
import { disasterData } from "../data/disasterData";
import { useEmergency } from "../context/EmergencyContext";

const options = [
  { value: "earthquake", label: "Earthquake" },
  { value: "flood", label: "Flood" },
  { value: "fire", label: "Fire" },
];

export default function DisasterPage() {
  const { setCurrentContext } = useEmergency();
  const [selected, setSelected] = useState("earthquake");
  const info = useMemo(() => disasterData[selected], [selected]);

  useEffect(() => {
    setCurrentContext("disaster");
  }, [setCurrentContext]);

  return (
    <>
      <section className="alert-banner">
        <strong>Disaster Alert:</strong> {info.banner}
      </section>

      <div className="grid">
        <DisasterSelector value={selected} onChange={setSelected} options={options} />
        <SafeZonesList zones={info.safeZones} />
      </div>

      <div className="grid single-column">
        <InstructionCards instructions={info.instructions} />
      </div>
    </>
  );
}
