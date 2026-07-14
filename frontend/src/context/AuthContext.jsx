import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => {
        return sessionStorage.getItem("auth_token");
    });


    useEffect(() => {
        console.log("Current Auth Token:", token);
    }, [token]);


   const login = (userData, authToken) => {

    console.log("Saving token:", authToken);

    setUser(userData);
    setToken(authToken);

    sessionStorage.setItem(
        "user",
        JSON.stringify(userData)
    );

    sessionStorage.setItem(
        "auth_token",
        authToken
    );

    console.log(
       "After save:",
       sessionStorage.getItem("auth_token")
    );
};


    const logout = () => {

    console.log("🚨 LOGOUT FUNCTION CALLED");

    console.trace();

    setUser(null);
    setToken(null);

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth_token");
};


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                token,
                setToken,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);