import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import Footer from "../components/Footer";

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call - Replace with your actual loginUser service
      const result = { token: "sample_token" };

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Connection failed. Check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-main-content">
        {/* Left Section: Diagonal Branding */}
        <div className="login-left">
          <div className="branding-content">
            <span className="badge">MANAGEMENT SYSTEM v2.0</span>
            <h1>
              Elitech <span className="accent">Mart</span>
            </h1>
            <p>
              Professional hardware inventory & smart analytics for modern
              retail operations.
            </p>
          </div>
          {/* Subtle decorative circle for depth */}
          <div className="decorative-circle"></div>
        </div>

        {/* Right Section: Clean Login Card */}
        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="login-header">
              <h2>Welcome Back</h2>
              {/* <p>Securely log in to manage your inventory.</p> */}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="input-group">
              <label htmlFor="identifier">Username or Email</label>
              <input
                id="identifier"
                type="text"
                placeholder="elikem@elitech.com"
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
              {isLoading ? (
                <span className="loader-text">Authenticating...</span>
              ) : (
                "Access Dashboard"
              )}
            </button>

            <div className="form-footer">
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>

    
    </div>
  );
}
