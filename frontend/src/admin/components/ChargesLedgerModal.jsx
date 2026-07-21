import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaMoneyBillWave, FaExchangeAlt, FaSignOutAlt, FaPrint } from "react-icons/fa";
import InvoiceView from "./InvoiceView";
import { formatCurrency as fmt } from "../../utils/currency";
import { authHeaders } from "../../utils/apiHeaders";
import Swal from "sweetalert2";

/**
 * "Check Balance" modal — the itemized charges/payments ledger for a
 * reservation (GET /api/reservations/{id}/ledger). Always available from
 * the Balance column, and reused as the checkout-gating surface: pass
 * mode="checkout" to enable the checkout confirm button — which stays
 * disabled and shows an error alert until the balance (room charges + extra
 * charges) is fully paid. There is no override.
 */
export default function ChargesLedgerModal({
  booking,
  onClose,
  onMakePayment,
  refreshKey = 0,
  mode = "view",
  onCheckedOut,
}) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Load ledger details
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reservations/${booking.id}/ledger`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load charges.");
      setLedger(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [booking.id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Lock background window body scroll while the modal is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleConfirmCheckout = async () => {
    if ((ledger?.balance || 0) > 0) {
      Swal.fire({
        icon: "error",
        title: "Balance not fully settled",
        text: `Cannot check out — ${fmt(ledger.balance)} is still outstanding. Record the remaining payment first.`,
      });
      return;
    }
    setCheckoutSaving(true);
    try {
      const res = await fetch(`/api/reservations/${booking.id}/check-out`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Cannot check out",
          text: data.message || "Failed to check out.",
        });
        return;
      }
      onCheckedOut(data.booking);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cannot check out", text: err.message });
    } finally {
      setCheckoutSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 border-b border-slate-800 shrink-0">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
            Ledger
          </span>
          <h2 className="text-white text-lg font-black tracking-tight">Check Balance</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.bookingNumber} · {booking.guestName} · Room {booking.roomNumber}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Content (Scrollbar hidden via CSS utility class) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar">
          {loading && <p className="text-sm text-slate-500 text-center py-6">Loading…</p>}
          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {!loading && !error && ledger && (
            <>
              {ledger.movedFrom && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <FaExchangeAlt size={12} className="flex-shrink-0" />
                  <span>
                    Moved from Room {ledger.movedFrom.roomNumber} (Reservation #{ledger.movedFrom.reservationId})
                    {ledger.movedFrom.reason ? ` — ${ledger.movedFrom.reason}` : ""}
                  </span>
                </div>
              )}

              {/* Charges Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Charges</h3>
                <div className="border border-slate-700/40 rounded-xl divide-y divide-slate-800 bg-slate-800/20">
                  {ledger.charges.length === 0 && (
                    <p className="text-sm text-slate-500 px-4 py-3">No charges recorded.</p>
                  )}
                  {ledger.charges.map((c) => (
                    <div key={`charge-${c.id}`} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <div>
                        <p className="text-slate-200 font-medium">{c.description}</p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                          {c.chargeType.replace("_", " ")}
                        </p>
                      </div>
                      <span className={`font-mono font-semibold ${c.amount < 0 ? "text-red-400" : "text-slate-200"}`}>
                        {c.amount < 0 ? "-" : ""}
                        {fmt(Math.abs(c.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payments</h3>
                <div className="border border-slate-700/40 rounded-xl divide-y divide-slate-800 bg-slate-800/20">
                  {ledger.payments.length === 0 && (
                    <p className="text-sm text-slate-500 px-4 py-3">No payments recorded yet.</p>
                  )}
                  {ledger.payments.map((p) => (
                    <div key={`payment-${p.id}`} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <div>
                        <p className="text-slate-200 font-medium">{p.description || "Payment"}</p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                          {(p.method || "").replace("_", " ")} · {p.date}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-emerald-400">-{fmt(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Due Row */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Balance Due</span>
                <span className={`text-lg font-bold ${ledger.balance > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {fmt(ledger.balance)}
                </span>
              </div>

              {/* Outstanding balance blocks checkout entirely — no override */}
              {mode === "checkout" && ledger.balance > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-4 py-3 rounded-xl">
                  Checkout is blocked until the balance is fully paid. Use "Make Payment" below to record the remaining {fmt(ledger.balance)}.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 pt-4 border-t border-slate-800 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all"
          >
            Close
          </button>
          {!loading && !error && ledger && (
            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaPrint size={12} /> Print Invoice
            </button>
          )}
          {ledger && ledger.balance > 0 && onMakePayment && (
            <button
              type="button"
              onClick={() => onMakePayment(booking)}
              className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaMoneyBillWave size={12} /> Make Payment
            </button>
          )}
          {mode === "checkout" && (
            <button
              type="button"
              onClick={handleConfirmCheckout}
              disabled={checkoutSaving || loading || ledger?.balance > 0}
              title={ledger?.balance > 0 ? "Settle the outstanding balance before checking out" : undefined}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaSignOutAlt size={12} />
              {checkoutSaving ? "Checking out…" : "Confirm Check-Out"}
            </button>
          )}
        </div>
      </div>

      {showInvoice && <InvoiceView booking={booking} onClose={() => setShowInvoice(false)} />}
    </div>
  );
}