"use client";

import { useState } from "react";
import { EmergencyResponse } from "@/backend/types";
import { ActionPanel } from "@/frontend/components/ActionPanel";
import { BloodFinderPanel } from "@/frontend/components/BloodFinderPanel";
import { CrisisModeOverlay } from "@/frontend/components/CrisisModeOverlay";
import { EmergencyChat } from "@/frontend/components/EmergencyChat";
import { LiveMap } from "@/frontend/components/LiveMap";
import { StatusBar } from "@/frontend/components/StatusBar";

export default function Home() {
  const [triage, setTriage] = useState<EmergencyResponse | null>(null);
  const [bloodOpen, setBloodOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [highlightBlood, setHighlightBlood] = useState(false);

  const handleAction = (action: string) => {
    if (action === "Need Blood") {
      setHighlightBlood(true);
      setBloodOpen(true);
      return;
    }

    if (action === "Call Ambulance" || action === "Notify Police" || action === "Fire Brigade") {
      setCrisisOpen(true);
      return;
    }

    if (action === "Find Hospital") {
      setHighlightBlood(false);
    }
  };

  const handleResponse = (response: EmergencyResponse) => {
    setTriage(response);
    setHighlightBlood(response.actions.includes("Need Blood"));
  };

  return (
    <div className="min-h-screen bg-command px-4 py-5 md:px-8 md:py-6">
      <div className="mx-auto max-w-screen-2xl space-y-4">
        <StatusBar aiActive locationSynced />

        <main className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <EmergencyChat onResponse={handleResponse} onAction={handleAction} />
          </div>

          <div className="space-y-4 xl:col-span-5">
            <LiveMap triage={triage} highlightBlood={highlightBlood} />
            <ActionPanel triage={triage} onAction={handleAction} onActivateCrisis={() => setCrisisOpen(true)} />
            <BloodFinderPanel isOpen={bloodOpen} onClose={() => setBloodOpen(false)} />
          </div>
        </main>
      </div>

      <CrisisModeOverlay isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
