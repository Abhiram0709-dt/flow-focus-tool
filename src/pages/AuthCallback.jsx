import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getCurrentUser } from "@/api/serverApi";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      console.log("OAuth Callback - Token:", token?.substring(0, 20) + "...");
      console.log("OAuth Callback - Error:", error);

      if (error) {
        toast.error("Authentication failed. Please try again.");
        navigate("/login");
        return;
      }

      if (token) {
        try {
          console.log("Storing token...");
          // Store the token
          localStorage.setItem("authToken", token);
          
          console.log("Fetching user data...");
          // Fetch user info
          const userData = await getCurrentUser();
          console.log("User data received:", userData);
          localStorage.setItem("user", JSON.stringify(userData));
          
          toast.success("Logged in successfully!");
          
          console.log("Redirecting to homepage...");
          // Use window.location to force a full page reload
          // This ensures AuthContext re-initializes with the new token
          window.location.href = "/";
        } catch (error) {
          console.error("Failed to fetch user:", error);
          toast.error("Failed to complete authentication");
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      } else {
        console.log("No token found, redirecting to login");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

