import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast"; // ✅ Added the notification engine anchor

export default function AdminLayout({ children }) {
  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Global toast notifications config listener wrapper */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          // Optional nice custom styles to match your clean slate/blue UI layout theme
          className: 'text-sm font-medium text-slate-800 rounded-xl bg-white shadow-md border border-slate-50',
          duration: 4000,
        }}
      />

      <Sidebar />

      <div className="ml-72">
        <Navbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}