import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaDownload,
} from "react-icons/fa";

export default function ReservationManagement() {
  // Mock data accurately modeled from your image_fef29e.jpg screenshot
  const bookings = [
    {
      id: 1,
      bookingNumber: "BK-2026-0001",
      guestName: "Sophia Bennett",
      roomNumber: "103",
      roomType: "Deluxe",
      checkIn: "2026-05-13",
      checkOut: "2026-05-17",
      nights: 4,
      source: "Website",
      status: "Checked-In",
      totalAmount: "$1,363.00",
    },
    {
      id: 2,
      bookingNumber: "BK-2026-0002",
      guestName: "Liam Carter",
      roomNumber: "202",
      roomType: "Executive Room",
      checkIn: "2026-05-14",
      checkOut: "2026-05-16",
      nights: 2,
      source: "Walk-in",
      status: "Checked-In",
      totalAmount: "$410.00",
    },
    {
      id: 3,
      bookingNumber: "BK-2026-0003",
      guestName: "Aisha Rahman",
      roomNumber: "102",
      roomType: "Standard",
      checkIn: "2026-05-16",
      checkOut: "2026-05-19",
      nights: 3,
      source: "Phone",
      status: "Confirmed",
      totalAmount: "$314.00",
    },
    {
      id: 4,
      bookingNumber: "BK-2026-0004",
      guestName: "Noah Williams",
      roomNumber: "301",
      roomType: "Suite",
      checkIn: "2026-05-17",
      checkOut: "2026-05-20",
      nights: 3,
      source: "OTA",
      status: "Reserved",
      totalAmount: "$704.00",
    },
    {
      id: 5,
      bookingNumber: "BK-2026-0005",
      guestName: "Mia Chen",
      roomNumber: "V01",
      roomType: "Villa",
      checkIn: "2026-05-12",
      checkOut: "2026-05-18",
      nights: 6,
      source: "Airbnb",
      status: "Checked-In",
      totalAmount: "$2,122.00",
    },
    {
      id: 6,
      bookingNumber: "BK-2026-0006",
      guestName: "Ethan Brooks",
      roomNumber: "V03",
      roomType: "Villa",
      checkIn: "2026-05-20",
      checkOut: "2026-05-24",
      nights: 4,
      source: "Booking.com",
      status: "Confirmed",
      totalAmount: "$1,632.00",
    },
    {
      id: 7,
      bookingNumber: "BK-2026-0007",
      guestName: "Olivia Martin",
      roomNumber: "101",
      roomType: "Standard",
      checkIn: "2026-05-14",
      checkOut: "2026-05-15",
      nights: 1,
      source: "Direct",
      status: "Checked-Out",
      totalAmount: "$353.00",
    },
  ];

  // Dynamically returns tailored Tailwind badge styles mirroring the layout design colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Checked-In":
        return "bg-green-100 text-green-700 font-bold";
      case "Confirmed":
        return "bg-cyan-100 text-cyan-700 font-bold";
      case "Reserved":
        return "bg-blue-100 text-blue-700 font-bold";
      case "Checked-Out":
        return "bg-slate-100 text-slate-500 font-bold";
      default:
        return "bg-slate-100 text-slate-600 font-bold";
    }
  };

  return (
    <AdminLayout>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Booking / Reservation Management
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Reservations, overlaps, check-in, check-out, status actions, and billing
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition">
          <FaPlus className="text-sm" />
          Add New
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        
        {/* Reservation Custom Filters Panel */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visible columns..."
              className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[130px]">
            <option>All RoomType</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[150px]">
            <option>All BookingStatus</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[155px]">
            <option>All BookingSource</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[150px]">
            <option>All PaymentStatus</option>
          </select>

          <select className="border border-slate-200 bg-white text-sm text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none min-w-[130px]">
            <option>All Property</option>
          </select>
        </div>

        {/* Toolbar Section */}
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm mt-4">
            <thead>
              <tr className="text-slate-500 font-bold uppercase text-xs border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 rounded-l-xl">Booking ID</th>
                <th className="p-4">Booking Number</th>
                <th className="p-4">Guest Name</th>
                <th className="p-4">Room Number</th>
                <th className="p-4">Room Type</th>
                <th className="p-4">Check-In Date</th>
                <th className="p-4">Check-Out Date</th>
                <th className="p-4">Nights</th>
                <th className="p-4">Booking Source</th>
                <th className="p-4 text-center">Booking Status</th>
                <th className="p-4 pr-6 text-right rounded-r-xl">Total Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{booking.id}</td>
                  <td className="p-4 font-mono font-semibold text-slate-700 tracking-tight">
                    {booking.bookingNumber}
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{booking.guestName}</td>
                  <td className="p-4 font-medium text-slate-700">{booking.roomNumber}</td>
                  <td className="p-4 text-slate-600">{booking.roomType}</td>
                  <td className="p-4 text-slate-600">{booking.checkIn}</td>
                  <td className="p-4 text-slate-600">{booking.checkOut}</td>
                  <td className="p-4 text-slate-700 font-medium">{booking.nights}</td>
                  <td className="p-4 text-slate-600">{booking.source}</td>
                  
                  {/* Styled Status Badge */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs tracking-wide ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>

                  {/* Right-aligned pricing */}
                  <td className="p-4 pr-6 text-right font-semibold text-slate-800">
                    {booking.totalAmount}
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