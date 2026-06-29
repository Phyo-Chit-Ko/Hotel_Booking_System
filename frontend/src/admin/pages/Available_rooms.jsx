import React, { useState } from "react";

import AdminLayout from "../layouts/AdminLayout";

import { FaBed, FaUsers, FaBuilding, FaBroom, FaLayerGroup, FaUserCircle, FaCalendarAlt } from "react-icons/fa";

// Import your new form component

import MakeWalkInReservation from "../components/makeWalkInReservation";



// 1. Definition of Room Types & Specs (Updated with IDs for database alignment)

const ROOM_TYPES = {

  SUP: { id: 1, name: "Superior Room", capacity: 2, rate: 120.0 },

  DS:  { id: 2, name: "Deluxe Suite", capacity: 4, rate: 240.0 },

  JS:  { id: 3, name: "Junior Suite", capacity: 3, rate: 180.0 },

  PRES:{ id: 4, name: "Presidential Suite", capacity: 6, rate: 650.0 }

};



export default function AvailableRooms() {

  const [activeFloor, setActiveFloor] = useState(2);

  const [selectedRoom, setSelectedRoom] = useState(null);

 

  // State hook to handle the visibility toggle of your new reservation form modal

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);



  // 2. Real-time Statuses of Rooms on Floor 2 with Guest Metadata for Occupied Units

  const [rooms] = useState({

    // Left Vertical Column

    "201": { type: "SUP", status: "Available" },

    "202": { type: "SUP", status: "Cleaning" },

    "203": {

      type: "SUP",

      status: "Occupied",

      guest: { name: "Alex Mercer", checkIn: "2026-06-12", checkOut: "2026-06-16" }

    },

    "204": { type: "SUP", status: "Available" },

    "205": { type: "SUP", status: "Reserved" },

    "207": { type: "SUP", status: "Available" },

    "208": { type: "SUP", status: "Available" },

    "209": {

      type: "SUP",

      status: "Occupied",

      guest: { name: "Sarah Jenkins", checkIn: "2026-06-10", checkOut: "2026-06-15" }

    },

    "234": { type: "SUP", status: "Available" },

   

    // Bottom Horizontal Wing (Top Row)

    "235": { type: "SUP", status: "Available" },

    "236": { type: "SUP", status: "Available" },

    "237": { type: "PRES", status: "Reserved" },



    // Bottom Horizontal Wing (Bottom Row)

    "229": { type: "SUP", status: "Available" },

    "230": { type: "SUP", status: "Cleaning" },

    "231": { type: "SUP", status: "Available" },

    "232": { type: "SUP", status: "Available" },

    "233": {

      type: "SUP",

      status: "Occupied",

      guest: { name: "David Miller", checkIn: "2026-06-14", checkOut: "2026-06-19" }

    },



    // Right Vertical Column

    "218": { type: "SUP", status: "Available" },

    "219": { type: "SUP", status: "Available" },

    "220": {

      type: "SUP",

      status: "Occupied",

      guest: { name: "Elena Rostova", checkIn: "2026-06-11", checkOut: "2026-06-14" }

    },

    "221": { type: "SUP", status: "Available" },

    "222": { type: "SUP", status: "Cleaning" },

    "223": { type: "SUP", status: "Available" },

    "224": { type: "DS", status: "Available" },

    "226": { type: "SUP", status: "Available" },

    "227": { type: "SUP", status: "Available" },

    "228": {

      type: "SUP",

      status: "Occupied",

      guest: { name: "Marcus Vance", checkIn: "2026-06-13", checkOut: "2026-06-17" }

    },

    "235_R": { type: "JS", status: "Available", customId: "235" },

    "236_R": { type: "JS", status: "Available", customId: "236" },

    "237_R": { type: "JS", status: "Available", customId: "237" },

  });



  // 3. Grid Coordinates Blueprint Engine (11 cols x 14 rows)

  const architecturalGrid = [

    // --- AMENITIES ---

    { type: "pool", label: "Pool", gridArea: "2/2/6/5" },

    { type: "gym", label: "GYM", gridArea: "6/5/7/6" },

    { type: "elevator", label: "Elevator", gridArea: "10/5/12/6" },



    // --- WALKWAYS ---

    { type: "walkway", label: "WalkWay", gridArea: "1/6/15/7", vertical: true },

    { type: "walkway", label: "WalkWay", gridArea: "13/1/14/6", vertical: false },



    // --- LEFT COLUMN ROOMS ---

    { type: "room", id: "201", gridArea: "1/5/2/6" },

    { type: "room", id: "202", gridArea: "2/5/3/6" },

    { type: "room", id: "203", gridArea: "3/5/4/6" },

    { type: "room", id: "204", gridArea: "4/5/5/6" },

    { type: "room", id: "205", gridArea: "5/5/6/6" },

    { type: "room", id: "207", gridArea: "7/5/8/6" },

    { type: "room", id: "208", gridArea: "8/5/9/6" },

    { type: "room", id: "209", gridArea: "9/5/10/6" },

    { type: "room", id: "234", gridArea: "12/5/13/6" },



    // --- BOTTOM WING CORES (Top Row) ---

    { type: "room", id: "235", gridArea: "12/4/13/5" },

    { type: "room", id: "236", gridArea: "12/3/13/4" },

    { type: "room", id: "237", gridArea: "12/1/13/3" },



    // --- BOTTOM WING CORES (Bottom Row) ---

    { type: "room", id: "229", gridArea: "14/5/15/6" },

    { type: "room", id: "230", gridArea: "14/4/15/5" },

    { type: "room", id: "231", gridArea: "14/3/15/4" },

    { type: "room", id: "232", gridArea: "14/2/15/3" },

    { type: "room", id: "233", gridArea: "14/1/15/2" },



    // --- RIGHT COLUMN ROOMS ---

    { type: "room", id: "218", gridArea: "1/7/2/8" },

    { type: "room", id: "219", gridArea: "2/7/3/8" },

    { type: "room", id: "220", gridArea: "3/7/4/8" },

    { type: "room", id: "221", gridArea: "4/7/5/8" },

    { type: "room", id: "222", gridArea: "5/7/6/8" },

    { type: "room", id: "223", gridArea: "6/7/7/8" },

    { type: "room", id: "224", gridArea: "7/7/9/8" },

    { type: "room", id: "226", gridArea: "9/7/10/8" },

    { type: "room", id: "227", gridArea: "10/7/11/8" },

    { type: "room", id: "228", gridArea: "11/7/12/8" },

    { type: "room", id: "235_R", gridArea: "12/7/13/8" },

    { type: "room", id: "236_R", gridArea: "13/7/14/8" },

    { type: "room", id: "237_R", gridArea: "14/7/15/8" },

  ];



  const getCellStyles = (roomId, isSelected) => {

    const base = "border border-slate-400 flex flex-col justify-center items-center text-center transition-all cursor-pointer select-none font-sans text-xs font-medium ";

    const room = rooms[roomId];

   

    if (!room) return base + "bg-white";

    if (isSelected) return base + "!bg-slate-950 !text-white z-10 shadow-md ring-2 ring-slate-900";

   

    switch (room.status) {

      case "Available":

        return base + "bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold";

      case "Occupied":

        return base + "bg-rose-200 hover:bg-rose-300 text-rose-900";

      case "Cleaning":

        return base + "bg-amber-200 hover:bg-amber-300 text-amber-900";

      case "Reserved":

        return base + "bg-indigo-200 hover:bg-indigo-300 text-indigo-900";

      default:

        return base + "bg-white text-slate-800";

    }

  };



  const handleOpenGuestProfile = (guestName) => {

    alert(`Opening detailed profile view for: ${guestName}`);

  };



  return (

    <AdminLayout>

      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">

       

        {/* Header Summary Dashboard */}

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>

            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">

              <FaBuilding className="text-slate-500" /> Floor Allocation Matrix

            </h1>

            <p className="text-xs text-slate-500 mt-0.5">Pixel-perfect map aligned to floor blueprints.</p>

          </div>



          <div className="flex flex-wrap gap-3 text-[11px] font-bold">

            <span className="px-2 py-0.5 rounded bg-emerald-400 text-emerald-950">Available</span>

            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900">Occupied</span>

            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900">Cleaning</span>

            <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">Reserved</span>

          </div>

         

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">

            {[1, 2, 3, 4].map((f) => (

              <button

                key={f}

                disabled={f !== 2}

                onClick={() => setActiveFloor(f)}

                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${

                  activeFloor === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 cursor-not-allowed"

                }`}

              >

                <FaLayerGroup size={12} /> Flr {f}

              </button>

            ))}

          </div>

        </div>



        {/* Layout Splitter */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

         

          {/* Overflow Container Viewport */}

          <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">

            <div className="min-w-full flex justify-start xl:justify-center p-2">

             

              {/* Grid Sheet Component Mapping */}

              <div

                className="grid bg-white select-none border border-slate-400 box-border"

                style={{

                  display: "grid",

                  gridTemplateColumns: "repeat(11, minmax(65px, 75px))",

                  gridAutoRows: "40px",

                  width: "max-content"

                }}

              >

                {architecturalGrid.map((cell, index) => {

                  if (cell.type === "walkway") {

                    return (

                      <div

                        key={`walk-${index}`}

                        className="border border-slate-400 bg-slate-100 text-slate-500 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center p-1"

                        style={{ gridArea: cell.gridArea }}

                      >

                        <span className={cell.vertical ? "vertical-text" : "tracking-wider text-center"}>

                          {cell.label}

                        </span>

                      </div>

                    );

                  }



                  if (cell.type === "pool" || cell.type === "gym" || cell.type === "elevator") {

                    return (

                      <div

                        key={`amenity-${index}`}

                        className="border border-slate-400 bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center"

                        style={{ gridArea: cell.gridArea }}

                      >

                        {cell.label}

                      </div>

                    );

                  }



                  const roomMeta = rooms[cell.id];

                  if (!roomMeta) return null;



                  const isSelected = selectedRoom?.dbId === cell.id;

                  const displayId = roomMeta.customId || cell.id.replace("_R", "");



                  return (

                    <div

                      key={cell.id}

                      style={{ gridArea: cell.gridArea }}

                      className={getCellStyles(cell.id, isSelected)}

                      onClick={() => setSelectedRoom({ dbId: cell.id, id: displayId, ...roomMeta, ...ROOM_TYPES[roomMeta.type], typeId: ROOM_TYPES[roomMeta.type].id })}

                    >

                      <span className="text-[10px] uppercase font-bold leading-none block opacity-75 mb-0.5">

                        {roomMeta.type.toLowerCase()}

                      </span>

                      <span className="text-xs font-semibold leading-none tracking-tight">

                        ({displayId})

                      </span>

                    </div>

                  );

                })}

              </div>



            </div>

          </div>



          {/* Sidebar Inspector Panel */}

          <div className="lg:col-span-4 bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800">

            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">

              <span className={`w-2 h-2 rounded-full ${selectedRoom ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>

              Unit Inspector

            </h3>



            {selectedRoom ? (

              <div className="space-y-5">

                <div className="border-b border-slate-800 pb-3">

                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Selected Block</span>

                  <h2 className="text-2xl font-black tracking-tight mt-0.5">Room {selectedRoom.id}</h2>

                </div>



                {/* Conditional Stay Summary Sub-Card for Occupied Status */}

                {selectedRoom.status === "Occupied" && selectedRoom.guest && (

                  <div className="bg-rose-950/40 border border-rose-900/50 p-3.5 rounded-xl space-y-3">

                    <div className="flex items-center gap-2">

                      <FaUserCircle className="text-rose-400 text-lg" />

                      <div>

                        <p className="text-[10px] uppercase font-black tracking-wider text-rose-300 leading-none">Current Resident</p>

                        <p className="text-sm font-bold text-slate-100 mt-0.5">{selectedRoom.guest.name}</p>

                      </div>

                    </div>

                   

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-900/30 text-[11px]">

                      <div>

                        <span className="text-rose-300 block font-medium">Check-In:</span>

                        <span className="text-slate-200 font-mono font-bold flex items-center gap-1 mt-0.5">

                          <FaCalendarAlt className="text-[10px] opacity-60" /> {selectedRoom.guest.checkIn}

                        </span>

                      </div>

                      <div>

                        <span className="text-rose-300 block font-medium">Check-Out:</span>

                        <span className="text-slate-200 font-mono font-bold flex items-center gap-1 mt-0.5">

                          <FaCalendarAlt className="text-[10px] opacity-60" /> {selectedRoom.guest.checkOut}

                        </span>

                      </div>

                    </div>



                    <button

                      onClick={() => handleOpenGuestProfile(selectedRoom.guest.name)}

                      className="w-full mt-1 bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 text-[11px] font-bold py-2 px-3 rounded-lg border border-rose-800/60 transition-all active:scale-[0.98]"

                    >

                      View Guest Profile

                    </button>

                  </div>

                )}



                <div className="space-y-2 text-xs">

                  <div className="flex justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/30">

                    <span className="text-slate-400">Class Type</span>

                    <span className="font-bold text-slate-200">{selectedRoom.name} ({selectedRoom.type})</span>

                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/30">

                    <span className="text-slate-400">Base Cost</span>

                    <span className="font-bold text-amber-400">${selectedRoom.rate.toFixed(2)}/night</span>

                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/30">

                    <span className="text-slate-400">Capacity Limits</span>

                    <span className="font-bold text-slate-200 flex items-center gap-1"><FaUsers /> {selectedRoom.capacity} Guests</span>

                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/30">

                    <span className="text-slate-400">Live Status</span>

                    <span className={`font-black ${selectedRoom.status === 'Available' ? 'text-emerald-400' : selectedRoom.status === 'Occupied' ? 'text-rose-400' : 'text-slate-200'}`}>

                      {selectedRoom.status}

                    </span>

                  </div>

                </div>



                <div className="pt-1">

                  {/* Updated Interactive Action Button */}

                  <button

                    onClick={() => setIsBookingModalOpen(true)}

                    disabled={selectedRoom.status !== "Available"}

                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${

                      selectedRoom.status === "Available"

                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-[0.98]"

                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"

                    }`}

                  >

                    {selectedRoom.status === "Available" ? "Book Selected Unit" : `System Status Locked`}

                  </button>

                  {selectedRoom.status === "Cleaning" && (

                    <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-amber-400/80">

                      <FaBroom className="animate-spin" /> Housekeeping cleanup task is currently active.

                    </div>

                  )}

                </div>

              </div>

            ) : (

              <div className="py-12 text-center text-slate-500 space-y-2">

                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-700/30">

                  <FaBed size={16} />

                </div>

                <div className="max-w-[200px] mx-auto text-[11px]">

                  <p className="font-bold text-slate-400 uppercase tracking-wider">No Cell Selected</p>

                  <p className="text-slate-500 mt-1">Click a room cell container in the blueprint to review operations.</p>

                </div>

              </div>

            )}

          </div>



        </div>



      </div>



      {/* Conditional Modal Overlay Portal */}

      {isBookingModalOpen && selectedRoom && (

        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">

          <div className="w-full max-w-2xl my-auto">

            <MakeWalkInReservation

              selectedRoom={selectedRoom}

              onClose={() => setIsBookingModalOpen(false)}

              onSaveSuccess={() => {

                // Triggered post form submission hook

                console.log("Walk-in registration successfully finalized.");

              }}

            />

          </div>

        </div>

      )}



      <style>{`

        .vertical-text {

          writing-mode: vertical-rl;

          text-orientation: mixed;

          transform: rotate(180deg);

        }

      `}</style>

    </AdminLayout>

  );

}