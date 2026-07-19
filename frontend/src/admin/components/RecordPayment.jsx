import { useState } from "react";
import { FaTimes, FaCheck, FaUpload } from "react-icons/fa";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 focus:bg-white";
const sel = inp + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5";

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

  const fmt = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;
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

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { Accept: "application/json" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">

        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.bookingNumber} · {booking.guestName}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Total Amount</span>
              <span>{fmt(booking.totalAmountRaw)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Currently Outstanding</span>
              <span className="text-amber-400 font-semibold">{fmt(booking.remainingAmount)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-800">
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
              <option value="online">Mobile Bank Transfer</option>
            </select>
          </div>

          {paymentMethod !== "cash" && (
            <div>
              <label className={lbl}>Transaction / Reference No.</label>
              <input className={inp} placeholder="e.g. TXN-00234"
                value={transactionNo} onChange={(e) => setTransactionNo(e.target.value)} />
            </div>
          )}

          <div>
            <label className={lbl}>Comment</label>
            <textarea className={inp} rows={2} placeholder="Internal note about this payment (optional)"
              value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          {paymentMethod === "online" && (
            <div>
              <label className={lbl}>Upload Transfer Screenshot / Receipt</label>
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/30 transition-all relative bg-slate-50/50">
                {paymentProof ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <FaCheck size={12} />
                    <span className="text-xs font-semibold max-w-[150px] truncate">{paymentProof.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
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
              className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <FaCheck size={12} /> {saving ? "Saving…" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
