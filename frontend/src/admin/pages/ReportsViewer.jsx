import React from "react";
import { FaArrowLeft, FaFilePdf } from "react-icons/fa";

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Builds the report's headers/rows from the SAME `data` object the Dashboard
// page already fetched from /api/dashboard/stats — no separate mock data.
function buildReport(selectedType, data) {
  const stats = data?.stats;
  const chartSeries = data?.chart_series || [];
  const channels = data?.distribution_channels || [];
  const recentActivity = data?.recent_activity || [];

  if (selectedType === "rev_summary") {
    return {
      title: "Revenue & Financial Summary",
      subtitle: `Total revenue ${fmtMoney(stats?.total_revenue?.value)} across the selected period, by booking channel`,
      headers: ["Booking Channel", "Bookings", "Share of Bookings"],
      rows: channels.length
        ? channels.map((c) => [c.name, `${c.count} Booking${c.count === 1 ? "" : "s"}`, `${c.percent}%`])
        : [["No bookings in this period", "-", "-"]],
    };
  }

  if (selectedType === "occ_forecast") {
    return {
      title: "Occupancy Forecast",
      subtitle: `Current occupancy rate ${stats?.occupancy_rate?.value ?? 0}% — daily trend for the selected period`,
      headers: ["Date", "Occupancy Rate", "Gross Revenue"],
      rows: chartSeries.length
        ? chartSeries.map((d) => [d.date, `${d.occupancy_rate}%`, fmtMoney(d.revenue)])
        : [["No data in this period", "-", "-"]],
    };
  }

  // ops_brief (default)
  return {
    title: "Daily Operations Brief",
    subtitle: `Active check-ins: ${stats?.active_check_ins?.value ?? 0} — recent bookings & payments activity`,
    headers: ["Time", "Activity"],
    rows: recentActivity.length
      ? recentActivity.map((a) => [a.time, a.text])
      : [["No recent activity", "-"]],
  };
}

export default function ReportViewer({ selectedType, dashboardDate, data, onBack }) {
  const activeReport = buildReport(selectedType, data);

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* Top Control bar (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-6 border-b border-slate-100 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition text-xs font-bold uppercase tracking-wider"
        >
          <FaArrowLeft size={12} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => window.print()}
          className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition active:scale-[0.98]"
        >
          <FaFilePdf size={12} className="text-amber-400" />
          <span>Download Official PDF</span>
        </button>
      </div>

      {/* Printable Simulated Paper Canvas Sheet */}
      <div className="bg-white max-w-4xl mx-auto rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 min-h-[842px] print:border-0 print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b-2 border-slate-950 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Grand Horizon Luxe Hotel</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Property Code: #GHL-2026-NY</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wider uppercase bg-slate-100 px-3 py-1 rounded-md">{activeReport.title}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1.5">Scope: {dashboardDate}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-6 italic">{activeReport.subtitle}</p>

        {/* Dynamically Generated Table */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-950 text-slate-400 font-bold">
              {activeReport.headers.map((head, index) => (
                <th key={index} className="py-2.5">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {activeReport.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-24 border-t border-dashed border-slate-200 pt-8 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <p>© 2026 Grand Horizon System Logic Ledger. Confidential Document Asset.</p>
          <div className="w-32 border-b border-slate-900 pb-1 text-center font-bold text-slate-900">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
}
