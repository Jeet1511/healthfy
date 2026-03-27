"use client";

import { useState } from "react";
import { EmergencyResponse } from "@/backend/types";
import { ActionPanel } from "@/frontend/components/ActionPanel";
import { CrisisModeOverlay } from "@/frontend/components/CrisisModeOverlay";
import { EmergencyChat } from "@/frontend/components/EmergencyChat";
import { LiveMap } from "@/frontend/components/LiveMap";

export default function EmergencyAiPage() {
  const [triage, setTriage] = useState<EmergencyResponse | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [highlightBlood, setHighlightBlood] = useState(false);

  const handleAction = (action: string) => {
    if (["Call Ambulance", "Notify Police", "Fire Brigade"].includes(action)) {
      setCrisisOpen(true);
    }
    if (action === "Need Blood") {
      setHighlightBlood(true);
    }
    if (action === "Find Hospital") {
      setHighlightBlood(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <EmergencyChat
            onResponse={(response) => {
              setTriage(response);
              setHighlightBlood(response.actions.includes("Need Blood"));
            }}
            onAction={handleAction}
          />
        </div>

        <div className="space-y-4 xl:col-span-5">
          <LiveMap triage={triage} highlightBlood={highlightBlood} />
          <ActionPanel triage={triage} onAction={handleAction} onActivateCrisis={() => setCrisisOpen(true)} />
        </div>
      </div>

      <CrisisModeOverlay isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </>
  );
}
