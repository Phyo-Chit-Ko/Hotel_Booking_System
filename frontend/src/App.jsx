import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./admin/pages/Dashboard";
import RoomTypeManagement from "./admin/pages/RoomTypeManagement";
import RoomManagement from "./admin/pages/RoomManagement";
import GuestManagement from "./admin/pages/GuestManagement";
import ReservationManagement from "./admin/pages/ReservationManagement";
import AvailableRooms from "./admin/pages/Available_rooms";
import UserManagement from "./admin/pages/UserManagement";
import Bookings from "./admin/pages/Bookings";
import Payments from "./admin/pages/Payments";
import ExtraServices from "./admin/pages/ExtraServices";
import Settings from "./admin/pages/Settings";
function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/dashboard" />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/rooms"
        element={<RoomManagement />}
      />

      <Route path="/available_rooms" element={<AvailableRooms />} />
      

      <Route
        path="/room-types"
        element={<RoomTypeManagement />}
      />
      <Route path="/guests" element={<GuestManagement />} />
      <Route path="/reservations" element={<ReservationManagement />} />
      <Route path="/user_management" element={<UserManagement />} />
      <Route path="/bookings" element={<Bookings/>}/>
      <Route path="/payments" element={<Payments/>}/>
      <Route path="/extraServices" element={<ExtraServices/>}/>
      <Route path="/settings" element={<Settings/>}/>
    </Routes>
  );
}

export default App;