import { motion } from "motion/react";
import { Droplet, MapPin, Search, Activity, AlertCircle, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodBanks = [
  {
    id: 1,
    name: "Central City Blood Bank",
    distance: "1.2 mi",
    inventory: { "O-": 12, "A+": 45, "B+": 30 },
    status: "healthy", // healthy, low, critical
    lastUpdated: "2 mins ago"
  },
  {
    id: 2,
    name: "Metro General Hospital",
    distance: "3.5 mi",
    inventory: { "O-": 2, "A+": 15, "B+": 8 },
    status: "critical",
    lastUpdated: "Just now"
  }
];

const activeDonors = [
  { id: 1, name: "Sarah M.", type: "O-", distance: "0.8 mi", rating: 4.9 },
  { id: 2, name: "David K.", type: "A+", distance: "1.5 mi", rating: 5.0 },
  { id: 3, name: "Priya R.", type: "B+", distance: "2.1 mi", rating: 4.8 },
];

export function BloodFinder() {
  const [selectedType, setSelectedType] = useState<string>("O-");

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <Droplet className="w-6 h-6 text-red-500 fill-red-500/20" />
            </div>
            Real-Time Blood Network
          </h1>
          <p className="text-slate-500 font-medium mt-2">Live inventory and active donor tracking in your area</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospitals or zip code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
          <button className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Urgent Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Filters & Banks */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Blood Type Selector */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              Select Blood Group
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">Live Tracking</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {bloodTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`relative px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 overflow-hidden ${
                    selectedType === type
                      ? "text-white shadow-md scale-105"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50"
                  }`}
                >
                  {selectedType === type && (
                    <motion.div
                      layoutId="active-blood-type"
                      className="absolute inset-0 bg-red-500 -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Banks Inventory */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Nearby Bank Inventories</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Activity className="w-4 h-4 text-green-500" /> Auto-updating
              </div>
            </div>

            <div className="space-y-4">
              {bloodBanks.map((bank, i) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-red-100 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{bank.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5" /> {bank.distance}
                        </span>
                        <span className="text-xs text-slate-400">Updated {bank.lastUpdated}</span>
                      </div>
                    </div>
                    {bank.status === "critical" && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    )}
                  </div>

                  {/* Inventory Bar for selected type */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">Type {selectedType} Inventory</span>
                      <span className="font-bold text-slate-900">
                        {bank.inventory[selectedType as keyof typeof bank.inventory] || 0} units
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(((bank.inventory[selectedType as keyof typeof bank.inventory] || 0) / 50) * 100, 100)}%` 
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          (bank.inventory[selectedType as keyof typeof bank.inventory] || 0) < 10 
                            ? "bg-red-500" 
                            : "bg-teal-500"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Live Donors */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex-1">
            {/* Background Map Graphic Hint */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,80 Q25,55 50,80 T100,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
              Live Donor Network
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </h2>

            <div className="space-y-3">
              {activeDonors.map((donor, i) => (
                <motion.div
                  key={donor.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-red-100 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center relative overflow-hidden">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{donor.name}</h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {donor.distance} away
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-lg">
                      {donor.type}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
