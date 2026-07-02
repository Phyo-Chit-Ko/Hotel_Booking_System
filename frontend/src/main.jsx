import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // <--- ADD THIS LINE
import "./index.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:8000";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> {/* Now it will be defined */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);