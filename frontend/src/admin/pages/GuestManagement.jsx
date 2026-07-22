import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";
import axios from "axios";
 
const BACKEND_URL = "http://localhost:8000";
 
export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const [search, setSearch] = useState("");
  const [nationality, setNationality] = useState("");
  const [idType, setIdType] = useState("");
  const [vip, setVip] = useState("");
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
 
  // Image preview modal state
  const [previewImage, setPreviewImage] = useState(null); // { url, label }
 
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
        docFrontUrl: g.id_front_path ? `${BACKEND_URL}/storage/${g.id_front_path}` : null,
        docBackUrl: g.id_back_path ? `${BACKEND_URL}/storage/${g.id_back_path}` : null,
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
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
 
            <div className="h-11 relative">
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="h-full pl-4 pr-9 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none cursor-pointer box-border"
              >
                <option value="">All Nationality</option>
                {[...new Set(guests.map((g) => g.nationality))].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
 
            <div className="h-11 relative">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="h-full pl-4 pr-9 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none cursor-pointer box-border"
              >
                <option value="">All IDType</option>
                {[...new Set(guests.map((g) => g.idType))].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
 
            <div className="h-11 relative">
              <select
                value={vip}
                onChange={(e) => setVip(e.target.value)}
                className="h-full pl-4 pr-9 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none cursor-pointer box-border"
              >
                <option value="">All VIP</option>
                <option value="true">VIP Only</option>
                <option value="false">Non-VIP</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
 
            <div className="flex-1" />
          </div>
 
          {/* Table Area */}
          <div className="border border-slate-100 rounded-xl">
            {loading ? (
              <p className="p-6 text-slate-500 text-sm">Loading guests...</p>
            ) : error ? (
              <p className="p-6 text-red-500 text-sm">{error}</p>
            ) : paginatedGuests.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No guests found.</p>
            ) : (
              <table className="w-full table-fixed text-left text-sm text-slate-600 border-collapse">
                <colgroup>
                  <col style={{ width: "3%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "7%" }} />
                </colgroup>
                <thead>
                  <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3.5">ID</th>
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
                        <td className="px-5 py-4 font-semibold text-slate-900 truncate" title={guest.name}>{guest.name}</td>
                        <td className="px-5 py-4 text-slate-600 truncate" title={guest.phone}>{guest.phone}</td>
                        <td className="px-5 py-4 text-slate-600 truncate" title={guest.email}>{guest.email}</td>
                        <td className="px-5 py-4 text-slate-700 truncate" title={guest.nationality}>{guest.nationality}</td>
                        <td className="px-5 py-4 text-slate-600 truncate" title={guest.idType}>{guest.idType}</td>
                        <td className="px-5 py-4 text-slate-700 font-mono tracking-tight truncate" title={guest.idNumber}>{guest.idNumber}</td>
                        <td className="px-5 py-4 text-center">
                          {guest.docFront === "View" ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: guest.docFrontUrl, label: `${guest.name} — ID Front` })}
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
 
                        <td className="px-5 py-4 text-center">
                          {guest.docBack === "View" ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: guest.docBackUrl, label: `${guest.name} — ID Back` })}
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
 
          {/* Pagination Controls Footer */}
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
 
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">{previewImage.label}</p>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950/40">
              <img
                src={previewImage.url}
                alt={previewImage.label}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
 