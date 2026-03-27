"use client";

import { useState } from "react";
import { Ambulance, Siren, Building2 } from "lucide-react";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { PrimaryButton } from "@/frontend/ui/PrimaryButton";
import { QuickActionModal } from "@/frontend/components/QuickActionModal";
import { AiChatPanel } from "@/frontend/components/AiChatPanel";
import { MapContainer } from "@/frontend/components/MapContainer";

export default function EmergencyPage() {
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  const action = (text: string) => {
    setModalText(text);
    setOpen(true);
  };

  return (
    <PageContainer
      title="Emergency"
      subtitle="Activate critical actions quickly and use AI urgency detection assistance."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-4xl border border-white/80 bg-white/60 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <PrimaryButton onClick={() => action("Ambulance dispatch request initiated.")} className="w-full text-left">
                <Ambulance className="mr-2 inline h-4 w-4" /> Call Ambulance
              </PrimaryButton>
              <PrimaryButton onClick={() => action("Nearest hospitals highlighted on map.")} className="w-full text-left" subtle>
                <Building2 className="mr-2 inline h-4 w-4" /> Find Nearest Hospital
              </PrimaryButton>
              <PrimaryButton onClick={() => action("Crisis alert sent to emergency contacts.")} className="w-full text-left" subtle>
                <Siren className="mr-2 inline h-4 w-4" /> Trigger Crisis Alert
              </PrimaryButton>
            </div>
          </div>

          <AiChatPanel />
        </div>

        <div className="lg:col-span-7">
          <MapContainer query="nearest emergency hospital" title="Emergency Map" className="h-full" />
        </div>
      </div>

      <QuickActionModal
        open={open}
        title="Action Status"
        onClose={() => setOpen(false)}
        content={<p>{modalText}</p>}
      />
    </PageContainer>
  );
}
