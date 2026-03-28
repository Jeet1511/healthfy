import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/apiClient";
import MapBoard from "../components/map/MapBoard";
import ResourceFilters from "../components/map/ResourceFilters";
import ResourceListSync from "../components/map/ResourceListSync";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Navigation, HeartPulse, BookmarkPlus } from "lucide-react";
import BookingModal from "../components/BookingModal";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const initialSearch = searchParams.get("search") || "";
  const { track, savePlace, addBooking, session } = useAuth();
  const [type, setType] = useState(initialType);
  const [search, setSearch] = useState(initialSearch);
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [hoveredId, setHoveredId] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("type", type);
      if (search.trim()) query.set("search", search.trim());

      try {
        const response = await apiClient.get(`/resources?${query.toString()}`);
        const list = response.data.data || [];
        setResources(list);
        setSelectedId("");
        if (search.trim() || type !== "all") {
          await track("search", { query: search || "Map filter", type }).catch(() => undefined);
        }
      } catch (err) {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources().catch(() => setResources([]));
  }, [type, search]);

  const selected = useMemo(() => resources.find((item) => item.id === selectedId) || null, [resources, selectedId]);
  const canBook = useMemo(() => selected && ["doctor", "clinic", "hospital"].includes(selected.type), [selected]);
  const isGuest = session.mode !== "user";
  
  // Highlight map marker if hovered OR selected
  const activeMarkerId = hoveredId || selectedId;

  const handleSavePlace = async () => {
    if (!selected || isGuest) return;
    await savePlace(selected);
  };

  const handleConfirmBooking = async (booking) => {
    if (isGuest) return;
    await addBooking(booking);
    setBookingOpen(false);
  };

  return (
    <>
      <section className="hero card interactive" style={{ background: "linear-gradient(135deg, rgba(8,11,20,0.9), rgba(16, 50, 100, 0.4))" }}>
        <h2 className="title">Resource Explorer</h2>
        <p className="subtle">Locate live services. Hover lists to highlight on map, or tap markers to expand details.</p>
      </section>

      <div className="grid single-column">
        <ResourceFilters
          type={type}
          search={search}
          onTypeChange={setType}
          onSearchChange={setSearch}
        />
      </div>

      <div className="map-layout">
        <MapBoard 
           resources={resources} 
           selectedId={activeMarkerId} 
           onSelect={setSelectedId} 
        />
        <ResourceListSync 
           resources={resources} 
           selectedId={selectedId} 
           onSelect={setSelectedId}
           onHover={setHoveredId}
           loading={loading}
        />
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card interactive" 
            style={{ marginTop: "1.5rem", borderLeft: "4px solid rgba(59, 130, 246, 0.8)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}
          >
            <div>
              <h3 className="title" style={{ margin: 0 }}>{selected.name}</h3>
              <p className="subtle" style={{ margin: "4px 0" }}>{selected.address}</p>
              <div style={{ display: "inline-flex", gap: "10px", marginTop: "8px" }}>
                 <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", fontSize: "0.85rem" }}>Distance: <strong>{selected.distanceKm} km</strong></span>
                 <span style={{ padding: "4px 10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderRadius: "99px", fontSize: "0.85rem", textTransform: "uppercase" }}>{selected.type}</span>
              </div>
            </div>
            <div className="action-buttons">
              <a className="action-pill btn-primary" href={`tel:${selected.phone}`} style={{ padding: "0.8rem 1.5rem", display: "inline-flex", gap: "8px", alignItems: "center" }}>
                <Phone size={18} /> Call Direct
              </a>
              <a
                className="action-pill"
                href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "0.8rem 1.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                <Navigation size={18} /> Navigate
              </a>
              <button
                type="button"
                className="action-pill"
                onClick={() => handleSavePlace().catch(() => undefined)}
                disabled={isGuest}
                style={{ padding: "0.8rem 1.5rem", display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                <BookmarkPlus size={18} /> Save place
              </button>
              {canBook ? (
                <button
                  type="button"
                  className="action-pill btn-primary"
                  disabled={isGuest}
                  onClick={() => setBookingOpen(true)}
                  style={{ padding: "0.8rem 1.5rem", display: "inline-flex", gap: "8px", alignItems: "center" }}
                >
                  <HeartPulse size={18} /> Book appointment
                </button>
              ) : null}
            </div>
            {isGuest ? <p className="subtle" style={{ width: "100%", margin: 0 }}>Sign in to save places and bookings.</p> : null}
          </motion.section>
        ) : null}
      </AnimatePresence>

      <BookingModal
        open={bookingOpen}
        provider={selected}
        onClose={() => setBookingOpen(false)}
        onConfirm={handleConfirmBooking}
        disabled={isGuest}
      />
    </>
  );
}
