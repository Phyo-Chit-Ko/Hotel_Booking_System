import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { FaMoon, FaBed, FaUserSlash, FaDollarSign, FaSync } from "react-icons/fa";
import axios from "axios";
// Base URL is already set globally in main.jsx — use relative paths here.

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  useEffect(() => {
    fetchReports(); // initial load
    const interval = setInterval(fetchReports, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const latest = reports[0];

  const formatCurrency = (val) =>
    `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusStyle = (status) =>
    status === "success"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-red-50 text-red-700 border border-red-200";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary cards — reflect the most recent audit */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
              <FaDollarSign />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Grand Total</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? formatCurrency(latest.grand_total) : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xl text-blue-600">
              <FaBed />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Occupied Rooms</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? latest.occupied_rooms : "—"}
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
                {latest ? latest.no_show_count : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
              <FaMoon />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Last Audit Date</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">
                {latest ? latest.audit_date : "—"}
              </h3>
            </div>
          </div>
        </div>

        {/* Master Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Night Audit Reports</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FaSync className={loading ? "animate-spin" : ""} />
              {lastUpdated
                ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}`
                : "Loading..."}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Audit Date</th>
                  <th className="px-5 py-3.5">Room Revenue</th>
                  <th className="px-5 py-3.5">Extra Person</th>
                  <th className="px-5 py-3.5">Tax</th>
                  <th className="px-5 py-3.5">Grand Total</th>
                  <th className="px-5 py-3.5">Payments Received</th>
                  <th className="px-5 py-3.5 text-center">Occupied</th>
                  <th className="px-5 py-3.5 text-center">No-Shows</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">{r.audit_date}</td>
                      <td className="px-5 py-4 font-mono text-slate-700">{formatCurrency(r.total_room_revenue)}</td>
                      <td className="px-5 py-4 font-mono text-slate-700">{formatCurrency(r.total_extra_person_revenue)}</td>
                      <td className="px-5 py-4 font-mono text-slate-700">{formatCurrency(r.total_tax)}</td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{formatCurrency(r.grand_total)}</td>
                      <td className="px-5 py-4 font-mono text-slate-700">{formatCurrency(r.total_payments_received)}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.occupied_rooms}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700">{r.no_show_count}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusStyle(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                      {loading ? "Loading reports..." : "No night audit reports yet."}
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