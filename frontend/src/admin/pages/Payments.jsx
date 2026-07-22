import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddPaymentModal from "../components/AddPaymentModal";
import { useAuth } from "../../context/AuthContext";
import {
  FaSearch,
  FaMoneyBillWave,
  FaTrash,
  FaCreditCard,
  FaWallet,
  FaPlus,
  FaChevronDown,
} from "react-icons/fa";
import { formatCurrency } from "../../utils/currency";
import { authHeaders as getAuthHeaders } from "../../utils/apiHeaders";
 
const BACKEND_URL = "http://localhost:8000";
 
const METHOD_LABELS = {
  cash: "Cash",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
  online: "Mobile Wallet (K-Pay/Wave Pay)",
};
 
const PaymentManagement = () => {
  const { user } = useAuth();
  const canWrite = (user?.role || "").toLowerCase() === "manager";
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // NEW: proof preview popup
 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
 
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/payments", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
 
      const mapped = (data.payments || []).map((p) => ({
        ...p,
        amount: Number(p.amount || 0),
        proofUrl: p.proofPath ? `${BACKEND_URL}/storage/${p.proofPath}` : null,
      }));
      setPayments(mapped);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMethod]);
 
  const grossCollections = payments
    .filter((p) => !selectedMonth || (p.date || "").slice(0, 7) === selectedMonth)
    .filter((p) => selectedMethod === "All" || p.paymentMethod === selectedMethod)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
 
  const totalRevenue = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cardTotal = payments
    .filter((p) => p.paymentMethod === "credit_card")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const onlineTotal = payments
    .filter((p) => ["online", "bank_transfer"].includes(p.paymentMethod))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
 
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
 
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
 
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-2xl text-slate-700">
              <FaMoneyBillWave />
            </div>
 
            {/* Text */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Gross Collections
                {selectedMethod !== "All"
                  ? ` · ${METHOD_LABELS[selectedMethod] || selectedMethod}`
                  : ""}
              </p>
 
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                {formatCurrency(grossCollections)}
              </h3>
            </div>
          </div>
 
          {/* Right Side */}
          <div className=" w-[305px] h-11">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className=" h-11 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 [color-scheme:light]"
            />
          </div>
        </div>
 
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search ...."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>
 
            <div className="h-11 relative">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="h-full pl-4 pr-9 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none cursor-pointer box-border"
              >
                <option value="All">All Methods</option>
                <option value="cash">Cash</option>
                <option value="online">Mobile Wallet (K-Pay/Wave Pay)</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
 
            <div className="flex-1" />
 
            {canWrite && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="h-11 px-4 flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
              >
                <FaPlus className="w-2.5 h-2.5" /> Add Payment
              </button>
            )}
          </div>
 
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">ID</th>
                  <th className="px-5 py-3.5 font-medium">Room Number</th>
                  <th className="px-5 py-3.5 font-medium">Guest</th>
                  <th className="px-5 py-3.5 font-medium">Payment Date</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Payment Method</th>
                  <th className="px-5 py-3.5 font-medium text-center">Proof</th>
                  <th className="px-5 py-3.5 font-medium">Handled By</th>
                </tr>
              </thead>
 
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan="10" className="px-6 py-12 text-center text-sm text-slate-400">Loading payments…</td></tr>
                )}
                {!loading && loadError && (
                  <tr><td colSpan="10" className="px-6 py-12 text-center text-sm text-red-500">{loadError}</td></tr>
                )}
                {!loading && !loadError && paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-slate-900">
                          {rowNumber}
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
                          {formatCurrency(payment.amount)}
                        </td>
 
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getMethodStyle(payment.paymentMethod)}`}>
                            {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                          </span>
                        </td>
 
                        <td className="px-5 py-4 text-center">
                          {payment.proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewUrl(payment.proofUrl)}
                              className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition"
                            >
                              View
                            </button>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                              Missing
                            </span>
                          )}
                        </td>
 
                        <td className="px-5 py-4 text-slate-500">
                          {payment.handledBy || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (!loading && !loadError && (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-sm text-slate-400">
                      No matching historical payments or ledger records discovered.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {!loading && !loadError && filteredPayments.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg border transition ${
                      page === currentPage
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
 
      <AddPaymentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={() => {
          setShowAddModal(false);
          loadPayments();
        }}
      />
 
      {/* Proof preview popup — shows the screenshot/receipt in-page instead of a new tab */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Payment Proof</h3>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50">
              {previewUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe src={previewUrl} title="Payment proof" className="w-full h-[70vh]" />
              ) : (
                <img
                  src={previewUrl}
                  alt="Payment proof"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
 
export default PaymentManagement;
 