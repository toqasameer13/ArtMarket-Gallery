import { createContext, useContext, useState, useEffect } from "react";
import jwt_decode from 'jwt-decode';

import { 
  getUser, 
  getUsers, 
  addUser, 
  getUserByUsername,
  setCurrentUser, 
  getCurrentUser,
  removeCurrentUser
} from "../utils/localStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // user = { id, username, role, status? }

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = sessionStorage.getItem("accessToken");
      const expiresAt = sessionStorage.getItem("expiresAt");

      if (!token || !expiresAt) return;

      const expiry = new Date(expiresAt);
      const now = new Date();
      console.log("Current time:", now);

      const timeLeft = expiry - now;
      console.log("⌛ Time left (ms):", timeLeft);
      if (timeLeft < 2 * 60 * 1000 && timeLeft > 0) {
        console.log("refresh");
        refreshToken();
      }
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const response = await fetch("https://localhost:7222/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error("Invalid credentials or your account may not be approved yet.");
      }

      const { token, expiresAt, refreshToken, status,email} = JSON.parse(text);
      console.log("✅ Token", token);
      console.log("✅ expiresAt", expiresAt);
      const decoded = jwt_decode(token);
      const userFromToken = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        status: status,
        email:email
      };
      //console.log("id:", userFromToken.id);
      //console.log("username:", userFromToken.username);
      //console.log("role::", userFromToken.role);

      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("refreshToken", refreshToken);  
      sessionStorage.setItem("expiresAt", expiresAt);
      localStorage.setItem("currentUser", JSON.stringify(userFromToken));
      setUser(userFromToken);

      return true;
    } catch (error) {
      console.error("Login failed:", error.message);
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("❌ No refresh token found.");
        return;
      }
  
      const res = await fetch("https://localhost:7222/api/Auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          RefreshToken: refreshToken, 
        }),
        credentials: "include", 
      });
  
      if (!res.ok) throw new Error("Failed to refresh token");
  
      const data = await res.json(); 
  
  
      const { token, expiresAt: newExpiresAt, status, refreshToken: newRefreshToken ,email} = data;
  
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("refreshToken", newRefreshToken); // تحديث الـ RefreshToken
      sessionStorage.setItem("expiresAt", newExpiresAt);
  
      const decoded = jwt_decode(token);
      const userFromToken = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        status: status,
        email :email
      };
  
      localStorage.setItem("currentUser", JSON.stringify(userFromToken));
      setUser(userFromToken);
  
      console.log("✅ Token refreshed successfully.");
    } catch (err) {
      console.error("❌ Failed to refresh token:", err.message || err);
      setUser(null);
      removeCurrentUser();
      sessionStorage.clear();
      localStorage.removeItem("currentUser");
    }
  };
  
  

  const register = async (userData) => {
    try {
      const res = await fetch("https://localhost:7222/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Registration failed.";

        if (errorText.includes("IX_AspNetUsers_Email")) {
          errorMessage = "This email is already in use.";
        } else if (errorText.includes("IX_AspNetUsers_UserName")) {
          errorMessage = "This username is already taken.";
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            // Ignore
          }
        }

        return { success: false, message: errorMessage };
      }

      return { success: true };

    } catch (err) {
      return { success: false, message: err.message };
    }
  };
  const logout = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
  
      const response = await fetch("https://localhost:7222/api/Auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        credentials: "include", 
      });
  
      if (response.ok) {
        console.log("Successfully logged out");  
      } else {
        const errorData = await response.json();
        console.log("Logout failed:", errorData.message);
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    } finally {
      setUser(null); 
      removeCurrentUser(); 
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("expiresAt");
      localStorage.removeItem("currentUser");
    }
  };
  
  

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
