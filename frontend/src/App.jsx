import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/adminRoutes";
import UserRoutes from "./routes/userRoutes";

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
}

export default App;