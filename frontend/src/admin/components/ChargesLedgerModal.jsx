import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaMoneyBillWave, FaExchangeAlt, FaSignOutAlt, FaPrint } from "react-icons/fa";
import InvoiceView from "./InvoiceView";

const fmt = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;

/**
 * "Check Balance" modal — the itemized charges/payments ledger for a
 * reservation (GET /api/reservations/{id}/ledger). Always available from
 * the Balance column, and reused as the checkout-gating surface: pass
 * mode="checkout" to show the "Check Out Anyway" control (requires a reason
 * once balance > 0).
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
  const [overrideReason, setOverrideReason] = useState("");
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reservations/${booking.id}/ledger`, {
        headers: { Accept: "application/json" },
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

  const handleCheckOutAnyway = async () => {
    setCheckoutError("");
    if ((ledger?.balance || 0) > 0 && !overrideReason.trim()) {
      setCheckoutError("Enter a reason to check out with an outstanding balance.");
      return;
    }
    setCheckoutSaving(true);
    try {
      const res = await fetch(`/api/reservations/${booking.id}/check-out`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ reason: overrideReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check out.");
      onCheckedOut(data.booking);
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Check Balance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.bookingNumber} · {booking.guestName} · Room {booking.roomNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {loading && <p className="text-sm text-slate-400 text-center py-6">Loading…</p>}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {!loading && !error && ledger && (
            <>
              {ledger.movedFrom && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <FaExchangeAlt size={12} className="flex-shrink-0" />
                  <span>
                    Moved from Room {ledger.movedFrom.roomNumber} (Reservation #{ledger.movedFrom.reservationId})
                    {ledger.movedFrom.reason ? ` — ${ledger.movedFrom.reason}` : ""}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Charges</h3>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {ledger.charges.length === 0 && (
                    <p className="text-sm text-slate-400 px-4 py-3">No charges recorded.</p>
                  )}
                  {ledger.charges.map((c) => (
                    <div key={`charge-${c.id}`} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <div>
                        <p className="text-slate-800 font-medium">{c.description}</p>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                          {c.chargeType.replace("_", " ")}
                        </p>
                      </div>
                      <span className={`font-mono font-semibold ${c.amount < 0 ? "text-red-500" : "text-slate-900"}`}>
                        {c.amount < 0 ? "-" : ""}
                        {fmt(Math.abs(c.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payments</h3>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {ledger.payments.length === 0 && (
                    <p className="text-sm text-slate-400 px-4 py-3">No payments recorded yet.</p>
                  )}
                  {ledger.payments.map((p) => (
                    <div key={`payment-${p.id}`} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <div>
                        <p className="text-slate-800 font-medium">{p.description || "Payment"}</p>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                          {(p.method || "").replace("_", " ")} · {p.date}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-emerald-600">-{fmt(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold">Balance Due</span>
                <span className={`text-lg font-bold ${ledger.balance > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {fmt(ledger.balance)}
                </span>
              </div>

              {mode === "checkout" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {checkoutError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                      {checkoutError}
                    </div>
                  )}
                  {ledger.balance > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">
                        Reason for checking out with a balance *
                      </label>
                      <input
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 bg-slate-50/50"
                        placeholder="e.g. Guest will settle balance by mail"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all"
          >
            Close
          </button>
          {!loading && !error && ledger && (
            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaPrint size={12} /> Print Invoice
            </button>
          )}
          {ledger && ledger.balance > 0 && onMakePayment && (
            <button
              type="button"
              onClick={() => onMakePayment(booking)}
              className="flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaMoneyBillWave size={12} /> Make Payment
            </button>
          )}
          {mode === "checkout" && (
            <button
              type="button"
              onClick={handleCheckOutAnyway}
              disabled={checkoutSaving || loading}
              className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaSignOutAlt size={12} />
              {checkoutSaving ? "Checking out…" : ledger?.balance > 0 ? "Check Out Anyway" : "Confirm Check-Out"}
            </button>
          )}
        </div>
      </div>

      {showInvoice && <InvoiceView booking={booking} onClose={() => setShowInvoice(false)} />}
    </div>
  );
}
