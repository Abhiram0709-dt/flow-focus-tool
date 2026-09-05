import { createContext, useContext, useState, useEffect } from "react";
import { signup, login, getCurrentUser } from "@/api/serverApi";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else if (storedUser) {
        // If we have stored user but no token, try to parse it
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleSignup = async (email, password, name, turnstileToken) => {
    const response = await signup({ email, password, name, turnstileToken });
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  };

  const handleLogin = async (email, password, turnstileToken) => {
    const response = await login({ email, password, turnstileToken });
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

