import { TopStatus } from "../components/emergency/TopStatus";
import { LiveMap } from "../components/emergency/LiveMap";
import { AiAssistant } from "../components/emergency/AiAssistant";
import { DoctorCards } from "../components/emergency/DoctorCards";
import { HospitalList } from "../components/emergency/HospitalList";

export function EmergencyDashboard() {
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen relative z-10">
      <TopStatus />
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Left Column (Map & Doctors) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-6 relative overflow-hidden h-[500px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Healthcare Network
            </h2>
            <div className="flex-1 rounded-2xl overflow-hidden relative">
              <LiveMap />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Available Doctors Nearby</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Ready for immediate telehealth or booking</p>
              </div>
            </div>
            <DoctorCards />
          </div>
        </div>

        {/* Right Column (AI & Hospitals) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-6 flex-1 flex flex-col min-h-[400px]">
            <AiAssistant />
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Nearest Facilities</h2>
            <HospitalList />
          </div>
        </div>
      </div>
    </div>
  );
}
