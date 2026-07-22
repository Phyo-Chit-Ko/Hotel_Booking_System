import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "../user/components/Navbar";
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

function UserRoutes() {
  // Desktop: sidebar starts visible. Mobile: starts collapsed (off-canvas),
  // so it doesn't flash open over the page on first load.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth > 992
  );

  return (
    <div className={`layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

export default UserRoutes;