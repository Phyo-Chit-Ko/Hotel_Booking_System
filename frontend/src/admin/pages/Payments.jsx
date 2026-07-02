import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddPaymentModal from "../components/AddPaymentModal";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCreditCard,
  FaMoneyBillWave,
  FaWallet,
  FaInfoCircle,
} from "react-icons/fa";

const PaymentManagement = () => {
  // Mock data accurately mapping to your Laravel Migration schema
  const [payments, setPayments] = useState([
    {
      payment_id: 1,
      reservation_id: "BK-2026-0001", // Representing the constrained relationship
      amount: 300.00,
      payment_method: "Card",
      date: "2026-05-13",
      transaction_no: "CARD-3001",
      description: "Advance registration deposit",
    },
    {
      payment_id: 2,
      reservation_id: "BK-2026-0002",
      amount: 200.00,
      payment_method: "Cash",
      date: "2026-05-14",
      transaction_no: "CASH-2002",
      description: "Room service checkout charges",
    },
    {
      payment_id: 3,
      reservation_id: "BK-2026-0005",
      amount: 1000.00,
      payment_method: "Online",
      date: "2026-05-12",
      transaction_no: "ONLINE-5005",
      description: "Full suite booking upfront payment",
    },
    {
      payment_id: 4,
      reservation_id: "BK-2026-0006",
      amount: 500.00,
      payment_method: "Bank Transfer",
      date: "2026-05-14",
      transaction_no: "BANK-6006",
      description: "Corporate event reservation balance",
    },
    {
      payment_id: 5,
      reservation_id: "BK-2026-0007",
      amount: 105.00,
      payment_method: "UPI",
      date: "2026-05-15",
      transaction_no: "UPI-7007",
      description: "Extra bed add-on",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  // States for search and active multi-filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");

  // Dynamic calculations for KPI summary section
  const totalRevenue = payments.reduce((sum, item) => sum + item.amount, 0);
  const cardTotal = payments
    .filter((p) => p.payment_method === "Card")
    .reduce((sum, p) => sum + p.amount, 0);
  const onlineTotal = payments
    .filter((p) => ["Online", "UPI", "Bank Transfer"].includes(p.payment_method))
    .reduce((sum, p) => sum + p.amount, 0);

  // Advanced compound filtering logic
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.reservation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.description &&
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = selectedMethod === "All" || payment.payment_method === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  // Badge style aligned with Booking page's getStatusStyle pattern
  const getMethodStyle = (method) => {
    switch (method) {
      case "Card":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Cash":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Online":
      case "UPI":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Bank Transfer":
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
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

           
            <button
              onClick={() => setIsModalOpen(true)}
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
                  <th className="px-5 py-3.5 font-medium">Booking Number</th>
                  <th className="px-5 py-3.5 font-medium">Payment Date</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Payment Method</th>
                  <th className="px-5 py-3.5 font-medium">Reference Number</th>
                  <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">
                        #{payment.payment_id}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-900">
                        {payment.reservation_id}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {payment.date}
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                        ${payment.amount.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getMethodStyle(payment.payment_method)}`}>
                          {payment.payment_method}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {payment.transaction_no}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {payment.description && (
                            <button
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                              title={payment.description}
                            >
                              <FaInfoCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                      No matching historical payments or ledger records discovered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        <AddPaymentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={(paymentData) => {
            setPayments((prev) => [
              ...prev,
              {
                payment_id: prev.length + 1,
                ...paymentData,
              },
            ]);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
