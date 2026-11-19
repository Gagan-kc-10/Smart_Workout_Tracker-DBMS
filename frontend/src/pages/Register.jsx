
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, UserPlus } from "lucide-react";

import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    fitnessLevel: "",
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

    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(formData.password)) {
  alert(
    "Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)."
  );
  return;
}

    try {
      setLoading(true);
      setError("");

      await registerUser(formData);

      alert("Registration successful! Please login.");

      navigate("/login", {
        state: { email: formData.email },
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

const maxDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

  return (
    <div className="auth-page">
      <div className="auth-card register-card">

        <div className="auth-brand">
          <Dumbbell size={35} />
          <h1>FitTrack</h1>
          <p>Create your fitness account</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="register-grid">

            <div>
              <label>First Name *</label>
              <input
                className="register-input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Last Name *</label>
              <input
                className="register-input"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="full-width">
              <label>Email Address *</label>
              <input
                className="register-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="full-width">
              <label>Password * (minimum 8 characters)</label>
              <input
                className="register-input"
                type="password"
                name="password"
                minLength="8"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Date of Birth</label>
              <input
                className="register-input"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={maxDate}
              />
            </div>

            <div>
              <label>Gender</label>
              <select
                className="register-input"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label>Height (cm)</label>
              <input
                className="register-input"
                type="number"
                name="height"
                min="1"
                step="0.01"
                value={formData.height}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Weight (kg)</label>
              <input
                className="register-input"
                type="number"
                name="weight"
                min="1"
                step="0.01"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label>Fitness Level</label>
              <select
                className="register-input"
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleChange}
              >
                <option value="">Select fitness level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?
          {" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
