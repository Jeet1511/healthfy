/**
 * THREAT Page — Emergency mode version of Disaster
 * 
 * STANDALONE page. Build emergency disaster/threat UI here.
 * Uses @/ aliases for shared imports. Independent from General pages.
 */
import { useEffect, useMemo, useState } from "react";
import DisasterSelector from "@/components/disaster/DisasterSelector";
import InstructionCards from "@/components/disaster/InstructionCards";
import SafeZonesList from "@/components/disaster/SafeZonesList";
import { disasterData } from "@/data/disasterData";
import { useEmergency } from "@/context/EmergencyContext";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const options = [
  { value: "earthquake", label: "Earthquake" },
  { value: "flood", label: "Flood" },
  { value: "fire", label: "Fire" },
];

export default function ThreatPage() {
  const { setCurrentContext } = useEmergency();
  const [selected, setSelected] = useState("earthquake");
  const info = useMemo(() => disasterData[selected], [selected]);

  useEffect(() => { setCurrentContext("disaster"); }, [setCurrentContext]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.section className="card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", display: "flex", alignItems: "center", gap: "10px" }}>
        <AlertTriangle size={20} color="#DC2626" />
        <span style={{ fontWeight: 700, color: "#DC2626", fontFamily: "var(--font-mono)" }}>◈ THREAT ALERT:</span>
        <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{info.banner}</span>
      </motion.section>

      <div className="grid">
        <DisasterSelector value={selected} onChange={setSelected} options={options} />
        <SafeZonesList zones={info.safeZones} />
      </div>

      <div className="grid single-column">
        <InstructionCards instructions={info.instructions} />
      </div>
    </motion.div>
  );
}
