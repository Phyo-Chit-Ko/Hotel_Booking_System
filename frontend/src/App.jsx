import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes";
import UserRoutes from "./routes/userRoutes";
import Profile from "./user/pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForceChangePassword from "./user/pages/ForceChangePassword";

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
    </Routes>
  );
}

export default App;