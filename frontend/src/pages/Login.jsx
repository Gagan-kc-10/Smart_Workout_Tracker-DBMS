
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Mail, Lock, LogIn } from "lucide-react";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(formData);
      console.log("LOGIN RESPONSE:", response.data);
console.log("LOGIN USER:", response.data.user);
console.log("LOGIN ROLE:", response.data.user?.Role_Name);

      login(response.data);

const role = response.data.user.Role_Name;

if (role === "Admin") {
  navigate("/admin", { replace: true });
} else if (role === "Trainer") {
  navigate("/trainer", { replace: true });
} else if (role === "User") {
  navigate("/dashboard", { replace: true });
} else {
  navigate("/login", { replace: true });
}

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <Dumbbell size={35} />
          <h1>FitTrack</h1>
          <p>Smart Workout Tracker</p>
        </div>

        <div className="auth-heading">
          <h2>Welcome Back!</h2>
          <p>Sign in to continue your fitness journey.</p>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?
          {" "}
          <Link to="/register">Create Account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
