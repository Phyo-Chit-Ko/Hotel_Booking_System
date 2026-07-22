import { useState } from "react";
import { FaTimes, FaCheck, FaUpload } from "react-icons/fa";
import { formatCurrency as fmt } from "../../utils/currency";
import { authHeaders, apiUrl } from "../../utils/apiHeaders";

const inp =
  "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all";
const sel =
  inp +
  " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 ml-0.5";

/**
 * Lightweight, standalone payment recorder. Unlike the payment step baked
 * into AddReservation's wizard, this isn't tied to check-in or booking
 * creation — it can be opened from any reservation row, any status, any
 * date (e.g. collecting a deposit weeks before arrival, or settling a
 * balance after checkout).
 *
 * Talks to the same POST /api/payments endpoint AddReservation already
 * uses, and expects the same { booking: <table row> } response shape.
 */
export default function RecordPayment({ booking, onClose, onSaved }) {
  const [amount, setAmount] = useState(
    booking.remainingAmount > 0 ? booking.remainingAmount.toFixed(2) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionNo, setTransactionNo] = useState("");
  const [comment, setComment] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const balanceAfter = Math.max(0, (booking.remainingAmount || 0) - amountNum);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (amountNum <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("reservationId", booking.id);
      payload.append("depositAmount", amount);
      payload.append("paymentMethod", paymentMethod);
      if (transactionNo) payload.append("transactionNo", transactionNo);
      if (comment.trim()) payload.append("comment", comment.trim());
      if (paymentProof) payload.append("paymentProof", paymentProof);

      const res = await fetch(apiUrl("/api/payments"), {
        method: "POST",
        headers: authHeaders(),
        body: payload,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to record payment");
      const data = await res.json();

      onSaved(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">

        <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 border-b border-slate-800">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
            Payment
          </span>
          <h2 className="text-white text-lg font-black tracking-tight">Record Payment</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.bookingNumber} · {booking.guestName}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

       <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Total Amount</span>
              <span className="text-slate-200 font-medium">{fmt(booking.totalAmountRaw)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Currently Outstanding</span>
              <span className="text-amber-400 font-semibold">{fmt(booking.remainingAmount)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-800 text-slate-200">
              <span>Balance After This Payment</span>
              <span className={balanceAfter === 0 ? "text-emerald-400" : "text-amber-400"}>
                {fmt(balanceAfter)}
              </span>
            </div>
          </div>

          <div>
            <label className={lbl}>Amount *</label>
            <input
              className={inp}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={lbl}>Payment Method *</label>
            <select className={sel} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="online">Mobile Wallet (K-Pay/Wave Pay)</option>
            </select>
          </div>

          {paymentMethod !== "cash" && (
            <div>
              <label className={lbl}>Transaction / Reference No.</label>
              <input className={inp} placeholder="e.g. TXN-00234"
                value={transactionNo} onChange={(e) => setTransactionNo(e.target.value)} />
            </div>
          )}


          {paymentMethod === "online" && (
            <div>
              <label className={lbl}>Upload Transfer Screenshot / Receipt</label>
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all relative bg-slate-800/40">
                {paymentProof ? (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    <FaCheck size={12} />
                    <span className="text-xs font-semibold max-w-[150px] truncate">{paymentProof.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <FaUpload size={14} />
                    <span className="text-xs font-medium">Upload Proof</span>
                  </div>
                )}
                <input type="file" accept="image/*,.pdf"
                  onChange={(e) => setPaymentProof(e.target.files[0])}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <FaCheck size={12} /> {saving ? "Saving…" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}