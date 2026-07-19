import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

// const BACKEND_URL = "http://localhost:8000";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [nationality, setNationality] = useState("");
  const [idType, setIdType] = useState("");
  const [vip, setVip] = useState("");

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/guests");

      const mapped = res.data.map((g) => ({
        id: g.guest_id,
        name: `${g.first_name} ${g.last_name}`,
        phone: g.phone,
        email: g.email,
        nationality: g.nationality,
        idType: g.id_type,
        idNumber: g.id_number,
        docFront: g.id_front_path ? "View" : "Missing",
        docBack: g.id_back_path ? "View" : "Missing",

        // Absolute URLs pointing straight to your Laravel server assets
        // docFrontUrl: g.id_front_path ? `${BACKEND_URL}/storage/${g.id_front_path}` : null,
        // docBackUrl: g.id_back_path ? `${BACKEND_URL}/storage/${g.id_back_path}` : null,
        docFrontUrl: g.id_front_path ? `${API_BASE_URL}/storage/${g.id_front_path}` : null,
        docBackUrl: g.id_back_path ? `${API_BASE_URL}/storage/${g.id_back_path}` : null,

        vip: !!g.is_vip,
      }));

      setGuests(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load guests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // 2. Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, nationality, idType, vip]);

  const filteredGuests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return guests.filter((guest) => {
      const matchesSearch = !term || guest.name.toLowerCase().includes(term);
      const matchesNationality = !nationality || guest.nationality === nationality;
      const matchesIdType = !idType || guest.idType === idType;
      const matchesVip = !vip || String(guest.vip) === vip;
      return matchesSearch && matchesNationality && matchesIdType && matchesVip;
    });
  }, [guests, search, nationality, idType, vip]);

  // 3. Calculate total pages and slice the data for the current page
  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / itemsPerPage));
  const paginatedGuests = useMemo(() => {
    return filteredGuests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredGuests, currentPage]);

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          {/* Filters Area */}
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Guest Name.."
                className="w-full h-full border border-slate-300 rounded-xl pl-11 pr-4 text-sm text-slate-700 bg-white shadow-sm focus:outline-none  focus:ring-amber-500 box-border"
              />
              
            </div>

            <div className="h-11">
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
              >
                <option value="">All Nationality</option>
                {[...new Set(guests.map((g) => g.nationality))].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="h-11">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
              >
                <option value="">All IDType</option>
                {[...new Set(guests.map((g) => g.idType))].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="h-11">
              <select
                value={vip}
                onChange={(e) => setVip(e.target.value)}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
              >
                <option value="">All VIP</option>
                <option value="true">VIP Only</option>
                <option value="false">Non-VIP</option>
              </select>
            </div>

            <div className="flex-1" />
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            {loading ? (
              <p className="p-6 text-slate-500 text-sm">Loading guests...</p>
            ) : error ? (
              <p className="p-6 text-red-500 text-sm">{error}</p>
            ) : paginatedGuests.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No guests found.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3.5">Guest ID</th>
                    <th className="px-5 py-3.5">Guest Name</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Nationality</th>
                    <th className="px-5 py-3.5">ID Type</th>
                    <th className="px-5 py-3.5">ID Number</th>
                    <th className="px-5 py-3.5 text-center">ID Document Front</th>
                    <th className="px-5 py-3.5 text-center">ID Document Back</th>
                    <th className="px-5 py-3.5 text-center">VIP</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedGuests.map((guest, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={guest.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 text-slate-500 font-medium font-mono">{rowNumber}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{guest.name}</td>
                        <td className="px-5 py-4 text-slate-600">{guest.phone}</td>
                        <td className="px-5 py-4 text-slate-600">{guest.email}</td>
                        <td className="px-5 py-4 text-slate-700">{guest.nationality}</td>
                        <td className="px-5 py-4 text-slate-600">{guest.idType}</td>
                        <td className="px-5 py-4 text-slate-700 font-mono tracking-tight">{guest.idNumber}</td>

                        <td className="px-5 py-4 text-center">
                          {guest.docFront === "View" ? (
                            <a
                              href={guest.docFrontUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition"
                            >
                              View
                            </a>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                              Missing
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {guest.docBack === "View" ? (
                            <a
                              href={guest.docBackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition"
                            >
                              View
                            </a>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                              Missing
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 4. Pagination Controls Footer */}
          {!loading && !error && filteredGuests.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, filteredGuests.length)} of {filteredGuests.length}
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
    </AdminLayout>
  );
}