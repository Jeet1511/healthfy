/**
 * SCAN Page — Emergency mode version of Map
 * 
 * STANDALONE page. Build tactical map UI here.
 * Uses @/ aliases for shared imports. Independent from General pages.
 */
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/apiClient";
import MapBoard from "@/components/map/MapBoard";
import ResourceFilters from "@/components/map/ResourceFilters";
import ResourceListSync from "@/components/map/ResourceListSync";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Navigation, Crosshair } from "lucide-react";

export default function ScanPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const initialSearch = searchParams.get("search") || "";
  const { track, session } = useAuth();
  const [type, setType] = useState(initialType);
  const [search, setSearch] = useState(initialSearch);
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [hoveredId, setHoveredId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("type", type);
      if (search.trim()) query.set("search", search.trim());
      try {
        const response = await apiClient.get(`/resources?${query.toString()}`);
        setResources(response.data.data || []);
        setSelectedId("");
      } catch { setResources([]); }
      finally { setLoading(false); }
    };
    fetchResources().catch(() => setResources([]));
  }, [type, search]);

  const selected = useMemo(() => resources.find((i) => i.id === selectedId) || null, [resources, selectedId]);
  const activeMarkerId = hoveredId || selectedId;

  return (
    <>
      <section className="hero card" style={{ border: "1px solid rgba(220,38,38,0.2)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220,38,38,0.015) 2px, rgba(220,38,38,0.015) 4px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
            <Crosshair size={24} color="#DC2626" />
            <h2 className="title" style={{ fontSize: "1.6rem", fontFamily: "var(--font-mono)" }}>TACTICAL SCAN</h2>
          </div>
          <p className="subtle" style={{ fontFamily: "var(--font-mono)" }}>Locate active response units. Real-time tactical overlay.</p>
        </div>
      </section>
      <div className="grid single-column">
        <ResourceFilters type={type} search={search} onTypeChange={setType} onSearchChange={setSearch} />
      </div>
      <div className="map-layout">
        <MapBoard resources={resources} selectedId={activeMarkerId} onSelect={setSelectedId} />
        <ResourceListSync resources={resources} selectedId={selectedId} onSelect={setSelectedId} onHover={setHoveredId} loading={loading} />
      </div>
      <AnimatePresence>
        {selected ? (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="card" style={{ marginTop: "1.5rem", borderLeft: "4px solid rgba(220,38,38,0.6)" }}>
            <h3 className="title" style={{ margin: 0, fontFamily: "var(--font-mono)" }}>{selected.name}</h3>
            <p className="subtle">{selected.address} — {selected.distanceKm} km</p>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <a className="btn-danger" href={`tel:${selected.phone}`} style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Phone size={16} /> Call</a>
              <a className="action-pill" href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Navigation size={16} /> Navigate</a>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
