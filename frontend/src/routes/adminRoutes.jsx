import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../admin/pages/Dashboard";
import RoomTypeManagement from "../admin/pages/RoomTypeManagement";
import RoomManagement from "../admin/pages/RoomManagement";
import GuestManagement from "../admin/pages/GuestManagement";
import ReservationManagement from "../admin/pages/ReservationManagement";
import UserManagement from "../admin/pages/UserManagement";
import Bookings from "../admin/pages/Bookings";
import Payments from "../admin/pages/Payments";
import ExtraServices from "../admin/pages/ExtraServices";
import Settings from "../admin/pages/Settings";
import RestaurantManagement from "../admin/pages/RestaurantManagement";
import Reports from "../admin/pages/Reports";
import '../admin/admin.css';

function AdminRoutes() {
  return (
    <div className="admin-layout">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* Viewable by any authenticated role — admin and receptionist see
            the data read-only, only manager gets write controls (see
            canWrite checks inside each page), enforced server-side too. */}
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="room-types" element={<RoomTypeManagement />} />
        <Route path="guests" element={<GuestManagement />} />
        <Route path="reservations" element={<ReservationManagement />} />
        <Route
          path="user_management"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="extraServices" element={<ExtraServices />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="restaurant"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <RestaurantManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default AdminRoutes;