import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "../user/components/navbar";
import Footer from "../user/components/Footer";

import Home from "../user/pages/Home";
import About from "../user/pages/About";
import Rooms from "../user/pages/Rooms";
import Gallery from "../user/pages/Gallery";
import Restaurant from "../user/pages/Restaurant";
import Contact from "../user/pages/Contact";
import Account from "../user/pages/Account";
import Register from "../user/pages/Register";
import '../user/user.css';
// Admin pages accessible to receptionist/manager via user side
import AvailableRooms from "../admin/pages/Available_rooms";
import ReservationManagement from "../admin/pages/ReservationManagement";

function UserRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          {/* <Route
            path="/available_rooms"
            element={
              <ProtectedRoute allowedRoles={["receptionist", "manager"]}>
                <AvailableRooms />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={["receptionist", "manager"]}>
                <ReservationManagement />
              </ProtectedRoute>
            }
          /> */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

export default UserRoutes;