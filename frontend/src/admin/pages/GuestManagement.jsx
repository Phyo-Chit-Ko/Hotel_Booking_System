import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
} from "react-icons/fa";
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

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/guests", {
        params: {
          search: search || undefined,
          nationality: nationality || undefined,
          id_type: idType || undefined,
          vip: vip || undefined,
        },
      });

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

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchGuests();
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap gap-3 items-center mb-4"
        >
          <div className="relative flex-1 min-w-[240px]">
            <FaSearch className="absolute right-4 top-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Guest Name.."
              className="pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[140px]"
          >
            <option value="">All Nationality</option>
            {[...new Set(guests.map((g) => g.nationality))].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[130px]"
          >
            <option value="">All IDType</option>
            {[...new Set(guests.map((g) => g.idType))].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={vip}
            onChange={(e) => setVip(e.target.value)}
            className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[110px]"
          >
            <option value="">All VIP</option>
            <option value="true">VIP Only</option>
            <option value="false">Non-VIP</option>
          </select>

          <button
            type="submit"
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            Apply
          </button>
        </form>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-6 text-slate-500 text-sm">Loading guests...</p>
          ) : error ? (
            <p className="p-6 text-red-500 text-sm">{error}</p>
          ) : guests.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm">No guests found.</p>
          ) : (
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

                    <td className="p-4 text-center">
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

                    <td className="p-4 text-center">
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
}