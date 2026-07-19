import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import ReportViewer from "./ReportsViewer";
import {
  FaBed, FaCoins, FaUserCheck,
  FaTimes, FaClipboardList,
  FaChartLine, FaPercentage
} from "react-icons/fa";
 
const CHANNEL_COLORS = ["bg-slate-900", "bg-amber-500", "bg-slate-300", "bg-emerald-500", "bg-sky-500"];
const CHANNEL_HEX = ["#0f172a", "#f59e0b", "#cbd5e1", "#10b981", "#0ea5e9"];
 
const getCurrentWeekString = () => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const resultWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
  return `${now.getFullYear()}-W${String(resultWeek).padStart(2, '0')}`;
};
 
function toPoints(values, { width = 600, height = 160, topPad = 20, bottomPad = 10 } = {}) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usableHeight = height - topPad - bottomPad;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
 
  return values.map((v, i) => ({
    x: i * stepX,
    y: height - bottomPad - ((v - min) / span) * usableHeight,
  }));
}
 
function buildWavePath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
 
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}
 
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtChange = (n, suffix = "%") => (n > 0 ? "+" : "") + n + suffix;
 
export default function Dashboard() {
  const [viewState, setViewState] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("ops_brief");
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekString());
 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
 
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
   
    axios
      .get("/api/dashboard/stats", { params: { week: selectedWeek } })
      .then((res) => { if (active) setData(res.data); })
      .catch(() => { if (active) setError("Failed to load dashboard data for the selected week."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedWeek]);
 
  const stats = useMemo(() => {
    if (!data) return [];
    const s = data.stats;
    return [
      {
        title: "Weekly Total Revenue",
        value: fmtMoney(s.total_revenue.value),
        change: fmtChange(s.total_revenue.change),
        isPositive: s.total_revenue.change >= 0,
        icon: <FaCoins className="text-xl text-amber-600" />,
      },
      {
        title: "Weekly Occupancy Rate",
        value: `${s.occupancy_rate.value}%`,
        change: fmtChange(s.occupancy_rate.change),
        isPositive: s.occupancy_rate.change >= 0,
        icon: <FaBed className="text-xl text-amber-600" />,
      },
      {
        title: "Weekly Active Check-Ins",
        value: String(s.active_check_ins.value),
        change: `${s.active_check_ins.change > 0 ? "+" : ""}${s.active_check_ins.change} entries`,
        isPositive: s.active_check_ins.change >= 0,
        icon: <FaUserCheck className="text-xl text-amber-600" />,
      },
    ];
  }, [data]);
 
  const revenuePoints = useMemo(
    () => (data ? toPoints(data.chart_series.map((d) => d.revenue)) : []),
    [data]
  );
  const occupancyPoints = useMemo(
    () => (data ? toPoints(data.chart_series.map((d) => d.occupancy_rate)) : []),
    [data]
  );
  const revenuePath = useMemo(() => buildWavePath(revenuePoints), [revenuePoints]);
  const occupancyPath = useMemo(() => buildWavePath(occupancyPoints), [occupancyPoints]);
  const revenueAreaPath = useMemo(() => {
    if (!revenuePoints.length) return "";
    const first = revenuePoints[0];
    const last = revenuePoints[revenuePoints.length - 1];
    return `${revenuePath} L ${last.x.toFixed(1)} 160 L ${first.x.toFixed(1)} 160 Z`;
  }, [revenuePoints, revenuePath]);
 
  const channels = (data?.distribution_channels || []).map((c, i) => ({
    name: c.name,
    percentValue: c.percent,
    value: `${c.percent}%`,
    countValue: c.count,
    count: `${c.count} Booking${c.count === 1 ? "" : "s"}`,
    color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    hex: CHANNEL_HEX[i % CHANNEL_HEX.length],
  }));
 
  const totalChannelBookings = channels.reduce((sum, c) => sum + c.countValue, 0);
 
  const DONUT_SIZE = 160;
  const DONUT_RADIUS = 62;
  const DONUT_STROKE = 18;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
  const donutSegments = channels.map((chan, i) => {
    const percentBefore = channels.slice(0, i).reduce((sum, c) => sum + c.percentValue, 0);
    const dash = (chan.percentValue / 100) * DONUT_CIRCUMFERENCE;
    const offset = DONUT_CIRCUMFERENCE - (percentBefore / 100) * DONUT_CIRCUMFERENCE;
    return { ...chan, dash, offset };
  });
 
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
        <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">
 
          {/* Cleaned up header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Property Overview
              </h1>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Weekly system metrics and tracking performance
              </p>
            </div>
 
            <div className="flex items-center gap-3">
              {/* Native styled single inputs replace the wrapped double calendar indicators */}
              <input
                type="week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-sm font-medium text-slate-700 outline-none shadow-sm cursor-pointer hover:bg-slate-50 focus:border-slate-400 transition"
              />
            </div>
          </div>
 
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl shrink-0">{error}</div>
          )}
 
          {/* Key Metrics Row */}
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
 
          {/* UI Grid System Data Framework */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-0">
              <div className="flex justify-between items-center pb-3 shrink-0">
                <div>
                  <h2 className="text-md font-semibold text-slate-900 tracking-tight">Analytical Performance Dynamics</h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
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
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={revenueAreaPath} fill="url(#revenueGradient)" stroke="none" />
                      <path d={occupancyPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
 
                <div className="flex justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-200 shrink-0">
                  {(data?.chart_series || []).map((d) => (
                    <span key={d.date}>{new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span>
                  ))}
                </div>
              </div>
            </div>
 
            <div className="grid grid-rows-2 gap-5 min-h-0">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-0">
                <div className="shrink-0">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Channel Mix</p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 mt-4">
                  {channels.length === 0 && !loading ? (
                    <p className="text-xs text-slate-400 text-center py-8">No bookings in this period.</p>
                  ) : (
                    <div className="relative flex items-center justify-center" style={{ width: DONUT_SIZE * 0.9, height: DONUT_SIZE * 0.9 }}>
                      <svg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} className="-rotate-90 w-full h-full">
                        <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={DONUT_RADIUS} fill="none" stroke="#f8fafc" strokeWidth={DONUT_STROKE + 2} />
                        {donutSegments.map((seg, i) => {
                          const isHovered = activeSegmentIndex === i;
                          return (
                            <circle
                              key={i}
                              cx={DONUT_SIZE / 2}
                              cy={DONUT_SIZE / 2}
                              r={DONUT_RADIUS}
                              fill="none"
                              stroke={seg.hex}
                              strokeWidth={isHovered ? DONUT_STROKE + 4 : DONUT_STROKE}
                              strokeDasharray={`${seg.dash} ${DONUT_CIRCUMFERENCE - seg.dash}`}
                              strokeDashoffset={seg.offset}
                              className="cursor-pointer transition-all duration-200 ease-out origin-center"
                              style={{ transform: isHovered ? 'scale(1.02)' : 'scale(1)' }}
                              onMouseEnter={() => setActiveSegmentIndex(i)}
                              onMouseLeave={() => setActiveSegmentIndex(null)}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-5 bg-white rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center p-3 pointer-events-none transition-all duration-200">
                        {activeSegmentIndex !== null ? (
                          (() => {
                            const activeChan = channels[activeSegmentIndex];
                            return (
                              <div className="animate-fade-in space-y-0.5">
                                <span className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none block">{activeChan.value}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[90px] text-slate-500">{activeChan.name}</span>
                                <span className="text-[9px] font-mono text-slate-400 block">{activeChan.countValue} bkgs</span>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none block">{totalChannelBookings.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bookings</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
 
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-0">
                <div className="shrink-0">
                  <h3 className="text-base font-semibold text-slate-900">Live Activity Log</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Recent bookings & payments</p>
                </div>
                <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 min-h-0 scrollbar-none">
                  {recentActivities.length === 0 && !loading && <p className="text-xs text-slate-400 text-center">No recent activity.</p>}
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
 
      {/* Overlay Configuration Modal */}
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
                    selectedType === type.id ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
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
 