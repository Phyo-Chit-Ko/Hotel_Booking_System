import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import RoomTypeManagement from "./pages/RoomTypeManagement";
import RoomManagement from "./pages/RoomManagement";
import GuestManagement from "./pages/GuestManagement";
import ReservationManagement from "./pages/ReservationManagement";
import AvailableRooms from "./pages/Available_rooms";
import UserManagement from "./pages/UserManagement";
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
    </Routes>
  );
}

export default App;