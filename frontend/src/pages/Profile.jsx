
import { useEffect, useState } from "react";
import {
  Pencil,
  Save,
  X,
  User,
  Mail,
  CalendarDays,
  Ruler,
  Scale,
  Dumbbell,
  Activity,
} from "lucide-react";

import { getProfile, updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { token, login } = useAuth();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date();

  const maxDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const formatUser = (data) => ({
    firstName: data.First_Name || "",
    lastName: data.Last_Name || "",
    email: data.Email || "",
    dateOfBirth: data.Date_of_Birth
      ? String(data.Date_of_Birth).slice(0, 10)
      : "",
    gender: data.Gender || "",
    height: data.Height ?? "",
    weight: data.Weight ?? "",
    fitnessLevel: data.Fitness_Level || "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.data.user);
      setFormData(formatUser(response.data.user));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await updateProfile(formData);
      const updatedUser = response.data.user;

      setUser(updatedUser);
      setFormData(formatUser(updatedUser));

      login({
        token,
        user: updatedUser,
      });

      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(formatUser(user));
    setEditing(false);
    setError("");
    setMessage("");
  };

  if (loading) {
    return <div className="page-container"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="page-container"><p>{error || "Profile unavailable."}</p></div>;
  }

  return (
    <div className="page-container profile-page">

      <div className="profile-page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal and fitness information.</p>
        </div>

        {!editing && (
          <button
            className="refresh-btn"
            onClick={() => {
              setMessage("");
              setError("");
              setEditing(true);
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {message && <div className="plan-message">{message}</div>}
      {error && <p className="auth-error">{error}</p>}

      {!editing ? (
        <div className="profile-content">

          <div className="profile-overview">
            <div className="profile-avatar">
              <User size={42} />
            </div>

            <div className="profile-identity">
              <h2>{user.First_Name} {user.Last_Name}</h2>
              <p>
                <Mail size={15} />
                {user.Email}
              </p>
              <span className="profile-level">
                {user.Fitness_Level || "Fitness level not set"}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <User size={20} />
              <h3>Personal Information</h3>
            </div>

            <div className="profile-details-grid">

              <div className="profile-detail">
                <CalendarDays />
                <div>
                  <span>Date of Birth</span>
                  <strong>
                    {user.Date_of_Birth
                      ? String(user.Date_of_Birth).slice(0, 10)
                      : "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-detail">
                <User />
                <div>
                  <span>Gender</span>
                  <strong>{user.Gender || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <Ruler />
                <div>
                  <span>Height</span>
                  <strong>
                    {user.Height != null ? `${user.Height} cm` : "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-detail">
                <Scale />
                <div>
                  <span>Weight</span>
                  <strong>
                    {user.Weight != null ? `${user.Weight} kg` : "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-detail">
                <Dumbbell />
                <div>
                  <span>Fitness Level</span>
                  <strong>{user.Fitness_Level || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <Activity />
                <div>
                  <span>Account</span>
                  <strong>Active Profile</strong>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="profile-edit-card">

          <div className="profile-section-title">
            <Pencil size={20} />
            <h3>Edit Personal Information</h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="register-grid">

              <div>
                <label>First Name</label>
                <input
                  className="register-input"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  className="register-input"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  className="register-input"
                  type="email"
                  name="email"
                  value={formData.email}
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
                  max={maxDate}
                  onChange={handleChange}
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
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label>Fitness Level</label>
                <select
                  className="register-input"
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleChange}
                >
                  <option value="">Select Fitness Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
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

            </div>

            <div className="profile-edit-actions">
              <button
                type="submit"
                className="refresh-btn"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default Profile;
