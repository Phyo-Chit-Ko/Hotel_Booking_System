import React, { useState, useEffect, useMemo, useRef } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { toast } from "react-hot-toast";
import {
  FaMoon,
  FaBed,
  FaUserSlash,
  FaMoneyBillWave,
  FaSync,
  FaPlay,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { formatCurrency } from "../../utils/currency";
// Base URL is already set globally in main.jsx — use relative paths here.

// ---- date helpers -----------------------------------------------------
// Get current year and month as "YYYY-MM" for initial input value
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// Format a JS Date as "YYYY-MM-DD" using LOCAL date parts (avoids the
// timezone-shift bug you get from toISOString()).
const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// The next 1:00 AM that occurs strictly after `lastRun`.
const getNextEligibleRun = (lastRunISO) => {
  if (!lastRunISO) return null;
  const lastRun = new Date(lastRunISO);
  const next = new Date(lastRun);
  next.setHours(1, 0, 0, 0);
  if (next <= lastRun) next.setDate(next.getDate() + 1);
  return next;
};

// ---- mini calendar ------------------------------------------------------
const MiniCalendar = ({ selectedDate, onSelect, onClose, availableDates }) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const initialView = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState(
    new Date(initialView.getFullYear(), initialView.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isFuture = (day) => {
    const cellDate = new Date(year, month, day);
    return cellDate > today;
  };

  const isToday = (day) => {
    const cellDate = new Date(year, month, day);
    return toDateKey(cellDate) === toDateKey(today);
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const cellDate = new Date(year, month, day);
    return toDateKey(cellDate) === selectedDate;
  };

  const hasReport = (day) => {
    const cellDate = new Date(year, month, day);
    return availableDates.has(toDateKey(cellDate));
  };

  const canGoNextMonth =
    new Date(year, month + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="absolute right-0 top-full mt-2 z-20 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={() => canGoNextMonth && setViewDate(new Date(year, month + 1, 1))}
          disabled={!canGoNextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const future = isFuture(day);
          const selected = isSelected(day);
          const todayCell = isToday(day);
          const hasData = hasReport(day);

          return (
            <button
              type="button"
              key={idx}
              disabled={future}
              onClick={() => {
                const cellDate = new Date(year, month, day);
                onSelect(toDateKey(cellDate));
                onClose();
              }}
              className={[
                "aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors",
                future
                  ? "text-slate-300 cursor-not-allowed"
                  : "cursor-pointer hover:bg-slate-100 text-slate-700",
                selected ? "bg-slate-900 text-white hover:bg-slate-900" : "",
                todayCell && !selected ? "border border-slate-400" : "",
                hasData && !selected && !future ? "font-bold" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-400 leading-snug">
        Bold dates have an audit on record. Future dates are disabled.
      </p>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // filters — defaults selectedMonth to the current year & month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD" or ""
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/night-audit-reports");
      setReports(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch night audit reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatch = async () => {
    try {
      setIsRunning(true);
      const res = await axios.post("/api/night-audit-reports/run-batch");
      toast.success(res.data.message || "Batch job completed.");
      fetchReports(); // refresh the table so the new row shows up immediately
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to run batch.");
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    fetchReports(); // initial load
    const interval = setInterval(fetchReports, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- derived data ----------------------------------------------------
  const availableDates = useMemo(
    () => new Set(reports.map((r) => r.audit_date).filter(Boolean)),
    [reports]
  );

  // A specific calendar date takes priority over the month input.
  const filteredReports = useMemo(() => {
    if (selectedDate) return reports.filter((r) => r.audit_date === selectedDate);
    if (selectedMonth) return reports.filter((r) => r.audit_date?.slice(0, 7) === selectedMonth);
    return reports;
  }, [reports, selectedMonth, selectedDate]);

  const isFiltering = Boolean(selectedDate || (selectedMonth && selectedMonth !== getCurrentMonth()));

  const clearFilters = () => {
    setSelectedMonth(getCurrentMonth());
    setSelectedDate("");
  };

  // Summary cards reflect whatever is currently filtered (falls back to the
  // overall latest report when nothing is selected).
  const latest = filteredReports[0];

  // ---- run-batch gating: once per day, unlocks at the next 1:00 AM ----
  const mostRecentRun = reports[0]?.updated_at || reports[0]?.created_at || null;
  const nextEligibleRun = useMemo(() => getNextEligibleRun(mostRecentRun), [mostRecentRun]);
  const canRunBatch = !nextEligibleRun || new Date() >= nextEligibleRun;

  const getStatusStyle = (status) =>
    status === "success"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-red-50 text-red-700 border border-red-200";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary cards — reflect the current filter (or the latest audit if none) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
              <FaMoneyBillWave />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? formatCurrency(latest.total_revenue) : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xl text-blue-600">
              <FaBed />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-House Rooms</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? latest.total_inhouse : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-100 text-xl text-red-600">
              <FaUserSlash />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">No-Shows</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? latest.total_no_show_rooms : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
              <FaMoon />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {isFiltering ? "Showing Date" : "Last Audit Date"}
              </p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? latest.audit_date : "—"}
              </h3>
            </div>
          </div>
        </div>

        {/* Master Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Night Audit Reports</h2>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Month filter (Width reduced to w-44 and height aligned to h-10) */}
              <div className="w-44 h-10">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate(""); // month filter and specific date are mutually exclusive
                  }}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 [color-scheme:light]"
                />
              </div>

              {/* Calendar filter */}
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((o) => !o)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border transition h-10",
                    selectedDate
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <FaCalendarAlt className="w-3 h-3" />
                  {selectedDate || "Pick a date"}
                </button>
                {calendarOpen && (
                  <MiniCalendar
                    selectedDate={selectedDate}
                    availableDates={availableDates}
                    onSelect={(dateKey) => {
                      setSelectedDate(dateKey);
                      setSelectedMonth("");
                    }}
                    onClose={() => setCalendarOpen(false)}
                  />
                )}
              </div>

              {isFiltering && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-xl border border-transparent hover:border-slate-200 transition h-10"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear
                </button>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FaSync className={loading ? "animate-spin" : ""} />
                {lastUpdated ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
              </div>

              {canRunBatch ? (
                <button
                  onClick={handleRunBatch}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50 transition h-10"
                >
                  <FaPlay className="w-3 h-3" />
                  {isRunning ? "Running batch…" : "Run Batch Now"}
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic px-1">
                  Next batch available at{" "}
                  {nextEligibleRun?.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Audit Date</th>
                  <th className="px-5 py-3.5 text-center">Check-Ins</th>
                  <th className="px-5 py-3.5 text-center">Check-Outs</th>
                  <th className="px-5 py-3.5 text-center">In-House</th>
                  <th className="px-5 py-3.5 text-center">No-Shows</th>
                  <th className="px-5 py-3.5">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">{index + 1}</td>
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">{r.audit_date}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.total_check_in}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.total_check_out}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.total_inhouse}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.total_no_show_rooms}</td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{formatCurrency(r.total_revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                      {loading
                        ? "Loading reports..."
                        : isFiltering
                        ? "No report found for this selection."
                        : "No night audit reports yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;