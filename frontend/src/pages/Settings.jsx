
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  Palette,
  Sun,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

function Settings() {
  const { theme, toggleTheme, logout } = useAuth();
const navigate = useNavigate();

const [weightUnit, setWeightUnit] = useState(
  () => localStorage.getItem("weightUnit") || "kg"
);

const [heightUnit, setHeightUnit] = useState(
  () => localStorage.getItem("heightUnit") || "cm"
);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(passwordData.newPassword)) {
      setError(
        "Password must contain at least 8 characters, uppercase, lowercase, number and special character (@$!%*?&)."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage(response.data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelPasswordChange = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setMessage("");
  };

  const handleWeightUnit = (e) => {
  setWeightUnit(e.target.value);
  localStorage.setItem("weightUnit", e.target.value);
};

const handleHeightUnit = (e) => {
  setHeightUnit(e.target.value);
  localStorage.setItem("heightUnit", e.target.value);
};

const handleLogout = () => {
  const confirmed = window.confirm(
    "Are you sure you want to logout?"
  );

  if (confirmed) {
    logout();
    navigate("/login", { replace: true });
  }
};

  return (
    <div className="page-container settings-page">
      <h1>Settings</h1>
      <p>Manage your application preferences and account.</p>

      {/* Appearance */}
      <div className="settings-card">
        <div className="settings-heading">
          <Palette size={22} />
          <div>
            <h2>Appearance</h2>
            <p>Customize how FitTrack looks.</p>
          </div>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            <div>
              <h3>Dark Mode</h3>
              <p>Switch between light and dark appearance.</p>
            </div>
          </div>

          <button
            className={`theme-toggle ${theme === "dark" ? "enabled" : ""}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={theme === "dark"}
          >
            <span />
          </button>
        </div>

        <div className="theme-status">
          Current theme:{" "}
          <strong>
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </strong>
        </div>
      </div>

      {/* Security */}
      <div className="settings-card">
        <div className="settings-heading">
          <ShieldCheck size={22} />
          <div>
            <h2>Security</h2>
            <p>Manage your account security.</p>
          </div>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <Lock size={20} />
            <div>
              <h3>Change Password</h3>
              <p>Update your account password securely.</p>
            </div>
          </div>

          <button
            className="settings-action-btn"
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              setError("");
              setMessage("");
            }}
          >
            {showPasswordForm ? "Close" : "Change"}
            <ChevronRight size={16} />
          </button>
        </div>

        {message && (
          <p className="settings-success">{message}</p>
        )}

        {error && (
          <p className="auth-error">{error}</p>
        )}

        {showPasswordForm && (
          <form
            className="password-form"
            onSubmit={handlePasswordSubmit}
          >
            <label>Current Password</label>
            <div className="settings-password-input">
              <input
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <label>New Password</label>
            <div className="settings-password-input">
              <input
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <label>Confirm New Password</label>
            <div className="settings-password-input">
              <input
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPasswords ? "Hide Passwords" : "Show Passwords"}
            </button>

            <p className="password-hint">
              Minimum 8 characters with uppercase, lowercase, number
              and special character (@$!%*?&).
            </p>

            <div className="password-actions">
              <button
                type="submit"
                className="refresh-btn"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                className="settings-cancel-btn"
                onClick={cancelPasswordChange}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Workout Preferences */}
<div className="settings-card">
  <div className="settings-heading">
    <SlidersHorizontal size={22} />
    <div>
      <h2>Workout Preferences</h2>
      <p>Customize your fitness measurements.</p>
    </div>
  </div>

  <div className="settings-option">
    <div>
      <h3>Weight Unit</h3>
      <p>Choose your preferred weight measurement.</p>
    </div>

    <select
      className="settings-select"
      value={weightUnit}
      onChange={handleWeightUnit}
    >
      <option value="kg">Kilograms (kg)</option>
      <option value="lbs">Pounds (lbs)</option>
    </select>
  </div>

  <div className="settings-option">
    <div>
      <h3>Height Unit</h3>
      <p>Choose your preferred height measurement.</p>
    </div>

    <select
      className="settings-select"
      value={heightUnit}
      onChange={handleHeightUnit}
    >
      <option value="cm">Centimeters (cm)</option>
      <option value="ft">Feet (ft)</option>
    </select>
  </div>
</div>

     {/* Account */}
<div className="settings-card">
  <div className="settings-heading">
    <LogOut size={22} />
    <div>
      <h2>Account</h2>
      <p>Manage your FitTrack account.</p>
    </div>
  </div>

  <div className="settings-option">
    <div>
      <h3>Logout</h3>
      <p>Securely sign out of your account.</p>
    </div>

    <button
      className="logout-btn"
      onClick={handleLogout}
    >
      <LogOut size={16} />
      Logout
    </button>
  </div>
</div>
    </div>
  );
}

export default Settings;
