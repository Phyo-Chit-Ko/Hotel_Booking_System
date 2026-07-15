import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes";
import UserRoutes from "./routes/userRoutes";
import Profile from "./user/pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForceChangePassword from "./user/pages/ForceChangePassword";
 import MyBookings from "./user/pages/MyBookings";
 import ForgotPassword from "./user/pages/ForgotPassword";
 import VerifyEmail from "./user/pages/VerifyEmail";
 import GoogleSuccess from "./user/pages/GoogleSuccess";
 import Account from "./user/pages/Account"; // Adjust the path based on your folder structure





function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "receptionist"]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/force-change-password"
        element={
          <ProtectedRoute>
            <ForceChangePassword />
          </ProtectedRoute>
        }
      />
      <Route path="/*" element={<UserRoutes />} />

      <Route path="/account" element={<Account />} />

       <Route 
  path="/my-bookings" 
  element={<MyBookings />} 
/>  

      <Route path="/forgot-password" element={<ForgotPassword />} />

       <Route 
      path="/verify-email"
      element={<VerifyEmail/>}
      />

      // Change path from "/google-success" to "/auth/success"
<Route path="/auth/success" element={<GoogleSuccess />} />

  
    </Routes>
  );
}

export default App;

