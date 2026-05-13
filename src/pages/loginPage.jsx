import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- add this import
import "../styles/LoginPage.css";
import loginUser from "../services/loginApi";
import Footer from "../components/Footer";

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // hook for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginUser(formData.identifier, formData.password);

      if (result?.token) {
        // Save token (for protected routes)
        localStorage.setItem("authToken", result.token);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError("Temporary pass.loggin in");
        setInterval(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Elitech Mart</h1>
        <p>Premium Hardware & Components</p>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Please enter your details
            </p>
          </div>

          {/* Error message */}
          {error && <div className="error-msg">{error}</div>}

          <div className="input-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              type="email"
              placeholder="e.g. alex@elitech.com"
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
