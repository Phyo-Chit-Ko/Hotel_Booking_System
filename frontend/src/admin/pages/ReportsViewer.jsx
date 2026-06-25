import React from "react";
import { FaArrowLeft, FaFilePdf } from "react-icons/fa";

// 1. Static Mock Data Matrix
const staticReportData = {
  ops_brief: {
    title: "Daily Operations Brief",
    subtitle: "Check-ins, check-outs, and room status matrix",
    headers: ["Room ID", "Guest Name", "Class Tier", "Status Ledger"],
    rows: [
      ["RM-104", "Marcus Vance", "Suite Tier", "Checked In"],
      ["RM-202", "Elena Rostova", "Deluxe Tier", "Arriving"],
      ["RM-110", "Kenji Sato", "Standard Base", "Checked In"]
    ]
  },
  rev_summary: {
    title: "Revenue & Financial Summary",
    subtitle: "Gross earnings, tax collections, and ADR tracking",
    headers: ["Source", "Gross Amount", "Tax Collected", "Net Settlement"],
    rows: [
      ["Room Bookings", "$34,200.00", "$2,736.00", "$31,464.00"],
      ["Food & Beverage", "$9,150.00", "$732.00", "$8,418.00"],
      ["Spa & Amenities", "$4,900.00", "$392.00", "$4,508.00"]
    ]
  },
  occ_forecast: {
    title: "Occupancy Forecast",
    subtitle: "Percentage trends and capacity limitations",
    headers: ["Week Segment", "Projected Occ %", "Rooms Blocked", "Allotment Status"],
    rows: [
      ["Week 1 (June 01 - June 07)", "72.4%", "120 Rooms", "Optimal"],
      ["Week 2 (June 08 - June 14)", "78.4%", "142 Rooms", "High Demand"],
      ["Week 3 (June 15 - June 21)", "89.1%", "160 Rooms", "Near Capacity"]
    ]
  },
  channel_perf: {
    title: "Channel Performance Matrix",
    subtitle: "Direct website bookings vs OTA metrics",
    headers: ["Booking Channel", "Reservation Count", "Revenue Contribution", "Commission Paid"],
    rows: [
      ["Direct Website", "84 Bookings", "$28,400.00", "$0.00 (0%)"],
      ["Booking.com", "38 Bookings", "$12,100.00", "$1,815.00 (15%)"],
      ["Expedia Group", "20 Bookings", "$7,750.00", "$1,162.50 (15%)"]
    ]
  }
};

export default function ReportViewer({ selectedType, dashboardDate, onBack }) {
  const activeReport = staticReportData[selectedType] || staticReportData.ops_brief;

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