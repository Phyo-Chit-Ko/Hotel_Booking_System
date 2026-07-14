import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import ReportViewer from "./ReportsViewer";
import {
  FaBed, FaCoins, FaUserCheck,
  FaFileExport, FaTimes, FaClipboardList,
  FaChartLine, FaPercentage
} from "react-icons/fa";

const CHANNEL_COLORS = ["bg-slate-900", "bg-amber-500", "bg-slate-300", "bg-emerald-500", "bg-sky-500"];

// Normalize a series of numeric values into an SVG polyline `d` attribute
// inside a fixed 600x160 viewBox, so the chart is driven by real data points
// instead of hand-authored Bezier curves.
function buildPath(values, { width = 600, height = 160, topPad = 20, bottomPad = 10 } = {}) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usableHeight = height - topPad - bottomPad;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - bottomPad - ((v - min) / span) * usableHeight;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtChange = (n, suffix = "%") => (n > 0 ? "+" : "") + n + suffix;

export default function Dashboard() {
  const [viewState, setViewState] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("ops_brief");
  const [range, setRange] = useState(7);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axios
      .get("/api/dashboard/stats", { params: { range } })
      .then((res) => { if (active) setData(res.data); })
      .catch(() => { if (active) setError("Failed to load dashboard data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range]);

  const stats = useMemo(() => {
    if (!data) return [];
    const s = data.stats;
    return [
      {
        title: "Total Revenue",
        value: fmtMoney(s.total_revenue.value),
        change: fmtChange(s.total_revenue.change),
        isPositive: s.total_revenue.change >= 0,
        icon: <FaCoins className="text-xl text-amber-600" />,
      },
      {
        title: "Occupancy Rate",
        value: `${s.occupancy_rate.value}%`,
        change: fmtChange(s.occupancy_rate.change),
        isPositive: s.occupancy_rate.change >= 0,
        icon: <FaBed className="text-xl text-amber-600" />,
      },
      {
        title: "Active Check-Ins",
        value: String(s.active_check_ins.value),
        change: `${s.active_check_ins.change > 0 ? "+" : ""}${s.active_check_ins.change} entries`,
        isPositive: s.active_check_ins.change >= 0,
        icon: <FaUserCheck className="text-xl text-amber-600" />,
      },
    ];
  }, [data]);

  const revenuePath = useMemo(
    () => (data ? buildPath(data.chart_series.map((d) => d.revenue)) : ""),
    [data]
  );
  const occupancyPath = useMemo(
    () => (data ? buildPath(data.chart_series.map((d) => d.occupancy_rate)) : ""),
    [data]
  );

  const channels = (data?.distribution_channels || []).map((c, i) => ({
    name: c.name,
    value: `${c.percent}%`,
    count: `${c.count} Booking${c.count === 1 ? "" : "s"}`,
    color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
  }));

  const recentActivities = data?.recent_activity || [];

  const reportTypes = [
    { id: "ops_brief", label: "Daily Operations Brief", desc: "Check-ins, check-outs, and room status.", icon: <FaClipboardList className="text-base" /> },
    { id: "rev_summary", label: "Revenue & Financial Summary", desc: "Room Revenue, Restaurant Revenue, Car rental Revenue", icon: <FaChartLine className="text-base" /> },
    { id: "occ_forecast", label: "Occupancy Forecast", desc: "Percentage trends and capacity limitations.", icon: <FaPercentage className="text-base" /> },
  ];

  return (
    <AdminLayout>
      {viewState === "view_report" ? (
        <ReportViewer
          selectedType={selectedType}
          dashboardDate={new Date().toISOString().slice(0, 7)}
          data={data}
          onBack={() => setViewState("dashboard")}
        />
      ) : (
        /* Viewport Lock Wrapper */
        <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">

          <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Property Overview
              </h1>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Real-time terminal environment
              </p>
            </div>

            <div className="flex items-stretch gap-3">
              <div className="h-11 flex items-stretch bg-slate-100 rounded-xl border border-slate-200 p-1 gap-1">
                {[7, 30].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-4 rounded-lg text-sm font-semibold transition ${
                      range === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <FaFileExport className="text-sm" />
                <span>Export & Reports</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl shrink-0">{error}</div>
          )}

          {/* 2. Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
            {(loading ? [0, 1, 2] : stats).map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                {loading ? (
                  <div className="w-full h-10 bg-slate-50 animate-pulse rounded-lg" />
                ) : (
                  <>
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
                  </>
                )}
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

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-3 h-1 bg-slate-900 rounded-full inline-block" /> Gross Revenue ($)
                  </span>
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="w-3 h-1 bg-amber-500 rounded-full inline-block" /> Occupancy Rate (%)
                  </span>
                </div>
              </div>

              <div className="relative flex-1 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between min-h-0 overflow-hidden">

                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="w-full border-b border-slate-200/50 h-0" />
                  ))}
                  <div className="w-full h-0" />
                </div>

                <div className="relative w-full h-full min-h-0 pt-4">
                  {!loading && data && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                      <path d={revenuePath} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                      <path d={occupancyPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* X-Axis Horizontal Matrix Labels */}
                <div className="flex justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-200 shrink-0">
                  {(data?.chart_series || []).filter((_, i, arr) => i % Math.ceil(arr.length / 5) === 0).map((d) => (
                    <span key={d.date}>{new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span>
                  ))}
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

                <div className="space-y-3.5 flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">
                  {channels.length === 0 && !loading && (
                    <p className="text-xs text-slate-400 text-center">No bookings in this period.</p>
                  )}
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
                  <p className="text-xs text-slate-400 mt-0.5">Recent bookings & payments</p>
                </div>

                <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 min-h-0 scrollbar-none">
                  {recentActivities.length === 0 && !loading && (
                    <p className="text-xs text-slate-400 text-center">No recent activity.</p>
                  )}
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
