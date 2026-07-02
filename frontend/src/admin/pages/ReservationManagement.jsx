import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddReservation from "../components/addReservation";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
} from "react-icons/fa";

export default function ReservationManagement() {
  // Helper function to generate today's date string in strict YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [bookings, setBookings] = useState([
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
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString()); // Managed date state

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Checked-In":
        return "bg-green-50 text-green-700 border border-green-100 font-medium";
      case "Confirmed":
        return "bg-cyan-50 text-cyan-700 border border-cyan-100 font-medium";
      case "Reserved":
        return "bg-blue-50 text-blue-700 border border-blue-100 font-medium";
      case "Checked-Out":
        return "bg-slate-50 text-slate-500 border border-slate-100 font-medium";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100 font-medium";
    }
  };

  const handleSaveReservation = (newReservationData) => {
    const nextId = bookings.length + 1;
    const paddedId = String(nextId).padStart(4, "0");
    const generatedBookingNumber = `BK-2026-${paddedId}`;

    const newBookingFull = {
      id: nextId,
      bookingNumber: generatedBookingNumber,
      ...newReservationData,
    };

    setBookings([newBookingFull, ...bookings]);
    setIsModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">
        
        {/* Live Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Ins</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">14</h3>
            </div>
          </button>

          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Outs</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">9</h3>
            </div>
          </button>

          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-House Today</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">32</h3>
            </div>
          </button>
        </div>

        {/* Master Control Layout & Data Structure Block */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          
          {/* Controls Unified Row Frame */}
          <div className="flex items-center gap-3">
            
            {/* Search Input Box */}
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search visible columns..."
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            {/* Room Type Dropdown */}
            <div className="h-11">
              <select className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]">
                <option>All Room Types</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Executive Room</option>
                <option>Suite</option>
                <option>Villa</option>
              </select>
            </div>

            {/* Date Picker Input */}
            <div className="h-11">
              <input
                type="date"
                value={selectedDate}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  console.log("Selected Check-In Date:", e.target.value);
                }}
              />
            </div>

            {/* Spacer pushing following tools tightly to the right margin */}
            <div className="flex-1" />

            {/* Export Trigger */}
            <div className="h-11">
              <button className="h-full px-4 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95">
                <FaFileExport className="text-slate-400 text-sm" />
                <span>Export</span>
              </button>
            </div>

            {/* Add New Trigger */}
            <div className="h-11">
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-full px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <FaPlus className="text-sm" />
                <span>Add New</span>
              </button>
            </div>

          </div>

          {/* Interactive Data Table Matrix */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Res Number</th>
                  <th className="px-5 py-3.5">Guest Name</th>
                  <th className="px-5 py-3.5">Room</th>
                  <th className="px-5 py-3.5">Room Type</th>
                  <th className="px-5 py-3.5">Check-In</th>
                  <th className="px-5 py-3.5">Check-Out</th>
                  <th className="px-5 py-3.5 text-center">Nights</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 text-slate-500 font-medium font-mono">{booking.id}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-900 tracking-tight">{booking.bookingNumber}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{booking.guestName}</td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-700">{booking.roomNumber}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.roomType}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{booking.checkIn}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{booking.checkOut}</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-700">{booking.nights}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.source}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-slate-900">{booking.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <AddReservation 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveReservation} 
      />
    </AdminLayout>
  );
}