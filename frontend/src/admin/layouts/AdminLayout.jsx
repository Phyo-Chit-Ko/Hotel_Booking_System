import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast"; // ✅ Added the notification engine anchor

export default function AdminLayout({ children }) {
  // Sidebar is an off-canvas drawer below the lg breakpoint (toggled via the
  // Navbar hamburger) and a permanently-visible fixed rail at lg+.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Global toast notifications config listener wrapper */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Optional nice custom styles to match your clean slate/blue UI layout theme
          className: 'text-sm font-medium text-slate-800 rounded-xl bg-white shadow-md border border-slate-50',
          duration: 4000,
        }}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}