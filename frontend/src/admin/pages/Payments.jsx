import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddPaymentModal from "../components/AddPaymentModal";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaDownload,
  FaTrash,
  FaEdit,
  FaCreditCard,
  FaMoneyBillWave,
  FaWallet,
  FaInfoCircle
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
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  // States for search and active multi-filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");

  // Dynamic calculations for KPI summary section
  const totalRevenue = payments.reduce((sum, item) => sum + item.amount, 0);
  const cardTotal = payments.filter(p => p.payment_method === "Card").reduce((sum, p) => sum + p.amount, 0);
  const onlineTotal = payments.filter(p => ["Online", "UPI", "Bank Transfer"].includes(p.payment_method)).reduce((sum, p) => sum + p.amount, 0);

  // Advanced compound filtering logic
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.reservation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMethod = selectedMethod === "All" || payment.payment_method === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  // Dynamic tag colors for payment types
  const getMethodBadgeColor = (method) => {
    switch (method) {
      case "Card": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Cash": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Online": case "UPI": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payments & Invoices</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track financial transactions, collections, and printable ledger statements.</p>
          </div>
          <div className="flex items-center gap-3">
            
            <button
  onClick={() => setShowAddModal(true)}
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition rounded-xl shadow-sm shadow-amber-500/10"
>
  <FaPlus />
  Add New
</button>
          </div>
        </div>

        {/* Smart Addition: Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <FaMoneyBillWave />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gross Collections</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">${totalRevenue.toFixed(2)}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <FaCreditCard />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Card Processing</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">${cardTotal.toFixed(2)}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              <FaWallet />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Digital & Alternate</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">${onlineTotal.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Filter and Control Operations Panel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Booking #, Ref #, or context..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="text-xs font-semibold text-slate-400 uppercase">Method:</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 transition text-slate-700 font-medium cursor-pointer"
            >
              <option value="All">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Enterprise Data Grid Matrix */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-slate-50/40 transition group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-400">#{payment.payment_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{payment.reservation_id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{payment.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getMethodBadgeColor(payment.payment_method)}`}>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500 tracking-tight">{payment.transaction_no}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                          {payment.description && (
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition" title={payment.description}>
                              <FaInfoCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit Entry">
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Entry">
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
            console.log(paymentData);

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