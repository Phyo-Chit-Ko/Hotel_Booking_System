import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddPaymentModal from "../components/AddPaymentModal";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaCreditCard,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";

const METHOD_LABELS = {
  cash: "Cash",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
  online: "Online",
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  // States for search and active multi-filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/payments", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Dynamic calculations for KPI summary section
  const totalRevenue = payments.reduce((sum, item) => sum + item.amount, 0);
  const cardTotal = payments
    .filter((p) => p.paymentMethod === "credit_card")
    .reduce((sum, p) => sum + p.amount, 0);
  const onlineTotal = payments
    .filter((p) => ["online", "bank_transfer"].includes(p.paymentMethod))
    .reduce((sum, p) => sum + p.amount, 0);

  // Advanced compound filtering logic
  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (payment.bookingNumber || "").toLowerCase().includes(term) ||
      (payment.roomNumber || "").toLowerCase().includes(term) ||
      (payment.guestName || "").toLowerCase().includes(term) ||
      (payment.comment && payment.comment.toLowerCase().includes(term));

    const matchesMethod = selectedMethod === "All" || payment.paymentMethod === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  // Badge style aligned with Booking page's getStatusStyle pattern
  const getMethodStyle = (method) => {
    switch (method) {
      case "credit_card":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "cash":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "online":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "bank_transfer":
        return "bg-violet-50 text-violet-700 border border-violet-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xl text-slate-700">
                <FaMoneyBillWave />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gross Collections</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">${totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
                <FaCreditCard />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Card Processing</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">${cardTotal.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
                <FaWallet />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Digital & Alternate</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">${onlineTotal.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Master Card Box Container (Matches Booking Layout) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          {/* Controls Horizontal Row */}
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search booking #, ref #, or context..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
              >
                <option value="All">All Methods</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="online">Online</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>


            <button
              onClick={() => setShowAddModal(true)}
              className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ml-auto"
            >
              <FaPlus className="text-sm" />
              <span>Add New</span>
            </button>
          </div>

          {/* Nested Data Table Box */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Payment ID</th>
                  <th className="px-5 py-3.5 font-medium">Room Number</th>
                  <th className="px-5 py-3.5 font-medium">Guest</th>
                  <th className="px-5 py-3.5 font-medium">Payment Date</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Payment Method</th>
                  <th className="px-5 py-3.5 font-medium">Comment</th>
                  <th className="px-5 py-3.5 font-medium">Handled By</th>
                  <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-sm text-slate-400">Loading payments…</td></tr>
                )}
                {!loading && loadError && (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-sm text-red-500">{loadError}</td></tr>
                )}
                {!loading && !loadError && filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">
                        #{payment.id}
                      </td>

                      <td className="px-5 py-4 font-mono font-medium text-slate-900">
                        {payment.roomNumber || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {payment.guestName || "—"}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {payment.date}
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                        ${payment.amount.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getMethodStyle(payment.paymentMethod)}`}>
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500 max-w-[220px] truncate" title={payment.comment || ""}>
                        {payment.comment || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {payment.handledBy || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition active:scale-95"
                            title="Edit Entry"
                          >
                            Edit
                          </button>
                          <button
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 transition active:scale-95"
                            title="Delete Entry"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (!loading && !loadError && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-sm text-slate-400">
                      No matching historical payments or ledger records discovered.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        <AddPaymentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={() => loadPayments()}
        />
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
