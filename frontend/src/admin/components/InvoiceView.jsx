import { useState, useEffect } from "react";
import { FaTimes, FaPrint } from "react-icons/fa";
import { formatCurrency as fmt } from "../../utils/currency";
import { authHeaders, apiUrl } from "../../utils/apiHeaders";

/**
 * Printable invoice for a reservation — rendered as a normal in-app overlay,
 * but with a dedicated `@media print` stylesheet that hides everything else
 * (sidebar/navbar/buttons) so "Print" (browser print dialog -> Save as PDF)
 * produces a clean invoice-only document. No PDF library involved; reuses
 * the existing /detail and /ledger endpoints, no backend change needed.
 */
export default function InvoiceView({ booking, onClose }) {
  const [detail, setDetail] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      fetch(apiUrl(`/api/reservations/${booking.id}/detail`), { headers: authHeaders() }).then((r) => r.json()),
      fetch(apiUrl(`/api/reservations/${booking.id}/ledger`), { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([d, l]) => {
        if (!active) return;
        setDetail(d.reservation);
        setLedger(l);
      })
      .catch(() => active && setError("Failed to load invoice data."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [booking.id]);

  const paidTotal = (ledger?.payments || []).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-800/10 backdrop-blur-md print:bg-white print:p-0 print:block">
      <div
        id="printable-invoice"
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print:max-h-none print:rounded-none print:border-0 print:shadow-none print:max-w-none"
      >
        {/* Screen-only header (hidden on print via CSS below) */}
        <div className="no-print px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Invoice</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.bookingNumber} · Room {booking.roomNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={loading || !!error}
              className="flex items-center gap-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition"
            >
              <FaPrint size={12} /> Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 print:overflow-visible print:p-10">
          {loading && <p className="text-sm text-slate-400 text-center py-10">Loading invoice…</p>}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {!loading && !error && detail && ledger && (
            <div className="space-y-8 text-slate-800">
              {/* Letterhead */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">Relax Hotel</h1>
                  <p className="text-xs text-slate-500 mt-1">73rd Street, Chanmytharzi Tsp, Mandalay, Myanmar</p>
                  <p className="text-xs text-slate-500">Phone: +959 980 683 177 · info@relaxhotel.example</p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Invoice</h2>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{booking.bookingNumber || `#${booking.id}`}</p>
                  <p className="text-xs text-slate-400 mt-1">Printed {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Guest + stay info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To</p>
                  <p className="font-semibold text-slate-900">{detail.firstName} {detail.lastName}</p>
                  {detail.phone && <p className="text-slate-500">{detail.phone}</p>}
                  {detail.email && <p className="text-slate-500">{detail.email}</p>}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stay Details</p>
                  <p className="text-slate-700">Room {detail.roomNumber} — {detail.roomType}</p>
                  <p className="text-slate-500">{detail.checkIn} → {detail.checkOut} ({detail.nights} night{detail.nights === 1 ? "" : "s"})</p>
                  <p className="text-slate-500">{detail.adults} adult(s), {detail.children} child(ren)</p>
                </div>
              </div>

              {ledger.movedFrom && (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                  Moved from Room {ledger.movedFrom.roomNumber} (Reservation #{ledger.movedFrom.reservationId})
                  {ledger.movedFrom.reason ? ` — ${ledger.movedFrom.reason}` : ""}
                </p>
              )}

              {/* Charges */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Charges</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="py-2 font-semibold">Description</th>
                      <th className="py-2 font-semibold">Type</th>
                      <th className="py-2 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.charges.length === 0 && (
                      <tr><td colSpan={3} className="py-3 text-slate-400">No charges recorded.</td></tr>
                    )}
                    {ledger.charges.map((c) => (
                      <tr key={`inv-charge-${c.id}`} className="border-b border-slate-100">
                        <td className="py-2 text-slate-800">{c.description}</td>
                        <td className="py-2 text-slate-400 uppercase text-[11px]">{c.chargeType.replace("_", " ")}</td>
                        <td className={`py-2 text-right font-mono ${c.amount < 0 ? "text-red-500" : "text-slate-900"}`}>
                          {c.amount < 0 ? "-" : ""}{fmt(Math.abs(c.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payments */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payments Received</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="py-2 font-semibold">Date</th>
                      <th className="py-2 font-semibold">Method</th>
                      <th className="py-2 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.payments.length === 0 && (
                      <tr><td colSpan={3} className="py-3 text-slate-400">No payments recorded yet.</td></tr>
                    )}
                    {ledger.payments.map((p) => (
                      <tr key={`inv-payment-${p.id}`} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">{p.date}</td>
                        <td className="py-2 text-slate-500 uppercase text-[11px]">{(p.method || "").replace("_", " ")}</td>
                        <td className="py-2 text-right font-mono text-emerald-600">-{fmt(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Charges</span>
                    <span className="font-mono">{fmt(ledger.charges.reduce((s, c) => s + c.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Paid</span>
                    <span className="font-mono">-{fmt(paidTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
                    <span>Balance Due</span>
                    <span className="font-mono">{fmt(ledger.balance)}</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
                Thank you for staying with Relax Hotel.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: fixed; inset: 0; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
