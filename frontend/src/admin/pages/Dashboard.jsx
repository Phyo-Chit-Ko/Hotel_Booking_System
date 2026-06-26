import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import ReportViewer from "./ReportsViewer"; 
import { 
  FaBed, FaCoins, FaUserCheck, FaArrowUp, FaArrowDown, 
  FaFileExport, FaTimes, FaClipboardList, 
  FaChartLine, FaPercentage, FaHubspot, FaCalendarAlt
} from "react-icons/fa";

export default function Dashboard() {
  const [viewState, setViewState] = useState("dashboard"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("ops_brief");
  const [dashboardDate, setDashboardDate] = useState("2026-06");

  const stats = [
    { title: "Total Revenue", value: "$48,250.00", change: "+12.5%", isPositive: true, icon: <FaCoins className="text-xl text-amber-600" /> },
    { title: "Occupancy Rate", value: "78.4%", change: "+4.2%", isPositive: true, icon: <FaBed className="text-xl text-amber-600" /> },
    { title: "Active Check-Ins", value: "32", change: "-2 entries", isPositive: false, icon: <FaUserCheck className="text-xl text-amber-600" /> }
  ];

  const reportTypes = [
    { id: "ops_brief", label: "Daily Operations Brief", desc: "Check-ins, check-outs, and room status matrix.", icon: <FaClipboardList className="text-base" /> },
    { id: "rev_summary", label: "Revenue & Financial Summary", desc: "Gross earnings, tax collections, and ADR tracking.", icon: <FaChartLine className="text-base" /> },
    { id: "occ_forecast", label: "Occupancy Forecast", desc: "Percentage trends and capacity limitations.", icon: <FaPercentage className="text-base" /> },
    { id: "channel_perf", label: "Channel Performance", desc: "Direct website bookings vs OTA metrics.", icon: <FaHubspot className="text-base" /> }
  ];

  const recentActivities = [
    { id: 1, text: "Room 201 - VIP Check-in completed", time: "10m ago" },
    { id: 2, text: "Room 104 marked Cleaned by Staff", time: "25m ago" },
    { id: 3, text: "New booking via Booking.com ($450)", time: "1h ago" },
    { id: 4, text: "Late check-out request approved", time: "2h ago" }
  ];

  const channels = [
    { name: "Direct Website", value: "42%", count: "124 Bookings", color: "bg-slate-900" },
    { name: "Booking.com", value: "38%", count: "110 Bookings", color: "bg-amber-500" },
    { name: "Expedia / OTAs", value: "20%", count: "58 Bookings", color: "bg-slate-300" }
  ];

  return (
    <AdminLayout>
      {viewState === "view_report" ? (
        <ReportViewer 
          selectedType={selectedType} 
          dashboardDate={dashboardDate} 
          onBack={() => setViewState("dashboard")} 
        />
      ) : (
        /* Viewport Lock Wrapper */
        <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">
          
          {/* 1. Control Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Property Overview</h1>
              <p className="text-sm font-normal text-slate-500 mt-0.5">Real-time terminal environment</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <FaCalendarAlt className="text-slate-500 text-sm" />
                <input 
                  type="month" 
                  value={dashboardDate}
                  onChange={(e) => setDashboardDate(e.target.value)}
                  className="text-sm font-medium text-slate-800 bg-transparent outline-none cursor-pointer"
                />
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <FaFileExport className="text-xs" />
                <span>Export & Reports</span>
              </button>
            </div>
          </div>

          {/* 2. Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl">{stat.icon}</div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stat.value}</h3>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${stat.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* 3. Main Split Framework Core */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
            
            {/* Left Hand Side: Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-0">
              <div className="flex justify-between items-center pb-3 shrink-0">
                <div>
                  <h2 className="text-md font-semibold text-slate-900 tracking-tight">Analytical Performance Dynamics</h2>
                </div>
                
                {/* Fixed Simultaneous Line Legends */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-3 h-1 bg-slate-900 rounded-full inline-block" /> Gross Revenue ($)
                  </span>
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-3 h-1 bg-amber-500 rounded-full inline-block" /> Occupancy Rate (%)
                  </span>
                </div>
              </div>

              {/* Enhanced Grid & Chart Container Area */}
              <div className="relative flex-1 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between min-h-0 overflow-hidden">
                
                {/* Horizontal Baseline Guides */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="w-full border-b border-slate-200/50 h-0" />
                  ))}
                  <div className="w-full h-0" />
                </div>

                {/* Simultaneous Real-time Dual Line Plot Canvas */}
                <div className="relative w-full h-full min-h-0 pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                    <path 
                      d="M 0 110 Q 100 60, 200 85 T 400 30 T 600 50" 
                      fill="none" 
                      stroke="#0f172a" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 0 140 Q 120 100, 240 115 T 480 50 T 600 75" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                    <circle cx="200" cy="85" r="4.5" className="fill-slate-900 stroke-white stroke-2" />
                    <circle cx="400" cy="30" r="4.5" className="fill-slate-900 stroke-white stroke-2" />
                    <circle cx="240" cy="115" r="4.5" className="fill-amber-500 stroke-white stroke-2" />
                    <circle cx="480" cy="50" r="4.5" className="fill-amber-500 stroke-white stroke-2" />
                  </svg>

                  <div className="absolute top-2 left-[64%] bg-slate-900 text-white font-mono text-xs px-2 py-0.5 rounded shadow-sm pointer-events-none">
                    Rev: $4,250/d
                  </div>
                  <div className="absolute top-16 left-[78%] bg-amber-500 text-white font-mono text-xs px-2 py-0.5 rounded shadow-sm pointer-events-none">
                    Occ: 88.5%
                  </div>
                </div>

                {/* X-Axis Horizontal Matrix Labels */}
                <div className="flex justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-200 shrink-0">
                  <span>01 Jun</span><span>07 Jun</span><span>14 Jun</span><span>21 Jun</span><span>30 Jun</span>
                </div>
              </div>
            </div>

            {/* Right Hand Column */}
            <div className="grid grid-rows-2 gap-5 min-h-0">
              
              {/* Channel Yield Configuration Block */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-0">
                <div className="shrink-0">
                  <h3 className="text-base font-semibold text-slate-900">Distribution Channels</h3>
                </div>

                <div className="space-y-3.5 flex-1 flex flex-col justify-center min-h-0">
                  {channels.map((chan, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${chan.color}`} />
                          {chan.name}
                        </span>
                        <span className="font-mono">{chan.value}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${chan.color}`} style={{ width: chan.value }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Systems Telemetry Audit Logs */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-0">
                <div className="shrink-0">
                  <h3 className="text-base font-semibold text-slate-900">Live Activity Log</h3>
                  <p className="text-xs text-slate-400 mt-0.5">System telemetry events</p>
                </div>
                
                <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 min-h-0 scrollbar-none">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex justify-between items-center gap-3 text-xs py-1.5 border-b border-slate-50 last:border-0">
                      <p className="text-slate-700 font-medium truncate">{act.text}</p>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded whitespace-nowrap font-mono">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 4. Overlay Configuration Modal Block */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-md font-semibold text-slate-900">Compile Report Asset</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select standard parameters context</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><FaTimes className="text-sm" /></button>
            </div>

            <div className="p-4 flex flex-col gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-3.5 rounded-xl border flex gap-3 transition items-center ${
                    selectedType === type.id 
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm" 
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className={`text-base ${selectedType === type.id ? "text-amber-400" : "text-slate-400"}`}>{type.icon}</div>
                  <div>
                    <div className="text-sm font-semibold leading-none">{type.label}</div>
                    <div className={`text-xs mt-1.5 leading-tight ${selectedType === type.id ? "text-slate-300" : "text-slate-400"}`}>{type.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 px-5 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setViewState("view_report"); 
                }} 
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                View HTML Report
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}