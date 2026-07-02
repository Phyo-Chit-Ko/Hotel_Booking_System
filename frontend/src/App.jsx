import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes";
import UserRoutes from "./routes/userRoutes";
import Profile from "./user/pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
}

export default App;