import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  FaSearch, 
  FaBed, 
  FaUsers, 
  FaBuilding, 
  FaSlidersH,
  FaArrowRight,
  FaCalendarCheck,
  FaHistory,
  FaSync
} from "react-icons/fa";

export default function AvailableRooms() {
  const [rooms] = useState([
    { id: "101", type: "Standard", status: "Cleaning", capacity: 2, rate: 95.0, property: "Harbor Grand Hotel" },
    { id: "201", type: "Deluxe", status: "Available", capacity: 3, rate: 145.0, property: "Harbor Grand Hotel" },
    { id: "202", type: "Executive Room", status: "Occupied", capacity: 2, rate: 175.0, property: "Harbor Grand Hotel" },
    { id: "203", type: "Executive Room", status: "Cleaning", capacity: 2, rate: 175.0, property: "Harbor Grand Hotel" },
    { id: "301", type: "Suite", status: "Reserved", capacity: 4, rate: 230.0, property: "Harbor Grand Hotel" },
    { id: "401", type: "Family Room", status: "Available", capacity: 5, rate: 185.0, property: "Harbor Grand Hotel" },
    { id: "D1", type: "Dormitory", status: "Available", capacity: 8, rate: 45.0, property: "Harbor Grand Hotel" },
    { id: "D2", type: "Dormitory", status: "Available", capacity: 8, rate: 45.0, property: "Harbor Grand Hotel" },
  ]);

  const getStatusTheme = (status) => {
    switch (status) {
      case "Available":
        return {
          bg: "bg-emerald-500/5 hover:border-emerald-500/40",
          beacon: "bg-emerald-500 shadow-emerald-500/40",
          text: "text-emerald-600",
          tag: "bg-emerald-500/10 text-emerald-700"
        };
      case "Cleaning":
        return {
          bg: "bg-amber-500/5 hover:border-amber-500/40",
          beacon: "bg-amber-500 shadow-amber-500/40",
          text: "text-amber-600",
          tag: "bg-amber-500/10 text-amber-700"
        };
      case "Occupied":
        return {
          bg: "bg-rose-500/5 hover:border-rose-500/40",
          beacon: "bg-rose-500 shadow-rose-500/40",
          text: "text-rose-600",
          tag: "bg-rose-500/10 text-rose-700"
        };
      case "Reserved":
        return {
          bg: "bg-indigo-500/5 hover:border-indigo-500/40",
          beacon: "bg-indigo-500 shadow-indigo-500/40",
          text: "text-indigo-600",
          tag: "bg-indigo-500/10 text-indigo-700"
        };
      default:
        return {
          bg: "bg-slate-500/5",
          beacon: "bg-slate-400",
          text: "text-slate-600",
          tag: "bg-slate-100 text-slate-700"
        };
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1500px] mx-auto p-6 space-y-8 bg-slate-50/20 min-h-screen font-sans">
        
        {/* Modern Minimalist Header Frame */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-200/60 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Room Matrix <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-900 text-white rounded-md tracking-normal">v2.4</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Unified transient allocation deck and physical unit telemetry console.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-white border p-1 rounded-xl flex shadow-sm w-full lg:w-auto">
              <button className="flex-1 lg:flex-none text-xs font-bold px-4 py-2 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center gap-1.5"><FaCalendarCheck/> Registry</button>
              <button className="flex-1 lg:flex-none text-xs font-medium px-4 py-2 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center gap-1.5"><FaHistory/> Timeline</button>
            </div>
            <button className="p-3 bg-white border rounded-xl hover:bg-slate-50 shadow-sm text-slate-500 transition-all"><FaSync className="text-xs animate-spin-slow" /></button>
          </div>
        </div>

        {/* Hyper-Compact Glass Controls Drawer */}
        <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Check In</span>
            <input type="date" defaultValue="2026-05-16" className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Check Out</span>
            <input type="date" defaultValue="2026-05-17" className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Configuration</span>
            <select className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer">
              <option>All Blueprints</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Volume</span>
            <input type="number" defaultValue={2} className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Hub Property</span>
            <select className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer">
              <option>Harbor Grand Hotel</option>
            </select>
          </div>
          <div className="flex items-end col-span-2 md:col-span-1">
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10">
              <FaSearch className="text-[10px]" /> Apply Parameters
            </button>
          </div>
        </div>

        {/* Structural Matrix System Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => {
            const theme = getStatusTheme(room.status);
            const isAvailable = room.status === "Available";

            return (
              <div 
                key={room.id}
                className={`bg-white border border-slate-200 rounded-3xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-sm ${theme.bg}`}
              >
                <div>
                  {/* Structural Block Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white text-sm font-black tracking-tight shadow-sm group-hover:scale-105 transition-transform">
                        {room.id}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Room Identifier</span>
                        <span className="text-[11px] font-mono font-medium text-slate-500 flex items-center gap-1">
                          <FaBuilding className="text-[9px]" /> {room.property.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    
                    {/* Live Status Cluster */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-100 p-1.5 rounded-xl shadow-sm">
                      <span className={`w-2 h-2 rounded-full relative flex ${theme.beacon}`}>
                        {isAvailable && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 pr-1">{room.status}</span>
                    </div>
                  </div>

                  {/* Core Attribute Pills */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs bg-slate-50 border p-2 rounded-xl">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium"><FaBed/> Typology</span>
                      <span className="font-bold text-slate-800">{room.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-slate-50 border p-2 rounded-xl">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium"><FaUsers/> Maximum Vol</span>
                      <span className="font-bold text-slate-800">{room.capacity} Units</span>
                    </div>
                  </div>
                </div>

                {/* Tactical Segment Action Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 block">Base Cycle Rate</span>
                    <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      ${room.rate.toFixed(0)}<span className="text-xs font-medium text-slate-400">/d</span>
                    </div>
                  </div>

                  <button 
                    disabled={!isAvailable}
                    className={`h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                      isAvailable 
                        ? "bg-slate-950 hover:bg-slate-800 text-white group-hover:gap-2 shadow-sm" 
                        : "bg-slate-100 text-slate-300 cursor-not-allowed border"
                    }`}
                  >
                    <span>{isAvailable ? "Allocate" : "Inaccessible"}</span>
                    {isAvailable && <FaArrowRight className="text-[9px] transition-all" />}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Console Footprint metadata */}
        <div className="text-[10px] font-mono text-slate-400 text-right pr-1 flex items-center justify-end gap-1.5">
          <FaSlidersH className="text-[9px]" /> Allocation Matrix Matrix Node: Displaying {rooms.length} Structural Slots
        </div>

      </div>
    </AdminLayout>
  );
}