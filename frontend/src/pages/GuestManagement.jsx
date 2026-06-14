import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaDownload,
} from "react-icons/fa";

export default function GuestManagement() {
  // Mock data extracted directly from your image_ff4fbd.jpg screenshot
  const guests = [
    {
      id: 1,
      name: "Sophia Bennett",
      phone: "+1 555 2011",
      email: "sophia@example.com",
      nationality: "United States",
      idType: "Passport",
      idNumber: "P8492011",
      docFront: "View",
      docBack: "Missing",
      vip: true,
    },
    {
      id: 2,
      name: "Liam Carter",
      phone: "+1 555 2022",
      email: "liam@example.com",
      nationality: "United States",
      idType: "Driving License",
      idNumber: "DL92022",
      docFront: "Missing",
      docBack: "Missing",
      vip: false,
    },
    {
      id: 3,
      name: "Aisha Rahman",
      phone: "+44 20 5550 3030",
      email: "aisha@example.co.uk",
      nationality: "United Kingdom",
      idType: "Passport",
      idNumber: "UK33711",
      docFront: "Missing",
      docBack: "Missing",
      vip: true,
    },
    {
      id: 4,
      name: "Noah Williams",
      phone: "+1 555 2044",
      email: "noah@example.com",
      nationality: "United States",
      idType: "Passport",
      idNumber: "P112044",
      docFront: "Missing",
      docBack: "Missing",
      vip: false,
    },
    {
      id: 5,
      name: "Mia Chen",
      phone: "+65 555 2055",
      email: "mia@example.sg",
      nationality: "Singapore",
      idType: "Passport",
      idNumber: "SG552055",
      docFront: "Missing",
      docBack: "Missing",
      vip: false,
    },
    {
      id: 6,
      name: "Ethan Brooks",
      phone: "+1 555 2066",
      email: "ethan@example.com",
      nationality: "United States",
      idType: "National ID",
      idNumber: "US2066",
      docFront: "Missing",
      docBack: "Missing",
      vip: false,
    },
    {
      id: 7,
      name: "Olivia Martin",
      phone: "+33 1 5555 2077",
      email: "olivia@example.fr",
      nationality: "France",
      idType: "Passport",
      idNumber: "FR2077",
      docFront: "Missing",
      docBack: "Missing",
      vip: true,
    },
  ];

  return (
    <AdminLayout>
      {/* Header Banner - Matches image_ff4fbd.jpg styling */}
      <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Guest Management</h1>
          <p className="text-slate-500 mt-2 text-base">
            Guest profiles, tax details, ID documents, preferences, and history
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition">
          <FaPlus className="text-sm" />
          Add New
        </button>
      </div>

      {/* Main Container for Filtering & Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        
        {/* Filters Grid */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visible columns..."
              className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[140px]">
            <option>All Nationality</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[130px]">
            <option>All IDType</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[110px]">
            <option>All VIP</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[140px]">
            <option>All Blacklist</option>
          </select>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex gap-2.5 pb-6 border-b border-slate-100">
          <button className="border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 flex items-center gap-2 transition">
            <FaFileExport className="text-slate-500" /> Export
          </button>

          <button className="border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 flex items-center gap-2 transition">
            <FaDownload className="text-slate-500" /> Template
          </button>

          <button className="border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 flex items-center gap-2 transition">
            <FaFileImport className="text-slate-500" /> Import
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm mt-4">
            <thead>
              <tr className="text-slate-500 font-bold uppercase text-xs border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 rounded-l-xl">Guest ID</th>
                <th className="p-4">Guest Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Nationality</th>
                <th className="p-4">ID Type</th>
                <th className="p-4">ID Number</th>
                <th className="p-4 text-center">ID Document Front</th>
                <th className="p-4 text-center">ID Document Back</th>
                <th className="p-4 text-center rounded-r-xl">VIP</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{guest.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{guest.name}</td>
                  <td className="p-4 text-slate-600">{guest.phone}</td>
                  <td className="p-4 text-slate-600">{guest.email}</td>
                  <td className="p-4 text-slate-700">{guest.nationality}</td>
                  <td className="p-4 text-slate-600">{guest.idType}</td>
                  <td className="p-4 text-slate-700 font-mono tracking-tight">{guest.idNumber}</td>
                  
                  {/* Document Front Badge */}
                  <td className="p-4 text-center">
                    {guest.docFront === "View" ? (
                      <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition">
                        View
                      </button>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                        Missing
                      </span>
                    )}
                  </td>

                  {/* Document Back Badge */}
                  <td className="p-4 text-center">
                    {guest.docBack === "View" ? (
                      <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition">
                        View
                      </button>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                        Missing
                      </span>
                    )}
                  </td>

                  {/* VIP Status Badge */}
                  <td className="p-4 text-center">
                    {guest.vip ? (
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-extrabold tracking-wider">
                        YES
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-xs font-extrabold tracking-wider">
                        NO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}