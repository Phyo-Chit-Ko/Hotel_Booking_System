import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Import useSearchParams
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
export default function GoogleSuccess() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [searchParams] = useSearchParams(); // Hook to read URL query parameters

  // GoogleSuccess.jsx

// 1. Destructure the login function from useAuth
const { login } = useAuth(); 

useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
        navigate("/account");
        return;
    }

    // 2. Fetch the user details
    axios.get("API_BASE_URL/api/user", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((res) => {
        // 3. Extract user data
        const userData = res.data.user || res.data;

        // 4. Call the centralized login function
        // This automatically saves user and token to sessionStorage
        login(userData, token); 

        navigate("/home");
    })
    .catch((error) => {
        console.error("Auth error:", error);
        navigate("/account");
    });
}, [navigate, searchParams, login]); // Added login to dependency array
    return (
        <div style={{ height:"100vh", display:"flex", justifyContent:"center", alignItems:"center", fontSize:"24px" }}>
            Logging in...
        </div>
    );
}